const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    constructor(data) {
        // Data should include _id if it exists
        this._id = data._id || data.id;
        this.data = data;

        // Expose properties directly for compatibility
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });

        // Ensure vehiculos is always an array
        if (!this.vehiculos) {
            this.vehiculos = [];
        }
    }

    get id() {
        return this._id;
    }

    static async findById(id) {
        try {
            const doc = await db.collection('users').doc(id).get();
            if (!doc.exists) {
                // FAILSAFE FOR MISSING USER IN DEV
                if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                    console.warn('⚠️ [User] Returning MOCK USER for findById (User Not Found in DB)');
                    return new User({
                        _id: id,
                        email: 'mock@example.com',
                        nombre: 'Usuario Mock',
                        rol: 'conductor',
                        activo: true,
                        verificado: true,
                        configuracion: { precioCombustible: 0, tema: 'claro' }
                    });
                }
                return null;
            }
            return new User({ _id: doc.id, ...doc.data() });
        } catch (err) {
            console.error('Error in User.findById:', err.message);
            // FAILSAFE: Return mock if DB fails in dev
            if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                console.warn('⚠️ [User] Returning MOCK USER (DB Unreachable)');
                return new User({
                    _id: id,
                    email: 'mock@example.com',
                    nombre: 'Usuario Mock',
                    rol: 'conductor',
                    activo: true,
                    verificado: true,
                    configuracion: { precioCombustible: 0, tema: 'claro' }
                });
            }
            throw err;
        }
    }

    static async findOne(query) {
        try {
            let ref = db.collection('users');

            // Build query
            if (query.email) {
                ref = ref.where('email', '==', query.email);
            }
            if (query.firebaseUid) {
                ref = ref.where('firebaseUid', '==', query.firebaseUid);
            } else if (query.resetPasswordToken) {
                ref = ref.where('resetPasswordToken', '==', query.resetPasswordToken);
            } else if (query.refreshToken) {
                ref = ref.where('refreshToken', '==', query.refreshToken);
            } else if (query.codigoVerificacion) {
                ref = ref.where('codigoVerificacion', '==', query.codigoVerificacion);
            }

            const snapshot = await ref.limit(1).get();
            if (snapshot.empty) {
                // FAILSAFE FOR EMPTY DB IN DEV
                if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                    console.warn('⚠️ [User] Returning MOCK USER for findOne (User Not Found in DB)');
                    return new User({
                        _id: 'mock_user_id',
                        email: query.email || 'mock@example.com',
                        nombre: 'Usuario Mock',
                        rol: 'conductor',
                        activo: true,
                        verificado: true,
                        configuracion: { precioCombustible: 0, tema: 'claro' }
                    });
                }
                return null;
            }

            return new User({ _id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } catch (err) {
            console.error('Error in User.findOne:', err.message);
            // FAILSAFE
            if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                console.warn('⚠️ [User] Returning MOCK USER for findOne (DB Unreachable)');
                return new User({
                    _id: 'mock_user_id',
                    email: query.email || 'mock@example.com',
                    nombre: 'Usuario Mock',
                    rol: 'conductor',
                    activo: true,
                    verificado: true,
                    configuracion: { precioCombustible: 0, tema: 'claro' }
                });
            }
            throw err;
        }
    }

    static async create(data) {
        const id = data.firebaseUid || db.collection('users').doc().id;

        // Hash password if present and not already hashed (check logic in controller usually)
        if (data.password && !data.password.startsWith('$2a$') && !data.firebaseUid) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        const userData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            configuracion: data.configuracion || { tema: 'claro', notificaciones: true, precioCombustible: 0 },
            vehiculos: [],
            rol: data.rol || 'conductor',
            verificado: data.verificado || false,
            activo: data.activo !== undefined ? data.activo : true
        };

        try {
            await db.collection('users').doc(id).set(userData);
        } catch (err) {
            console.error('Error in User.create:', err.message);
            if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                console.warn('⚠️ [User] Mocking User Creation (DB Unreachable)');
                return new User({ _id: id, ...userData });
            }
            throw err;
        }
        return new User({ _id: id, ...userData });
    }

    static async findByIdAndUpdate(id, update, options = {}) {
        try {
            const ref = db.collection('users').doc(id);

            // If $set syntax used (mongo style), flatten it
            let finalUpdate = update.$set ? update.$set : update;
            finalUpdate.updatedAt = new Date().toISOString();

            await ref.update(finalUpdate);

            if (options.new) {
                const doc = await ref.get();
                return new User({ _id: doc.id, ...doc.data() });
            }
            return true;
        } catch (err) {
            console.error('Error in User.findByIdAndUpdate:', err.message);
            if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                console.warn('⚠️ [User] Mocking Update (DB Unreachable)');
                // Return a dummy updated user
                return new User({
                    _id: id,
                    email: 'mock@example.com',
                    configuracion: { precioCombustible: 0, ...update.configuracion, ...update.$set?.configuracion }
                });
            }
            throw err;
        }
    }

    // Instance methods
    async save() {
        if (!this._id) {
            throw new Error('Cannot save user without ID');
        }
        // Re-construct data object from instance properties
        const dataToSave = { ...this };
        delete dataToSave._id; // Don't save ID inside doc
        delete dataToSave.data; // Don't save raw data backup

        // Update timestamp
        dataToSave.updatedAt = new Date().toISOString();

        // Exclude methods/internal props if any leak

        try {
            await db.collection('users').doc(this._id).set(dataToSave, { merge: true });
        } catch (err) {
            console.error('Error in User.save:', err.message);
            if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
                console.warn('⚠️ [User] Mocking Save (DB Unreachable)');
                // Update internal data
                this.data = { ...this.data, ...dataToSave };
                return this;
            }
            throw err;
        }

        // Update instance data
        this.data = { ...this.data, ...dataToSave };
        return this;
    }

    async comparePassword(candidatePassword) {
        if (!this.password) return false;
        return await bcrypt.compare(candidatePassword, this.password);
    }

    generateAuthToken() {
        return jwt.sign(
            { id: this._id, rol: this.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );
    }

    generateRefreshToken() {
        return jwt.sign(
            { userId: this._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );
    }

    // Helper to select fields (simulating Mongoose .select())
    // Note: Firestore always fetches full doc, this is just for return obj filtering if needed
    // But since we attach methods to the object, return `this` is usually fine.
    // For password selection logic, we already loaded it in `findById/findOne`.
    async actualizarEstadisticas() {
        // Placeholder for statistics update logic
        // This prevents the "user.actualizarEstadisticas is not a function" error
        console.log('[User] Actualizando estadísticas... (stub)');
        return true;
    }

    select(fields) {
        // No-op for now as we just load everything. 
        // In real Mongo +select('+password') means explicitly load it.
        // Firestore gets all fields by default.
        return this;
    }
}

module.exports = User;
