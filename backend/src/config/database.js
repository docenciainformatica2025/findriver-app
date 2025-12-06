const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Configurar índices
        await mongoose.connection.db.collection('transactions').createIndex({ userId: 1, fecha: -1 });
        await mongoose.connection.db.collection('transactions').createIndex({
            userId: 1,
            tipo: 1,
            fecha: -1
        });
        await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });

        return conn;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
