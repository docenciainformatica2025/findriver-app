const { db } = require('../config/firebase');

class Transaction {
    constructor(data) {
        this._id = data._id || data.id;
        this.data = data;
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
    }

    static async find(query) {
        let ref = db.collection('transactions');

        // Apply filters
        if (query.userId) ref = ref.where('userId', '==', query.userId);
        if (query.tipo) ref = ref.where('tipo', '==', query.tipo);

        // Date range query needs careful composite index
        if (query.fecha) {
            if (query.fecha.$gte) ref = ref.where('fecha', '>=', query.fecha.$gte.toISOString());
            if (query.fecha.$lte) ref = ref.where('fecha', '<=', query.fecha.$lte.toISOString());
        }

        const snapshot = await ref.orderBy('fecha', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => new Transaction({ _id: doc.id, ...doc.data() }));
    }

    static async create(data) {
        const id = db.collection('transactions').doc().id;
        const txData = {
            ...data,
            fecha: data.fecha instanceof Date ? data.fecha.toISOString() : (data.fecha || new Date().toISOString()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // FinDriver Pro Fields
            plataforma: data.plataforma || 'particular', // enum: 'uber', 'didi', 'indrive', 'particular'
            kmRecorridos: Number(data.kmRecorridos) || 0, // Para calcular rendimiento por viaje
            tiempoMinutos: Number(data.tiempoMinutos) || 0
        };

        // Auto-calculate logic (efficiency)
        if (txData.tipo === 'ingreso' && txData.viaje) {
            const extras = txData.viaje.extras || {};
            const cost = (extras.peaje || 0) + (extras.estacionamiento || 0);
            if (cost > 0) {
                txData.rentabilidad = txData.monto / cost;
            }
        }

        try {
            console.log(`[Transaction] Attempting to save transaction ${id} for user ${txData.userId}`);
            await db.collection('transactions').doc(id).set(txData);
            console.log(`[Transaction] Success saving transaction ${id}`);
            return new Transaction({ _id: id, ...txData });
        } catch (error) {
            console.error(`[Transaction] ERROR saving transaction ${id}:`, error);
            throw error;
        }
    }

    static async getTransaccionesPaginadas(userId, page = 1, limit = 20, filtros = {}) {
        try {
            let ref = db.collection('transactions').where('userId', '==', userId);

            // Filters
            if (filtros.tipo && filtros.tipo !== 'todos') ref = ref.where('tipo', '==', filtros.tipo);
            if (filtros.categoria && filtros.categoria !== 'todos') ref = ref.where('categoria', '==', filtros.categoria);

            // Date Filters (Strict Validation)
            if (filtros.fechaInicio && !isNaN(new Date(filtros.fechaInicio))) {
                ref = ref.where('fecha', '>=', new Date(filtros.fechaInicio).toISOString());
            }
            if (filtros.fechaFin && !isNaN(new Date(filtros.fechaFin))) {
                ref = ref.where('fecha', '<=', new Date(filtros.fechaFin).toISOString());
            }

            // Safety limit to prevent memory overflow on "Fetch All"
            // We fetch slightly more than the requested page * limit to try to cover it, 
            // but for a true fix we need the composite index. 
            // For now, capping at 500 recent-ish docs (random order) is safer than crashing.
            // Ideally: await ref.orderBy('fecha', 'desc').limit(limit).get() -> Needs Index.

            const snapshot = await ref.limit(500).get();
            const totalDocs = snapshot.size;

            // Pagination (In-Memory Slicing)
            let allDocs = snapshot.docs.map(doc => new Transaction({ _id: doc.id, ...doc.data() }));

            // In-memory Sort
            allDocs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            // Handle bounds
            const paginatedDocs = allDocs.slice(startIndex, endIndex);

            return {
                transacciones: paginatedDocs,
                paginacion: {
                    total: totalDocs,
                    page: page,
                    pages: Math.ceil(totalDocs / limit) || 1,
                    limit: limit
                }
            };
        } catch (error) {
            console.error('[Transaction.getTransaccionesPaginadas] Error:', error);
            throw new Error(`Error getting transactions: ${error.message}`);
        }
    }

    // Aggregation replacement
    // Since firestore doesn't do complex aggregates, we fetch and reduce in JS
    static async getEstadisticasUsuario(userId, filtros = {}) {
        let ref = db.collection('transactions').where('userId', '==', userId);

        let startIso, endIso;
        if (filtros.fechaInicio) startIso = new Date(filtros.fechaInicio).toISOString();
        if (filtros.fechaFin) endIso = new Date(filtros.fechaFin).toISOString();

        if (startIso) ref = ref.where('fecha', '>=', startIso);
        if (endIso) ref = ref.where('fecha', '<=', endIso);

        const snapshot = await ref.get();
        const docs = snapshot.docs.map(d => d.data());

        // Process in Memory
        const totals = { ingresos: 0, gastos: 0, count: 0, viajes: 0 };
        const porCategoria = {};

        docs.forEach(tx => {
            totals.count++;
            if (tx.tipo === 'ingreso') {
                totals.ingresos += tx.monto || 0;
                totals.viajes++;
            } else {
                totals.gastos += tx.monto || 0;
            }

            const cat = tx.categoria || 'otros';
            if (!porCategoria[cat]) porCategoria[cat] = 0;
            porCategoria[cat] += tx.monto || 0;
        });

        // Simulating the full Mongo aggregation response structure
        return {
            totales: {
                totalIngresos: totals.ingresos,
                totalGastos: totals.gastos,
                totalTransacciones: totals.count,
                totalViajes: totals.viajes
            },
            porCategoria: Object.entries(porCategoria).map(([k, v]) => ({ _id: k, total: v })).sort((a, b) => b.total - a.total),
            // ... add other aggregations as needed
        };
    }
}

module.exports = Transaction;
