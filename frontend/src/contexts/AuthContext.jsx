import React, { createContext, useState, useContext, useEffect } from 'react';
import CarLoader from '../components/CarLoader';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import client from '../api/client';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();

                    // Obtener perfil completo de MongoDB
                    const { data } = await client.get('/auth/verify-token');

                    let backendUser = data.data.user || {};

                    // FIX: Si el backend devuelve "Usuario Mock" (failsafe), preferimos el nombre de Firebase
                    if (backendUser.nombre === 'Usuario Mock' && firebaseUser.displayName) {
                        backendUser.nombre = firebaseUser.displayName;
                    }

                    setUser({
                        ...firebaseUser,
                        ...backendUser, // Merge MongoDB data (rol, configuracion, etc)
                        token
                    });
                } catch (error) {
                    console.error("Error syncing user", error);
                    // Si falla el backend, mantenemos al menos el usuario de firebase
                    // para no bloquear totalmente, pero idealmente deberíamos manejarlo
                    setUser({ ...firebaseUser, token: await firebaseUser.getIdToken() });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- Auto Logout Logic (Professional Feature) ---
    useEffect(() => {
        if (!user) return; // Only track signed-in users

        const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes
        let idleTimer;

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                toast.dismiss(); // Clear any existing toasts
                toast.error('Sesión cerrada por inactividad');
                logout(); // Call existing logout function
            }, TIMEOUT_MS);
        };

        // Events to track activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Optimize: throttle event listeners or just reset on any
        const handleActivity = () => resetTimer();

        events.forEach(event => document.addEventListener(event, handleActivity));

        // Start timer initially
        resetTimer();

        return () => {
            if (idleTimer) clearTimeout(idleTimer);
            events.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, [user]); // Re-run when user changes (login/logout)

    const signIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Inicio de sesión exitoso');
            return { success: true };
        } catch (error) {
            console.error(error);
            toast.error('Error al iniciar sesión: ' + error.message);
            return { success: false, error: error.message };
        }
    };

    const signUp = async (email, password, userInfo) => {
        try {
            // 1. Crear en Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Actualizar perfil Firebase
            await updateProfile(firebaseUser, {
                displayName: userInfo.nombre
            });

            // 3. Obtener token
            const token = await firebaseUser.getIdToken();

            // 4. Crear en MongoDB
            await client.post('/auth/register-firebase', {
                token,
                email: email,
                rol: 'conductor',
                ...userInfo // Send full profile data (phone, vehicle, etc.)
            });

            toast.success('Registro exitoso');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en signUp:', error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('El correo ya está registrado');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Contraseña muy débil');
            } else if (error.response) {
                // Error del backend
                console.error('❌ Error backend:', error.response.data);
                toast.error('Error del servidor: ' + (error.response.data?.error || error.message));
            } else if (error.request) {
                // Error de red (backend caído)
                console.error('❌ No hay respuesta del backend:', error.request);
                toast.error('Error de conexión con el servidor. ¿Está encendido?');
            } else {
                toast.error('Error: ' + error.message);
            }
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Sesión cerrada');
            return { success: true };
        } catch (error) {
            toast.error('Error al cerrar sesión');
            return { success: false, error: error.message };
        }
    };

    const updateUserProfile = async (data) => {
        try {
            // 1. Si hay cambio de nombre, actualizar Firebase
            if (data.nombre && auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: data.nombre
                });
            }

            // 2. Actualizar base de datos (MongoDB)
            const response = await client.put('/users/profile', data);

            // 3. Actualizar estado local
            if (response.data.success) {
                setUser(prev => ({
                    ...prev,
                    ...response.data.data
                }));
                return { success: true };
            } else {
                throw new Error(response.data.error || 'Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error updateProfile:', error);
            // Capturar error de respuesta del backend para mensaje claro
            const msg = error.response?.data?.error || error.message;
            toast.error('Error: ' + msg);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        updateProfile: updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <CarLoader />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
