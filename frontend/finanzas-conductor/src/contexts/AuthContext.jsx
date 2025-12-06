import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Simular carga inicial y verificar sesión persistente
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }

        const timer = setTimeout(() => {
            setLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const signUp = async (email, password, userData) => {
        try {
            // Simular registro exitoso
            const newUser = {
                uid: `user_${Date.now()}`,
                email,
                ...userData
            }
            setUser(newUser)
            localStorage.setItem('user', JSON.stringify(newUser))
            console.log('¡Cuenta creada exitosamente!')
            navigate('/dashboard')
            return { success: true }
        } catch (error) {
            console.error('Error al crear la cuenta')
            return { success: false, error: 'Error al crear cuenta' }
        }
    }

    const signIn = async (email, password) => {
        try {
            // Simular login exitoso
            const loggedUser = {
                uid: `user_${Date.now()}`,
                email,
                displayName: email.split('@')[0]
            }
            setUser(loggedUser)
            localStorage.setItem('user', JSON.stringify(loggedUser))
            console.log('¡Bienvenido!')
            navigate('/dashboard')
            return { success: true }
        } catch (error) {
            console.error('Credenciales incorrectas')
            return { success: false, error: 'Error al iniciar sesión' }
        }
    }

    const resetPassword = async (email) => {
        try {
            console.log('Correo de recuperación enviado a:', email)
            return { success: true }
        } catch (error) {
            console.error('Error al enviar correo de recuperación')
            return { success: false, error: 'Error al enviar correo' }
        }
    }

    const signOut = async () => {
        try {
            setUser(null)
            localStorage.removeItem('user')
            console.log('Sesión cerrada')
            navigate('/login')
            return { success: true }
        } catch (error) {
            console.error('Error al cerrar sesión')
            return { success: false, error: 'Error al cerrar sesión' }
        }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        logout: signOut,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
