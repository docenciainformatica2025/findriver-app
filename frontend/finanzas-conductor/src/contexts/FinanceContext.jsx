import { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { useAuth } from './AuthContext.jsx';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !db) {
            setTransactions([]);
            setLoading(false);
            if (!db) console.warn("Firestore not initialized (missing config). Finance data unavailable.");
            return;
        }

        try {
            const q = query(
                collection(db, 'transacciones'),
                where('usuarioId', '==', user.uid),
                orderBy('fecha', 'desc')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const docs = [];
                querySnapshot.forEach((doc) => {
                    docs.push({ id: doc.id, ...doc.data() });
                });
                setTransactions(docs);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching transactions: ", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Error setting up listener:", err);
            setLoading(false);
        }
    }, [user]);

    const addTransaction = async (transaction) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (!db) return { success: false, error: 'Database not initialized' };

        try {
            const newTransaction = {
                usuarioId: user.uid,
                fecha: new Date().toISOString(),
                ...transaction
            };
            await addDoc(collection(db, 'transacciones'), newTransaction);
            return { success: true };
        } catch (err) {
            console.error("Error adding transaction: ", err);
            return { success: false, error: err.message };
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return { success: false, error: 'No user logged in' };
        if (!db) return { success: false, error: 'Database not initialized' };

        try {
            await deleteDoc(doc(db, 'transacciones', id));
            return { success: true };
        } catch (err) {
            console.error("Error deleting transaction: ", err);
            return { success: false, error: err.message };
        }
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            loading,
            error,
            addTransaction,
            deleteTransaction
        }}>
            {children}
        </FinanceContext.Provider>
    );
};
