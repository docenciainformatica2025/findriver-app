import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function IncomeForm() {
    const { addTransaction } = useFinance();
    const [platform, setPlatform] = useState('Uber');
    const [gross, setGross] = useState('');
    const [net, setNet] = useState('');
    const [kmDriven, setKmDriven] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!net) return;

        addTransaction({
            tipo: 'ingreso',
            monto: parseFloat(net), // Store Net as the main amount
            montoBruto: parseFloat(gross) || 0, // Optional extra field
            categoría: platform,
            odómetro: 0, // Income usually doesn't have absolute odometer, but we could track trip km
            distanciaViaje: parseFloat(kmDriven) || 0, // Custom field for trip distance
            fecha: new Date().toISOString()
        });

        setGross('');
        setNet('');
        setKmDriven('');
    };

    return (
        <div className="card" style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Registrar Ingreso</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-primary)', color: 'white', border: '1px solid var(--color-border)' }}
                    >
                        <option value="Uber">Uber</option>
                        <option value="DiDi">DiDi</option>
                        <option value="inDrive">inDrive</option>
                        <option value="Particular">Particular</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Ingreso Neto ($)"
                        value={net}
                        onChange={(e) => setNet(e.target.value)}
                        step="1"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-primary)', color: 'white', border: '1px solid var(--color-border)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                        type="number"
                        placeholder="Ingreso Bruto (Opcional)"
                        value={gross}
                        onChange={(e) => setGross(e.target.value)}
                        step="1"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-primary)', color: 'white', border: '1px solid var(--color-border)' }}
                    />
                    <input
                        type="number"
                        placeholder="Km Recorridos"
                        value={kmDriven}
                        onChange={(e) => setKmDriven(e.target.value)}
                        step="0.1"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-primary)', color: 'white', border: '1px solid var(--color-border)' }}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--color-success)' }}>
                    Registrar Ingreso
                </button>
            </form>
        </div>
    );
}
