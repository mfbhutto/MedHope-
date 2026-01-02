// Cloudinary utility for image/file uploads
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer
 * @param folder - Cloudinary folder name (e.g., 'utility-bills', 'documents')
 * @param fileName - Original file name (optional)
 * @param resourceType - Resource type: 'image', 'raw', 'auto' (default: 'auto')
 * @returns Promise with the uploaded file URL and public_id
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  fileName?: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<{ url: string; public_id: string }> {
  try {
    // Convert buffer to base64 data URI
    const base64String = buffer.toString('base64');
    // Determine MIME type based on resource type
    const mimeType = resourceType === 'raw' ? 'application/octet-stream' : 'application/octet-stream';
    const dataUri = `data:${mimeType};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `medhope/${folder}`,
      resource_type: resourceType, // 'auto' detects automatically, 'raw' for PDFs/documents
      use_filename: fileName ? true : false,
      unique_filename: true,
      overwrite: false,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload a File object to Cloudinary
 * @param file - File object from FormData
 * @param folder - Cloudinary folder name
 * @returns Promise with the uploaded file URL and public_id
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<{ url: string; public_id: string }> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type based on file MIME type
    let resourceType: 'image' | 'raw' | 'auto' = 'auto';
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type === 'application/pdf' || file.type.startsWith('application/')) {
      resourceType = 'raw'; // PDFs and other documents should be stored as raw files
    }

    // Upload to Cloudinary
    return await uploadToCloudinary(buffer, folder, file.name, resourceType);
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public_id of the file to delete
 * @returns Promise<boolean> - true if deleted successfully
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
}

