# Flutter Mobile Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Vidyatra Flutter Mobile Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Flutter is installed
Write-Host "`nChecking Flutter installation..." -ForegroundColor Yellow
$flutterVersion = flutter --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Flutter is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Flutter from: https://flutter.dev/docs/get-started/install" -ForegroundColor Yellow
    exit 1
}

Write-Host "Flutter installed: OK" -ForegroundColor Green

# Navigate to Flutter project directory
$flutterProjectPath = Join-Path $PSScriptRoot "vidyatra_flutter_mobile"
Write-Host "`nNavigating to: $flutterProjectPath" -ForegroundColor Yellow

if (!(Test-Path $flutterProjectPath)) {
    Write-Host "ERROR: Flutter project directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $flutterProjectPath

# Clean previous builds
Write-Host "`nCleaning previous builds..." -ForegroundColor Yellow
flutter clean

# Get dependencies
Write-Host "`nInstalling Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`nDependencies installed successfully!" -ForegroundColor Green

# Run Flutter doctor
Write-Host "`nRunning Flutter doctor..." -ForegroundColor Yellow
flutter doctor

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your backend URL" -ForegroundColor White
Write-Host "2. Connect Android device or start emulator" -ForegroundColor White
Write-Host "3. Run: flutter run" -ForegroundColor White
Write-Host "4. To build APK: flutter build apk --release" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
