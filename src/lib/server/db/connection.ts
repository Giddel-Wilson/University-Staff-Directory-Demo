import mongoose from 'mongoose';
import { env } from '$env/dynamic/private';

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Use global variable to maintain connection across hot reloads in development
const globalWithMongoose = global as typeof global & {
	mongoose: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
	globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

/**
 * Connect to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections
 */
export async function connectDB(): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	const MONGODB_URI = env.MONGODB_URI;

	if (!MONGODB_URI) {
		throw new Error('Please define the MONGODB_URI environment variable inside .env');
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
			socketTimeoutMS: 45000,
			connectTimeoutMS: 30000, // Added connection timeout
		};

		cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
			console.log('✅ MongoDB connected successfully');
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		console.error('❌ MongoDB connection error:', e);
		throw e;
	}

	return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
	if (cached.conn) {
		await cached.conn.disconnect();
		cached.conn = null;
		cached.promise = null;
		console.log('📤 MongoDB disconnected');
	}
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
	return cached.conn !== null && mongoose.connection.readyState === 1;
}
