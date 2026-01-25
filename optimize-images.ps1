# Script d'optimisation des images - KFS BTP
# Convertit les images JPEG en WebP et les compresse

# Créer le dossier de sortie
$outputDir = ".\assets\optimized"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

Write-Host "=== Optimisation des Images KFS BTP ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier si squoosh-cli est installé
$hasSquoosh = $null -ne (Get-Command npx -ErrorAction SilentlyContinue)

if ($hasSquoosh) {
    Write-Host "Pour convertir en WebP avec Squoosh (meilleure qualité):" -ForegroundColor Yellow
    Write-Host "npx @squoosh/cli --webp '{quality:80}' -d $outputDir .\assets\*.jpeg" -ForegroundColor White
    Write-Host ""
}

# Liste des images à optimiser
$images = Get-ChildItem -Path ".\assets\*.jpeg" -ErrorAction SilentlyContinue

if ($images.Count -eq 0) {
    Write-Host "Aucune image JPEG trouvée dans ./assets/" -ForegroundColor Red
    exit
}

Write-Host "Images trouvées: $($images.Count)" -ForegroundColor Green
Write-Host ""

# Afficher la taille actuelle
$totalSize = 0
foreach ($img in $images) {
    $sizeMB = [math]::Round($img.Length / 1MB, 2)
    $totalSize += $img.Length
    Write-Host "  $($img.Name): $sizeMB MB" -ForegroundColor Gray
}

$totalMB = [math]::Round($totalSize / 1MB, 2)
Write-Host ""
Write-Host "Taille totale: $totalMB MB" -ForegroundColor Yellow
Write-Host ""

# Instructions manuelles
Write-Host "=== INSTRUCTIONS POUR OPTIMISER ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1 - En ligne (recommandé):" -ForegroundColor Green
Write-Host "  1. Aller sur https://squoosh.app/" -ForegroundColor White
Write-Host "  2. Glisser-déposer vos images" -ForegroundColor White
Write-Host "  3. Choisir WebP avec qualité 75-80%" -ForegroundColor White
Write-Host "  4. Télécharger et remplacer dans assets/" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - Avec Node.js:" -ForegroundColor Green
Write-Host "  npm install -g @squoosh/cli" -ForegroundColor White
Write-Host "  npx @squoosh/cli --webp '{quality:80}' -d ./assets/optimized ./assets/*.jpeg" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 - Avec Sharp (Node.js):" -ForegroundColor Green
Write-Host "  npm install sharp" -ForegroundColor White
Write-Host "  # Puis utiliser le script Node.js ci-dessous" -ForegroundColor White
Write-Host ""

# Créer un script Node.js pour la conversion
$nodeScript = @'
// optimize-images.js - Script Node.js pour optimiser les images
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './assets';
const outputDir = './assets/optimized';

// Créer le dossier de sortie
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Lire toutes les images JPEG
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'));

console.log(`\n🖼️  Optimisation de ${files.length} images...\n`);

let totalOriginal = 0;
let totalOptimized = 0;

async function processImages() {
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.jpe?g$/i, '.webp'));
        
        const originalSize = fs.statSync(inputPath).size;
        totalOriginal += originalSize;
        
        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .resize(1920, 1080, { 
                    fit: 'inside', 
                    withoutEnlargement: true 
                })
                .toFile(outputPath);
            
            const newSize = fs.statSync(outputPath).size;
            totalOptimized += newSize;
            
            const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
            console.log(`✅ ${file} → ${path.basename(outputPath)} (-${savings}%)`);
        } catch (err) {
            console.log(`❌ ${file}: ${err.message}`);
        }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Optimisé: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Économie: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%\n`);
}

processImages();
'@

$nodeScript | Out-File -FilePath ".\optimize-images.js" -Encoding UTF8
Write-Host "Script Node.js créé: optimize-images.js" -ForegroundColor Green
Write-Host "Pour l'utiliser: npm install sharp && node optimize-images.js" -ForegroundColor White
