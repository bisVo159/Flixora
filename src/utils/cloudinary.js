import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath, resourceType = 'auto', folder = '') => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist');
        }
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: folder,
        });
        fs.unlinkSync(filePath); // Remove the file after upload
        console.log(`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} uploaded successfully:`, result.secure_url);
        return result.secure_url;
    } catch (error) {
        fs.unlinkSync(filePath); // Ensure the file is removed even if upload fails
        console.error(`Error uploading ${resourceType}:`, error);
        throw error;
    }
};

// export const uploadVideo = async (filePath) => {
//     try {
//         if(!fs.existsSync(filePath)) {
//             throw new Error('File does not exist');
//         }
//         const result = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'video',
//             folder: 'videos',
//         });
//         fs.unlinkSync(filePath); // Remove the file after upload
//         console.log('Video uploaded successfully:', result.secure_url);
//         return result.secure_url;
//     } catch (error) {
//         console.error('Error uploading video:', error);
//         throw error;
//     }
// }


// export const uploadImage = async (filePath) => {
//     try {
//         if(!fs.existsSync(filePath)) {
//             throw new Error('File does not exist');
//         }
//         const result = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'image',
//             folder: 'thumbnails'
//         });
//         fs.unlinkSync(filePath); // Remove the file after upload
//         console.log('Image uploaded successfully:', result.secure_url);
//         return result.secure_url;
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         throw error;
//     }
// }