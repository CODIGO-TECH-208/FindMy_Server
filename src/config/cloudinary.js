import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Automatically configures if CLOUDINARY_URL is present in process.env
// But we explicitly call config if we are directly passing api keys
// We'll let it auto-configure, or we can just call an empty config which reads from CLOUDINARY_URL.
if (process.env.CLOUDINARY_URL) {
    // CLOUDINARY_URL is present, cloudinary auto-parses it.
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback if user uses separated keys
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'findmy_chats', // Folder in cloudinary
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

export const uploadImage = multer({ storage: storage });
export default cloudinary;
