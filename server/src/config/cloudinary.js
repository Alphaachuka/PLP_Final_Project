import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for different file types
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `uplift/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    },
  });
};

// Different storage configurations
export const avatarStorage = createStorage('avatars', ['jpg', 'jpeg', 'png', 'gif']);
export const courseStorage = createStorage('courses', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx']);
export const jobStorage = createStorage('jobs', ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']);

// Multer configurations
export const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  }
});

export const courseUpload = multer({ 
  storage: courseStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for course materials
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed for course materials'), false);
    }
  }
});

export const jobUpload = multer({ 
  storage: jobStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for job attachments
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg', 'image/jpg', 'image/png'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed for job attachments'), false);
    }
  }
});

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  });
};

export default cloudinary;