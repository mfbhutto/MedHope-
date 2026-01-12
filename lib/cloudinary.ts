// Cloudinary Configuration
// Works in both development (.env file) and production (Vercel environment variables)

import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Only load .env file in development (when file exists)
// In production (Vercel), environment variables are provided via process.env
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  // Load .env file only if it exists (development)
  config({ 
    path: envPath,
    override: false // Don't override existing env vars (production takes precedence)
  });
}

// Get Cloudinary configuration from environment variables
// In development: loaded from .env file
// In production: provided by Vercel environment variables
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
 * @param resourceType - Optional resource type ('image', 'video', 'raw', 'auto'). If not provided, will be auto-detected
 * @returns Promise with Cloudinary upload result
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  fileName: string,
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
): Promise<{ secure_url: string; public_id: string }> {
  if (!cloudName || !apiKey || !apiSecret) {
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const errorMessage = isProduction
      ? 'Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel environment variables.'
      : 'Cloudinary credentials are not configured. Please check your .env file.';
    throw new Error(errorMessage);
  }

  // Auto-detect resource type if not provided
  let detectedResourceType: 'image' | 'video' | 'raw' | 'auto' = resourceType || 'auto';
  
  if (!resourceType) {
    // Check file extension to determine resource type
    const fileExtension = fileName.toLowerCase().split('.').pop() || '';
    const pdfExtensions: readonly string[] = ['pdf'];
    const imageExtensions: readonly string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    const videoExtensions: readonly string[] = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
    
    if (pdfExtensions.includes(fileExtension)) {
      detectedResourceType = 'raw'; // PDFs should be uploaded as raw files
    } else if (imageExtensions.includes(fileExtension)) {
      detectedResourceType = 'image';
    } else if (videoExtensions.includes(fileExtension)) {
      detectedResourceType = 'video';
    } else {
      detectedResourceType = 'auto'; // Let Cloudinary decide for unknown types
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: detectedResourceType,
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
 * @param resourceType - Optional resource type ('image', 'video', 'raw', 'auto'). If not provided, will be auto-detected based on file type
 * @returns Promise with Cloudinary upload result
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
): Promise<{ secure_url: string; public_id: string }> {
  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${sanitizedName}`;

  // Auto-detect resource type based on file MIME type if not provided
  let detectedResourceType: 'image' | 'video' | 'raw' | 'auto' = resourceType || 'auto';
  
  if (!resourceType) {
    // Check MIME type first (more reliable)
    if (file.type === 'application/pdf') {
      detectedResourceType = 'raw'; // PDFs should be uploaded as raw files
    } else if (file.type.startsWith('image/')) {
      detectedResourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      detectedResourceType = 'video';
    } else {
      // Fallback to file extension
      const fileExtension = file.name.toLowerCase().split('.').pop() || '';
      const pdfExtensions: readonly string[] = ['pdf'];
      const imageExtensions: readonly string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
      const videoExtensions: readonly string[] = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
      
      if (pdfExtensions.includes(fileExtension)) {
        detectedResourceType = 'raw';
      } else if (imageExtensions.includes(fileExtension)) {
        detectedResourceType = 'image';
      } else if (videoExtensions.includes(fileExtension)) {
        detectedResourceType = 'video';
      } else {
        detectedResourceType = 'auto'; // Let Cloudinary decide for unknown types
      }
    }
  }

  return uploadToCloudinary(buffer, folder, fileName, detectedResourceType);
}

export default cloudinary;

