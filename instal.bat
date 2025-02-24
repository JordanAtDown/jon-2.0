# Définir les variables
$repoUrl = "https://github.com/JordanAtDown/jon-2.0/releases/latest"  # URL de la dernière release
$outputDir = "C:\chemin\vers\votre\dossier\destination"  # Dossier où remplacer les fichiers
$tempZipPath = "C:\Temp\jon2.0-windows.zip"  # Chemin temporaire pour télécharger l'archive
$tempExtractDir = "C:\Temp\jon2.0_extracted"  # Répertoire temporaire pour extraire l'archive
$batFilePath = Join-Path $outputDir "jon2.0.bat"  # Chemin complet du fichier jon2.0.bat

# S'assurer que le dossier temporaire existe
New-Item -ItemType Directory -Force -Path (Split-Path $tempZipPath)
New-Item -ItemType Directory -Force -Path $tempExtractDir

# Télécharger le fichier ZIP de la dernière release
Write-Output "Récupération du dernier fichier ZIP..."
Invoke-WebRequest -Uri "$repoUrl" -Headers @{Accept = "application/json"} -ErrorAction Stop | ForEach-Object {
    $latestReleaseUrl = ($_ | ConvertFrom-Json).assets | Where-Object { $_.name -eq "jon2.0-windows.zip" } | Select-Object -First 1 -ExpandProperty browser_download_url

    if ($null -eq $latestReleaseUrl) {
        Throw "Impossible de trouver jon2.0-windows.zip dans la dernière release"
    }

    Invoke-WebRequest -Uri $latestReleaseUrl -OutFile $tempZipPath -ErrorAction Stop
}

Write-Output "Téléchargement terminé. Fichier sauvegardé : $tempZipPath"

# Extraire le fichier ZIP
Write-Output "Extraction des fichiers..."
Expand-Archive -Path $tempZipPath -DestinationPath $tempExtractDir -Force

# Préserver le fichier jon2.0.bat (s'il existe)
if (Test-Path $batFilePath) {
    Write-Output "Conservation du fichier jon2.0.bat existant..."
    Copy-Item -Path $batFilePath -Destination "$tempExtractDir\jon2.0.bat" -Force
}

# Remplacer les fichiers existants
Write-Output "Remplacement des fichiers existants..."
Remove-Item -Recurse -Force -Path "$outputDir\*" -Exclude "jon2.0.bat"  # Ne pas supprimer jon2.0.bat
Copy-Item -Recurse -Force -Path "$tempExtractDir\*" -Destination $outputDir  # Copier les nouveaux fichiers

Write-Output "Remplacement terminé. Les fichiers ont été mis à jour."

# Nettoyage des fichiers temporaires
Write-Output "Nettoyage des fichiers temporaires..."
Remove-Item -Recurse -Force -Path $tempZipPath
Remove-Item -Recurse -Force -Path $tempExtractDir

Write-Output "Terminé ! Les nouveaux fichiers sont disponibles dans : $outputDir"
