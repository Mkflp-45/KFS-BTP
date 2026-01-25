# =====================================================
# SCRIPT DE RENOMMAGE DES IMAGES - KFS BTP
# =====================================================
# Ce script renomme les images WhatsApp avec des noms SEO-friendly
# Exécuter : .\rename-images.ps1
# =====================================================

$assetsPath = "$PSScriptRoot\assets"

# Table de correspondance ancien nom -> nouveau nom
$renameMap = @{
    "WhatsApp Image 2026-01-07 at 19.53.34.jpeg" = "logo-kfs-btp.jpeg"
    "WhatsApp Image 2026-01-07 at 12.47.43.jpeg" = "projet-maison-1.jpeg"
    "WhatsApp Image 2026-01-07 at 12.47.43 (1).jpeg" = "projet-maison-2.jpeg"
    "WhatsApp Image 2026-01-07 at 12.47.43 (2).jpeg" = "projet-maison-3.jpeg"
    "WhatsApp Image 2026-01-07 at 19.38.23.jpeg" = "projet-renovation-1.jpeg"
    "WhatsApp Image 2026-01-07 at 19.38.23 (1).jpeg" = "projet-renovation-2.jpeg"
    "WhatsApp Image 2026-01-07 at 19.38.23 (2).jpeg" = "projet-renovation-3.jpeg"
    "WhatsApp Image 2026-01-07 at 19.47.43.jpeg" = "bien-immobilier-1.jpeg"
    "WhatsApp Image 2026-01-07 at 19.47.43 (1).jpeg" = "bien-immobilier-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.43.jpeg" = "appartement-dakar-1.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.43 (1).jpeg" = "appartement-dakar-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.43 (2).jpeg" = "appartement-dakar-3.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.43 (3).jpeg" = "appartement-dakar-4.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.44.jpeg" = "villa-moderne-1.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.44 (1).jpeg" = "villa-moderne-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.44 (2).jpeg" = "villa-moderne-3.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.45.jpeg" = "bureau-commercial-1.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.45 (1).jpeg" = "bureau-commercial-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.45 (2).jpeg" = "bureau-commercial-3.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.45 (3).jpeg" = "bureau-commercial-4.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.46.jpeg" = "terrain-construction-1.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.46 (1).jpeg" = "terrain-construction-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.46 (2).jpeg" = "terrain-construction-3.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.46 (3).jpeg" = "terrain-construction-4.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.46 (4).jpeg" = "terrain-construction-5.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.47.jpeg" = "chantier-btp-1.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.47 (1).jpeg" = "chantier-btp-2.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.47 (2).jpeg" = "chantier-btp-3.jpeg"
    "WhatsApp Image 2026-01-09 at 20.13.47 (3).jpeg" = "chantier-btp-4.jpeg"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RENOMMAGE DES IMAGES KFS BTP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$renamed = 0
$errors = 0

foreach ($oldName in $renameMap.Keys) {
    $oldPath = Join-Path $assetsPath $oldName
    $newPath = Join-Path $assetsPath $renameMap[$oldName]
    
    if (Test-Path $oldPath) {
        try {
            Rename-Item -Path $oldPath -NewName $renameMap[$oldName] -Force
            Write-Host "[OK] " -ForegroundColor Green -NoNewline
            Write-Host "$oldName -> $($renameMap[$oldName])"
            $renamed++
        } catch {
            Write-Host "[ERREUR] " -ForegroundColor Red -NoNewline
            Write-Host "$oldName : $_"
            $errors++
        }
    } else {
        Write-Host "[IGNORE] " -ForegroundColor Yellow -NoNewline
        Write-Host "$oldName (fichier non trouve)"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESULTAT: $renamed renomme(s), $errors erreur(s)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Mettez maintenant a jour les references dans les fichiers HTML/JS !" -ForegroundColor Yellow
Write-Host ""

# Afficher les correspondances pour mise à jour manuelle
Write-Host "Correspondances pour rechercher/remplacer :" -ForegroundColor Magenta
Write-Host ""
foreach ($oldName in $renameMap.Keys) {
    Write-Host "  $oldName"
    Write-Host "  -> $($renameMap[$oldName])" -ForegroundColor Green
    Write-Host ""
}
