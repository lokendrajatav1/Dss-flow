import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Uploads a base64 string or file path/URL to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'company_branding'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(fileData, {
    folder: `crm/${folder}`,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export default cloudinary;
