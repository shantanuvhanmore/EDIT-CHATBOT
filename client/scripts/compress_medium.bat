@echo off
echo Creating compressed folder...
if not exist "compressed" mkdir compressed

echo Compressing videos (Medium Compression - Balanced)...
for %%f in (*.mp4 *.avi *.mov *.mkv) do (
    echo Processing: %%f
    ffmpeg -i "%%f" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "compressed\%%f" -y
)

echo Done! Check the 'compressed' folder.
pause
