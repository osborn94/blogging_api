const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {

        if (process.env.NODE_ENV !== 'test') {

            await mongoose.connect(MONGO_URI)
            console.log('MongoDB connected');
        }
        
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = { connectDB }
