# Définir les variables
$repoUrl = "https://github.com/JordanAtDown/jon-2.0/releases/latest"  # URL de la dernière release
$outputDir = "C:\chemin\vers\votre\dossier\destination"  # Dossier où remplacer les fichiers
$tempZipPath = "C:\Temp\jon2.0-windows.zip"  # Chemin temporaire pour télécharger l'archive
$tempExtractDir = "C:\Temp\jon2.0_extracted"  # Répertoire temporaire pour extraire l'archive
$batFilePath = Join-Path $outputDir "jon2.0.bat"  # Chemin complet du fichier jon2.0.bat
$iconPath = Join-Path $outputDir "dist\jon2.0.ico"  # Chemin vers l'icône personnalisée dans le dossier dist

# Variable pour les arguments à exécuter via le raccourci
$shortcutArguments = "-Command jon2.0"  # Arguments pour exécuter l'alias jon2.0

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

# === AJOUTER L'ALIAS PERMANENT UNIQUEMENT SI IL N'EXISTE PAS ===

# Chemin vers jon2.0.bat
$destinationBatFile = Join-Path $outputDir "jon2.0.bat"
$aliasName = "jon2.0"

# Ajouter l'alias dans PowerShell uniquement s'il n'existe pas
if (Test-Path $destinationBatFile) {
    Write-Output "Configuration de l'alias pour $destinationBatFile..."

    # Chemin du profil PowerShell
    $profilePath = $PROFILE

    # Vérifier si le fichier profil PowerShell existe, sinon le créer
    if (-Not (Test-Path $profilePath)) {
        New-Item -Type File -Path $profilePath -Force
        Write-Output "Fichier profil PowerShell créé : $profilePath"
    }

    # Vérifier si l'alias existe déjà
    if (-Not (Get-Content $profilePath | Select-String -Pattern "Set-Alias -Name $aliasName")) {
        $aliasCommand = "`nSet-Alias -Name $aliasName -Value `"$destinationBatFile`""
        Add-Content -Path $profilePath -Value $aliasCommand
        Write-Output "Alias PowerShell ajouté : $aliasCommand"
    } else {
        Write-Output "Alias PowerShell $aliasName existe déjà, aucune modification effectuée."
    }
} else {
    Write-Output "Fichier $destinationBatFile introuvable, impossible de créer l'alias."
}

# Ajouter le chemin de destination à la variable PATH uniquement s'il n'existe pas
Write-Output "Vérification si le chemin de destination est déjà dans la variable PATH..."
$envPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if (-Not ($envPath -like "*$outputDir*")) {
    [Environment]::SetEnvironmentVariable("PATH", "$envPath;$outputDir", "User")
    Write-Output "Chemin $outputDir ajouté à la variable PATH."
} else {
    Write-Output "Chemin $outputDir déjà présent dans la variable PATH, aucune modification effectuée."
}

Write-Output "Configuration de l'alias terminée. Vous pouvez désormais utiliser 'jon2.0'."

# === CRÉER UN RACCOURCI SUR LE BUREAU POUR EXECUTER L'ALIAS AVEC L'ICône ===

# Obtenir le chemin du bureau de l'utilisateur courant
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "jon2.0.lnk"

# Créer un raccourci uniquement s'il n'existe pas
if (-Not (Test-Path $shortcutPath)) {
    # Créer un objet WScript.Shell pour créer le raccourci
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)

    # Configurer le raccourci pour exécuter 'jon2.0' dans PowerShell avec l'argument défini
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = $shortcutArguments  # Utiliser la variable pour l'argument
    $shortcut.WorkingDirectory = $outputDir

    # Vérifier si l'icône personnalisée existe et l'appliquer
    if (Test-Path $iconPath) {
        $shortcut.IconLocation = $iconPath  # Icône personnalisée
    } else {
        Write-Output "Icône non trouvée à l'emplacement : $iconPath. Aucun icône personnalisé défini."
    }

    $shortcut.WindowStyle = 1  # Ouvre dans une fenêtre normale
    $shortcut.Save()

    Write-Output "Raccourci jon2.0 créé sur le bureau avec icône : $shortcutPath"
} else {
    Write-Output "Raccourci jon2.0 existe déjà sur le bureau, aucune modification effectuée."
}
