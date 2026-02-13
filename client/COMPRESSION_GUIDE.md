# Video Compression Guide

## Your Videos Status

**Already Uploaded (Small files):**
- ✅ Anya vs Gojo (23MB)
- ✅ girl ame 13 (14MB)  
- ✅ Gojo vs Sukuna JJK (15MB)

**Need Compression (Large files):**
- Bleach (88MB) → Target: ~35MB
- Gon (225MB) → Target: ~80MB
- Himeno Chainsaw Man (43MB) → Target: ~20MB
- One Piece (206MB) → Target: ~75MB
- Shanks One Piece (65MB) → Target: ~25MB
- Zangetsu Bleach (464MB) → Target: ~150MB
- Zenitsu Demon Slayer (148MB) → Target: ~55MB

## Option 1: FFmpeg (Best Quality)

### Install FFmpeg
1. Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Extract to `C:\ffmpeg`
3. Add to PATH: `C:\ffmpeg\bin`
4. Restart PowerShell

### Compress Individual Videos

```powershell
# Navigate to videos folder
cd C:\codes\EDIT-CHATBOT\client\src\videos

# For videos 50-150MB (use CRF 23)
ffmpeg -i "Bleach.mp4" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "Bleach_compressed.mp4"
ffmpeg -i "Himeno Chainsaw Man.mp4" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "Himeno_compressed.mp4"
ffmpeg -i "Shanks One Piece.mp4" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "Shanks_compressed.mp4"
ffmpeg -i "Zenitsu Demon Slayer.mp4" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "Zenitsu_compressed.mp4"

# For very large videos 200MB+ (use CRF 25 for more compression)
ffmpeg -i "Gon.mp4" -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 128k "Gon_compressed.mp4"
ffmpeg -i "One Piece.mp4" -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 128k "OnePiece_compressed.mp4"

# For extremely large (464MB) - aggressive compression
ffmpeg -i "Zangetsu Bleach.mp4" -c:v libx264 -crf 27 -preset medium -c:a aac -b:a 96k "Zangetsu_compressed.mp4"
```

## Option 2: HandBrake (GUI - Easier)

1. Download: https://handbrake.fr/downloads.php
2. Install and open HandBrake
3. For each video:
   - Drag video into HandBrake
   - Preset: "Fast 1080p30" or "Very Fast 1080p30"
   - Quality: RF 23 (or RF 25 for larger files)
   - Click "Start Encode"

## Option 3: Manual Cloudinary Upload

If you prefer to upload directly to Cloudinary without local compression:

1. Go to: https://console.cloudinary.com/console/c-e0f8c7e8e8f8c7e8e8f8c7e8/media_library/folders/home
2. Create folder: `anime_backgrounds`
3. Upload videos (Cloudinary will auto-optimize)
4. Copy URLs and I'll help you create the videos.json

## After Compression

Once compressed, you can either:
- **A)** Run the upload script again (it will skip already uploaded videos)
- **B)** Manually upload to Cloudinary and give me the URLs
