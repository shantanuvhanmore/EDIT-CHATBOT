@echo off
echo Creating compressed folder...
if not exist "compressed" mkdir compressed

echo Compressing videos (ULTRA High Compression)...
:: Note: Using libx265 with a high CRF and veryslow preset for maximum efficiency
for %%f in (*.mp4 *.avi *.mov *.mkv) do (
    echo Processing: %%f
    ffmpeg -i "%%f" -c:v libx265 -crf 32 -preset veryslow -vf "scale='min(1280,iw)':-2" -c:a aac -b:a 64k -ac 1 "compressed\%%~nf.mp4" -y
)

echo Done! Check the 'compressed' folder.
pause
