const { db } = require('../config/firebase');

class Shift {
    constructor(data) {
        this._id = data._id || data.id;
        this.data = data;
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
    }

    static async findOne(query) {
        let ref = db.collection('shifts');
        if (query.userId) ref = ref.where('userId', '==', query.userId);
        if (query.estado) ref = ref.where('estado', '==', query.estado);

        const snapshot = await ref.limit(1).get();
        if (snapshot.empty) return null;
        return new Shift({ _id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }

    static async create(data) {
        // Enforce single open shift
        const existing = await this.findOne({ userId: data.userId, estado: 'abierto' });
        if (existing) throw new Error('Ya tienes un turno abierto');

        const id = db.collection('shifts').doc().id;
        const shiftData = {
            ...data,
            fechaInicio: new Date().toISOString(),
            estado: 'abierto',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('shifts').doc(id).set(shiftData);
        return new Shift({ _id: id, ...shiftData });
    }

    async cerrarTurno(odometroFinal) {
        if (odometroFinal < this.odometroInicial) {
            throw new Error('Odómetro final menor al inicial');
        }

        const updates = {
            odometroFinal,
            fechaFin: new Date().toISOString(),
            estado: 'cerrado',
            totalKm: parseFloat((odometroFinal - this.odometroInicial).toFixed(1)),
            updatedAt: new Date().toISOString()
        };

        await db.collection('shifts').doc(this._id).update(updates);
        return { ...this, ...updates };
    }
}

module.exports = Shift;
