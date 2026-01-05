// Cloudinary Configuration
// Explicitly loads from .env file (not .env.local)

import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { resolve } from 'path';

// Explicitly load .env file and override any existing values
// This ensures we read from .env as requested, even if .env.local exists
config({ 
  path: resolve(process.cwd(), '.env'),
  override: true // Override any existing environment variables
});

// Get Cloudinary configuration from .env file
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.error('❌ Cloudinary configuration error: Missing credentials');
  console.error('Required environment variables in .env file:');
  console.error('  - CLOUDINARY_CLOUD_NAME');
  console.error('  - CLOUDINARY_API_KEY');
  console.error('  - CLOUDINARY_API_SECRET');
  console.error('Current values found:');
  console.error(`  - CLOUDINARY_CLOUD_NAME: ${cloudName || 'NOT SET'}`);
  console.error(`  - CLOUDINARY_API_KEY: ${apiKey ? 'SET (hidden)' : 'NOT SET'}`);
  console.error(`  - CLOUDINARY_API_SECRET: ${apiSecret ? 'SET (hidden)' : 'NOT SET'}`);
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer
 * @param folder - Folder path in Cloudinary (e.g., 'utility-bills', 'documents')
 * @param fileName - Original file name
 * @returns Promise with Cloudinary upload result
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  fileName: string
): Promise<{ secure_url: string; public_id: string }> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured. Please check your .env file.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Automatically detect image, video, or raw
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload a file from FormData to Cloudinary
 * @param file - File from FormData
 * @param folder - Folder path in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<{ secure_url: string; public_id: string }> {
  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${sanitizedName}`;

  return uploadToCloudinary(buffer, folder, fileName);
}

export default cloudinary;

