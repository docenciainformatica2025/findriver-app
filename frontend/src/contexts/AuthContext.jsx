import React, { createContext, useState, useContext, useEffect } from 'react';
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
                nombre: userInfo.nombre,
                email: email,
                rol: 'conductor'
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

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '1rem',
                            margin: '0 auto'
                        }}></div>
                        <p style={{ fontFamily: 'sans-serif', color: '#666' }}>Cargando FinDriver...</p>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
