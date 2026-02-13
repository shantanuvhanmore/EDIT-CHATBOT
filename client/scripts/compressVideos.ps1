# Video Compression Script using FFmpeg
# Place this in client/scripts/ and run: .\scripts\compressVideos.ps1

$inputDir = ".\src\videos"
$outputDir = ".\src\videos_compressed"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Get all MP4 files
$videos = Get-ChildItem -Path $inputDir -Filter "*.mp4"

Write-Host "Found $($videos.Count) videos to compress..." -ForegroundColor Cyan

foreach ($video in $videos) {
    $inputPath = $video.FullName
    $outputPath = Join-Path $outputDir $video.Name
    
    Write-Host "`nCompressing: $($video.Name)" -ForegroundColor Yellow
    
    # Get original file size
    $originalSize = [math]::Round($video.Length / 1MB, 2)
    Write-Host "Original size: ${originalSize}MB"
    
    # Compress with FFmpeg (CRF 23 = good quality/size balance)
    ffmpeg -i $inputPath -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k $outputPath -y
    
    # Get compressed file size
    $compressedFile = Get-Item $outputPath
    $compressedSize = [math]::Round($compressedFile.Length / 1MB, 2)
    $reduction = [math]::Round((1 - ($compressedSize / $originalSize)) * 100, 1)
    
    Write-Host "Compressed size: ${compressedSize}MB (${reduction}% reduction)" -ForegroundColor Green
}

Write-Host "`nAll videos compressed! Check $outputDir" -ForegroundColor Green
