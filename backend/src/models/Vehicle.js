const { db } = require('../config/firebase');

class Vehicle {
    constructor(data) {
        this._id = data._id || data.id;
        this.data = data;
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
    }

    static async find(query) {
        let ref = db.collection('vehicles');
        if (query.userId) ref = ref.where('userId', '==', query.userId);
        if (query.activo) ref = ref.where('activo', '==', query.activo);

        const snapshot = await ref.get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => new Vehicle({ _id: doc.id, ...doc.data() }));
    }

    static async countDocuments(query) {
        let ref = db.collection('vehicles');
        if (query.userId) ref = ref.where('userId', '==', query.userId);

        const snapshot = await ref.get();
        return snapshot.size;
    }

    static async findOne(query) {
        let ref = db.collection('vehicles');

        // Firestore lacks logical OR in simple queries for multiple fields, 
        // implies handling specific logic if needed.
        if (query.placa) ref = ref.where('placa', '==', query.placa);
        if (query.userId) ref = ref.where('userId', '==', query.userId);
        if (query.activo) ref = ref.where('activo', '==', query.activo);
        if (query.principal) ref = ref.where('principal', '==', query.principal);

        const snapshot = await ref.limit(1).get();
        if (snapshot.empty) return null;
        return new Vehicle({ _id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }

    static async findById(id) {
        const doc = await db.collection('vehicles').doc(id).get();
        if (!doc.exists) return null;
        return new Vehicle({ _id: doc.id, ...doc.data() });
    }

    static async create(data) {
        // Enforce validations here
        if (!data.placa || !data.userId) throw new Error('Placa and UserID required');

        // Check uniqueness of plate
        const existing = await this.findOne({ placa: data.placa });
        if (existing) throw new Error('Placa ya registrada');

        // Handle 'principal' logic
        if (data.principal) {
            await this.updateMany({ userId: data.userId }, { principal: false });
        }

        const id = db.collection('vehicles').doc().id;
        const vehicleData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estadisticas: {
                kilometrajeActual: 0,
                kilometrajeTotal: 0,
                viajesTotales: 0,
                horasUso: 0,
                consumoTotalCombustible: 0,
                costoTotalMantenimiento: 0,
                rendimientoPromedio: 0,
                costoPorKilometro: 0,
                ...data.estadisticas
            },
            activo: true,
            // Professional CPK Configuration
            costosFijos: {
                seguroAnual: 0,
                impuestosAnuales: 0, // Tenencia, matricula
                depreciacionAnual: 0, // Valor Auto * % Depreciacion
                sueldoConductorMensual: 0, // Si aplica
                planCelularMensual: 0,
                otrosMensuales: 0,
                ...data.costosFijos
            }
        };

        await db.collection('vehicles').doc(id).set(vehicleData);
        return new Vehicle({ _id: id, ...vehicleData });
    }

    static async findByIdAndUpdate(id, update, options = {}) {
        const ref = db.collection('vehicles').doc(id);
        const updateData = { ...update, updatedAt: new Date().toISOString() };

        // Flatten $set if coming from mongoose logic
        if (update.$set) {
            Object.assign(updateData, update.$set);
            delete updateData.$set;
        }

        await ref.update(updateData);
        if (options.new) {
            const doc = await ref.get();
            return new Vehicle({ _id: doc.id, ...doc.data() });
        }
        return true;
    }

    // Simulate mongoose updateMany
    static async updateMany(query, update) {
        const batch = db.batch();
        const docs = await this.find(query);

        docs.forEach(doc => {
            const ref = db.collection('vehicles').doc(doc._id);
            batch.update(ref, update);
        });

        await batch.commit();
    }

    // Instance methods
    async save() {
        if (!this._id) throw new Error('No ID');
        const dataToSave = { ...this };
        delete dataToSave._id;
        delete dataToSave.data;
        dataToSave.updatedAt = new Date().toISOString();

        await db.collection('vehicles').doc(this._id).set(dataToSave, { merge: true });
        return this;
    }

    getAlertas() {
        const alertas = [];
        const hoy = new Date();
        const { mantenimiento, seguro, estadisticas, alertas: configAlertas } = this;

        // Alert Logic (Copied from previous model)
        if (mantenimiento && mantenimiento.proximoServicio) {
            const proxDate = new Date(mantenimiento.proximoServicio);
            const diasRestantes = Math.ceil((proxDate - hoy) / (1000 * 60 * 60 * 24));

            if (diasRestantes <= (configAlertas?.mantenimiento?.diasAnticipacion || 30)) {
                alertas.push({
                    tipo: 'mantenimiento',
                    mensaje: `Próximo servicio en ${diasRestantes} días`,
                    prioridad: diasRestantes <= 7 ? 'alta' : 'media'
                });
            }
        }

        // More alert logic... (Simplified for brevity, can expand)

        return alertas;
    }
}

module.exports = Vehicle;
