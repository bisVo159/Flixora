import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicId = (url) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : null; 
};

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
        return result;
    } catch (error) {
        fs.unlinkSync(filePath); // Ensure the file is removed even if upload fails
        console.error(`Error uploading ${resourceType}:`, error);
        return null;
    }
};

export const deleteFromCloudinary = async (url,resourceType = "image") => {
    try {
        const publicId = extractPublicId(url);
        if (!publicId) {
            console.error("Could not extract publicId from:", url);
            return false;
        }
        const result = await cloudinary.uploader.destroy(publicId, { 
            resource_type: resourceType 
        });
        if (result.result === 'ok') {
            console.log('File deleted successfully from Cloudinary');
            return true;
        } else {
            console.error('Failed to delete file from Cloudinary:', result);
            return false;
        }
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return false;
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