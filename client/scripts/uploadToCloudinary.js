
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

const VIDEOS_DIR = path.join(__dirname, '../src/videos/done');
const OUTPUT_FILE = path.join(__dirname, '../src/vid.json');

// Helper to get friendly name from filename
const getFriendlyName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, "");
    name = name.replace(/[-_]/g, " ");
    // return name.replace(/\b\w/g, l => l.toUpperCase());
    return name;
};

// Promisify upload_large
const uploadLargeAsync = (file, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(file, options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
};

async function uploadVideos() {
    try {
        if (!fs.existsSync(VIDEOS_DIR)) {
            console.error(`Videos directory not found at ${VIDEOS_DIR}`);
            return;
        }

        // Load existing videos if any (to skip or merge)
        let existingVideos = [];
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                existingVideos = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
                // Filter out invalid entries (where url is missing)
                existingVideos = existingVideos.filter(v => v.videoUrl);
            } catch (e) {
                console.warn("Could not parse existing videos.json, starting fresh.");
            }
        }

        const files = fs.readdirSync(VIDEOS_DIR).filter(file => file.endsWith('.mp4'));
        const videos = [...existingVideos];

        console.log(`Found ${files.length} videos in directory.`);
        console.log(`(Already have ${existingVideos.length} valid entries in videos.json)`);

        for (const file of files) {
            // Skip if already uploaded/in json
            if (videos.some(v => v.originalName === file)) {
                console.log(`Skipping ${file} (already in videos.json)`);
                continue;
            }

            console.log(`Uploading ${file}...`);

            try {
                // Use promisified upload_large
                const result = await uploadLargeAsync(path.join(VIDEOS_DIR, file), {
                    resource_type: "video",
                    folder: "anime_backgrounds",
                    public_id: path.parse(file).name,
                    chunk_size: 6000000,
                    eager: [
                        { width: 300, crop: "scale", format: "jpg" }
                    ],
                    eager_async: true,
                    transformation: [
                        { quality: "auto", fetch_format: "auto" }
                    ]
                });

                // Construct URLs manually (since async)
                const videoUrl = cloudinary.url(result.public_id, {
                    resource_type: "video",
                    format: "mp4",
                    transformation: [{ quality: "auto", fetch_format: "auto" }]
                });

                const thumbnailUrl = cloudinary.url(result.public_id, {
                    resource_type: "video",
                    format: "jpg",
                    transformation: [{ width: 300, crop: "scale" }]
                });

                videos.push({
                    id: result.public_id,
                    name: getFriendlyName(file),
                    originalName: file,
                    videoUrl: videoUrl,
                    thumbnailUrl: thumbnailUrl
                });

                console.log(`Uploaded ${file} -> ${videoUrl}`);

                // Save immediately
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(videos, null, 2));

            } catch (uploadError) {
                console.error(`Failed to upload ${file}:`, uploadError.message || uploadError);
            }
        }

        console.log(`\nAll done! Saved ${videos.length} videos to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("Error in upload script:", error);
    }
}

uploadVideos();
