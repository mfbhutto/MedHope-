// MongoDB Connection File
// Clean, reusable MongoDB connection with Mongoose

import mongoose from 'mongoose';

// Connection state
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;
let currentConnectionUri: string | null = null;

// MongoDB connection options (these are default in Mongoose 6+)
const mongoOptions: mongoose.ConnectOptions = {};

/**
 * Connect to MongoDB database
 * Uses connection pooling and reuses existing connection
 * @returns Promise<mongoose.Connection>
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Get MongoDB URI from environment variable
  // Next.js loads .env.local automatically, but we check both
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not defined');
    console.error('💡 Make sure you have a .env.local file in the root directory with:');
    console.error('   MONGODB_URI=mongodb://localhost:27017/medhope');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    throw new Error('MONGODB_URI environment variable is not defined. Please check your .env.local file.');
  }

  // Ensure database name is in the URI (if not present, add default)
  let finalMongoUri = mongoUri;
  // Check if URI has a database name (after the last /, before any ?)
  const uriWithoutQuery = mongoUri.split('?')[0]; // Remove query parameters
  const uriParts = uriWithoutQuery.split('/');
  const hasDatabaseName = uriParts.length >= 4 && uriParts[uriParts.length - 1] && uriParts[uriParts.length - 1].trim() !== '';
  
  if (!hasDatabaseName) {
    // If no database name specified, add default
    const dbName = process.env.MONGODB_DB_NAME || 'medhope';
    // Preserve query parameters if they exist
    const queryString = mongoUri.includes('?') ? mongoUri.substring(mongoUri.indexOf('?')) : '';
    finalMongoUri = mongoUri.endsWith('/') 
      ? `${mongoUri}${dbName}${queryString}` 
      : `${mongoUri}/${dbName}${queryString}`;
    console.log('⚠️ No database name in URI, using default:', dbName);
  }

  // Check connection state
  const readyState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  // If already connected (state 1), return immediately
  if (readyState === 1) {
    // Update current URI if not set
    if (!currentConnectionUri) {
      currentConnectionUri = finalMongoUri;
    }
    isConnected = true;
    return mongoose;
  }

  // If connecting (state 2), wait for existing connection promise
  if (readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  // If disconnecting (state 3), wait a bit and check again
  if (readyState === 3) {
    // Wait for disconnection to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    // Check again
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      currentConnectionUri = finalMongoUri;
      return mongoose;
    }
  }

  // Return existing connection promise if connection is in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  console.log('🔌 Attempting to connect to MongoDB...');
  console.log('📍 Connection URI:', finalMongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials if any

  // Store the URI we're connecting with
  currentConnectionUri = finalMongoUri;

  // Create new connection promise with better options
  // Only connect if disconnected (state 0)
  if (mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(finalMongoUri, {
      ...mongoOptions,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
  } else {
    // Already connected or connecting, return mongoose
    isConnected = true;
    return mongoose;
  }

  try {
    if (connectionPromise) {
      const db = await connectionPromise;
      isConnected = true;
      connectionPromise = null;

      console.log('✅ MongoDB connected successfully');
      console.log('📊 Database:', mongoose.connection.db?.databaseName || 'unknown');
      console.log('🔗 Connection state:', (mongoose.connection.readyState as number) === 1 ? 'connected' : 'not connected');
    } else {
      // Connection already established
      isConnected = true;
    }

    // Connection event handlers (only set up once)
    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
        isConnected = true;
      });

      mongoose.connection.on('error', (err: Error) => {
        console.error('❌ MongoDB connection error:', err);
        console.error('Error details:', err.message);
        isConnected = false;
        currentConnectionUri = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        isConnected = false;
        currentConnectionUri = null;
      });
    }

    return mongoose;
  } catch (error: any) {
    connectionPromise = null;
    isConnected = false;
    currentConnectionUri = null;
    console.error('❌ Failed to connect to MongoDB');
    console.error('Error type:', error?.name);
    console.error('Error message:', error?.message);
    
    // Check for DNS/connection string errors
    if (error?.message?.includes('querySrv') || error?.message?.includes('ENOTFOUND')) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('🚨 MONGODB CONNECTION STRING ERROR');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      console.error('The error "querySrv ENOTFOUND" usually means:');
      console.error('1. The MongoDB connection string is incorrect');
      console.error('2. The hostname in the connection string cannot be resolved');
      console.error('3. For MongoDB Atlas, make sure you\'re using the correct cluster URL');
      console.error('');
      console.error('📋 HOW TO FIX:');
      console.error('');
      console.error('1. Check your .env file for MONGODB_URI');
      console.error('2. For MongoDB Atlas, the format should be:');
      console.error('   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medhope');
      console.error('3. Make sure there are no extra spaces or characters');
      console.error('4. Verify the cluster name matches your Atlas cluster');
      console.error('');
      console.error('Current URI (masked):', finalMongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
    }
    
    if (error?.message?.includes('ECONNREFUSED')) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('🚨 MONGODB IS NOT RUNNING');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      console.error('📋 QUICK FIX OPTIONS:');
      console.error('');
      console.error('Option 1: Use MongoDB Atlas (Cloud - Easiest)');
      console.error('   1. Go to: https://www.mongodb.com/cloud/atlas/register');
      console.error('   2. Create free account and cluster');
      console.error('   3. Get connection string and update .env.local');
      console.error('   4. Format: mongodb+srv://user:pass@cluster.mongodb.net/medhope');
      console.error('');
      console.error('Option 2: Start MongoDB Locally');
      console.error('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.error('   2. Start service: Start-Service MongoDB');
      console.error('   3. Or run: mongod --dbpath "C:\\data\\db"');
      console.error('');
      console.error('Option 3: Use Docker');
      console.error('   docker run -d -p 27017:27017 --name mongodb mongo:latest');
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
    } else if (error?.message?.includes('whitelist') || error?.message?.includes('IP') || error?.reason?.type === 'ReplicaSetNoPrimary') {
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('🚨 IP ADDRESS NOT WHITELISTED IN MONGODB ATLAS');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      console.error('📋 HOW TO FIX:');
      console.error('');
      console.error('1. Go to MongoDB Atlas Dashboard:');
      console.error('   https://cloud.mongodb.com/');
      console.error('');
      console.error('2. Select your cluster (Cluster0)');
      console.error('');
      console.error('3. Click "Network Access" in the left sidebar');
      console.error('');
      console.error('4. Click "Add IP Address" button');
      console.error('');
      console.error('5. Choose one of these options:');
      console.error('   ✅ "Allow Access from Anywhere" (0.0.0.0/0) - For development');
      console.error('   ✅ "Add Current IP Address" - For your current location');
      console.error('');
      console.error('6. Click "Confirm"');
      console.error('');
      console.error('⚠️  Note: It may take 1-2 minutes for changes to take effect');
      console.error('');
      console.error('🔗 Direct link: https://cloud.mongodb.com/v2#/security/network/list');
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
    }
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
