import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        // Explicitly specify database name to ensure we use EDIT_CHATBOT
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'EDIT_CHATBOT'
        });

        console.log('✅ MongoDB connected successfully to database: EDIT_CHATBOT');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    }
};

export default connectDB;
