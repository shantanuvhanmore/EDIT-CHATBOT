import mongoose from 'mongoose';

const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                dbName: 'EDIT_CHATBOT',
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000
            });
            console.log('✓ MongoDB connected');
            return;
        } catch (error) {
            retries++;
            console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
            if (retries === maxRetries) {
                console.error('Available Environment Variables:', Object.keys(process.env));
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default connectDB;
