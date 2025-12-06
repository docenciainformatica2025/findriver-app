import { useCalculations } from '../hooks/useCalculations';

export default function Dashboard() {
    const {
        totalNet,
        totalFixed,
        totalVariable,
        cpk,
        profit,
        totalKm
    } = useCalculations();

    const formatCurrency = (val) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Ganancia Neta</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {formatCurrency(profit)}
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Costo por Km (CPK)</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-warning)' }}>
                        {formatCurrency(cpk)}
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Km Totales</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                        {totalKm.toFixed(1)} km
                    </p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Desglose de Costos</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Costos Fijos (Mensual)</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(totalFixed)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Costos Variables</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(totalVariable)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ingresos Totales</span>
                    <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>{formatCurrency(totalNet)}</span>
                </div>
            </div>
        </div>
    );
}
