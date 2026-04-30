import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    return mongoose.connect(process.env.MONGO_URI);
};

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();
        const { prompt } = req.body;

        // Yahan aap apna Gemini / Groq AI aur MongoDB ka code asani se likh sakte hain
        return res.status(200).json({ 
            message: "API Route successfully configured on Vercel!",
            result: `Processed: ${prompt}` 
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}