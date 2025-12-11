import { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext.jsx';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data } = await client.get('/transactions?limite=50'); // Default limit
            setTransactions(data.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching transactions: ", err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTransactions();
        } else {
            setTransactions([]);
            setLoading(false);
        }
    }, [user]);

    const addTransaction = async (transaction) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            // Adaptar campos para el backend si es necesario
            // El backend usa 'tipo', 'monto', 'categoria', 'descripcion', 'fecha'
            // Y subdocumentos 'viaje' o 'gasto'

            const payload = {
                ...transaction,
                fecha: transaction.fecha || new Date().toISOString()
            };

            // Mapeo inteligente de campos
            if (transaction.tipo === 'gasto' && transaction.odómetro) {
                payload.gasto = {
                    ...payload.gasto,
                    odometro: transaction.odómetro
                };
            }

            if (transaction.tipo === 'ingreso') {
                // Ensure kmRecorridos is passed if present
                if (transaction.kmRecorridos) {
                    payload.kmRecorridos = transaction.kmRecorridos;
                    // Also populate viaje structure if needed strictly by backend logic
                    payload.viaje = {
                        ...payload.viaje,
                        distanciaKm: transaction.kmRecorridos,
                        // Defaults to satisfy legacy validations (if any)
                        origen: payload.viaje?.origen || 'Ubicación actual',
                        destino: payload.viaje?.destino || 'Destino'
                    };
                } else {
                    // Ensure viaje object exists for incomes even without km
                    payload.viaje = {
                        ...payload.viaje,
                        origen: payload.viaje?.origen || 'Ubicación actual',
                        destino: payload.viaje?.destino || 'Destino'
                    };
                }
            }

            const { data } = await client.post('/transactions', payload);
            await fetchTransactions(); // Refetch to update list
            return { success: true, data: data.data };


        } catch (err) {
            console.error("Error adding transaction: ", err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            await client.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t._id !== id));
            return { success: true };
        } catch (err) {
            console.error("Error deleting transaction: ", err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            loading,
            error,
            addTransaction,
            deleteTransaction,
            refreshTransactions: fetchTransactions
        }}>
            {children}
        </FinanceContext.Provider>
    );
};
