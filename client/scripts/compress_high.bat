@echo off
echo Creating compressed folder...
if not exist "compressed" mkdir compressed

echo Compressing videos (High Compression - Smaller Size)...
for %%f in (*.mp4 *.avi *.mov *.mkv) do (
    echo Processing: %%f
    ffmpeg -i "%%f" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k "compressed\%%f" -y
)

echo Done! Check the 'compressed' folder.
pause
