
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from client/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEOS_DIR = path.join(__dirname, '../src/videos');
const OUTPUT_FILE = path.join(__dirname, '../src/videos.json');

const getFriendlyName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, "");
    name = name.replace(/[-_]/g, " ");
    return name;
};

async function uploadVideos() {
    try {
        const files = fs.readdirSync(VIDEOS_DIR).filter(file => file.endsWith('.mp4'));
        // Filter for a small file to test
        const testFile = files.find(f => f.includes("girl"));

        if (!testFile) {
            console.log("No test file found");
            return;
        }

        console.log(`Testing upload with ${testFile}...`);

        try {
            const result = await cloudinary.uploader.upload_large(path.join(VIDEOS_DIR, testFile), {
                resource_type: "video",
                folder: "anime_backgrounds_test",
                public_id: path.parse(testFile).name,
                chunk_size: 6000000,
                eager: [
                    { width: 300, crop: "scale", format: "jpg" }
                ],
                eager_async: true,
                transformation: [
                    { quality: "auto", fetch_format: "auto" }
                ]
            });

            console.log("Upload result keys:", Object.keys(result));
            console.log("Public ID:", result.public_id);
            console.log("Secure URL:", result.secure_url);

            const videoUrl = cloudinary.url(result.public_id, {
                resource_type: "video",
                format: "mp4",
                transformation: [{ quality: "auto", fetch_format: "auto" }]
            });

            console.log("Generated Video URL:", videoUrl);

        } catch (uploadError) {
            console.error(`Failed to upload ${testFile}:`, uploadError);
        }

    } catch (error) {
        console.error("Error in upload script:", error);
    }
}

uploadVideos();
