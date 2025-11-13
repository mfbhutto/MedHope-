// MongoDB Connection File
// Clean, reusable MongoDB connection with Mongoose

import mongoose from 'mongoose';

// Connection state
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

// MongoDB connection options (these are default in Mongoose 6+)
const mongoOptions: mongoose.ConnectOptions = {};

/**
 * Connect to MongoDB database
 * Uses connection pooling and reuses existing connection
 * @returns Promise<mongoose.Connection>
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Return existing connection promise if connection is in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  // Get MongoDB URI from environment variable
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create new connection promise
  connectionPromise = mongoose.connect(mongoUri, mongoOptions);

  try {
    const db = await connectionPromise;
    isConnected = true;
    connectionPromise = null;

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    return db;
  } catch (error) {
    connectionPromise = null;
    isConnected = false;
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns Promise<void>
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Check if database is connected
 * @returns boolean
 */
export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get database connection status
 * @returns string
 */
export function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Reusable database operation wrapper
 * Ensures connection before executing operation
 * @param operation - Function to execute with database connection
 * @returns Promise<T>
 */
export async function withDatabase<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Ensure connection before operation
    if (!isDatabaseConnected()) {
      await connectToDatabase();
    }
    return await operation();
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
}

/**
 * Create a new document in a collection
 * @param model - Mongoose model
 * @param data - Document data
 * @returns Promise<T>
 */
export async function createDocument<T>(
  model: mongoose.Model<T>,
  data: Partial<T>
): Promise<T> {
  return withDatabase(async () => {
    const document = new model(data);
    const saved = await document.save();
    return saved.toObject() as T;
  });
}

/**
 * Find a document by ID
 * @param model - Mongoose model
 * @param id - Document ID
 * @returns Promise<T | null>
 */
export async function findDocumentById<T>(
  model: mongoose.Model<T>,
  id: string
): Promise<T | null> {
  return withDatabase(async () => {
    const doc = await model.findById(id);
    return doc ? (doc.toObject() as T) : null;
  });
}

/**
 * Find documents with query
 * @param model - Mongoose model
 * @param query - MongoDB query
 * @param options - Query options (limit, skip, sort, etc.)
 * @returns Promise<T[]>
 */
export async function findDocuments<T>(
  model: mongoose.Model<T>,
  query: any = {},
  options: {
    limit?: number;
    skip?: number;
    sort?: any;
    select?: string;
  } = {}
): Promise<T[]> {
  return withDatabase(async () => {
    let queryBuilder = model.find(query);

    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    if (options.skip) {
      queryBuilder = queryBuilder.skip(options.skip);
    }
    if (options.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    }
    if (options.select) {
      queryBuilder = queryBuilder.select(options.select);
    }

    const docs = await queryBuilder.exec();
    return docs.map(doc => doc.toObject() as T);
  });
}

/**
 * Find one document with query
 * @param model - Mongoose model
 * @param query - MongoDB query
 * @returns Promise<T | null>
 */
export async function findOneDocument<T>(
  model: mongoose.Model<T>,
  query: any
): Promise<T | null> {
  return withDatabase(async () => {
    const doc = await model.findOne(query);
    return doc ? (doc.toObject() as T) : null;
  });
}

/**
 * Update a document by ID
 * @param model - Mongoose model
 * @param id - Document ID
 * @param data - Update data
 * @returns Promise<T | null>
 */
export async function updateDocumentById<T>(
  model: mongoose.Model<T>,
  id: string,
  data: Partial<T>
): Promise<T | null> {
  return withDatabase(async () => {
    const doc = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return doc ? (doc.toObject() as T) : null;
  });
}

/**
 * Delete a document by ID
 * @param model - Mongoose model
 * @param id - Document ID
 * @returns Promise<T | null>
 */
export async function deleteDocumentById<T>(
  model: mongoose.Model<T>,
  id: string
): Promise<T | null> {
  return withDatabase(async () => {
    const doc = await model.findByIdAndDelete(id);
    return doc ? (doc.toObject() as T) : null;
  });
}

/**
 * Count documents with query
 * @param model - Mongoose model
 * @param query - MongoDB query
 * @returns Promise<number>
 */
export async function countDocuments<T>(
  model: mongoose.Model<T>,
  query: any = {}
): Promise<number> {
  return withDatabase(async () => {
    return await model.countDocuments(query);
  });
}

/**
 * Check if document exists
 * @param model - Mongoose model
 * @param query - MongoDB query
 * @returns Promise<boolean>
 */
export async function documentExists<T>(
  model: mongoose.Model<T>,
  query: any
): Promise<boolean> {
  return withDatabase(async () => {
    const count = await model.countDocuments(query);
    return count > 0;
  });
}

// Export mongoose for direct use if needed
export { mongoose };

// Export default connection function
export default connectToDatabase;
