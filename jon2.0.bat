@echo off

:: Détection du chemin vers le dossier contenant ce fichier
set DIR=%~dp0

:: Chemin du binaire Node.js encapsulé
set NODE_BIN=%DIR%node\22\node.exe

:: Vérifier la présence du binaire Node.js
if not exist "%NODE_BIN%" (
  echo Erreur : Node.js n'est pas trouvé dans le package. Veuillez vérifier l'installation.
  exit /b 1
)

:: Exécution de la CLI avec Node.js embarqué
set NODE_ENV=production
set LEVEL=info
"%NODE_BIN%" "%DIR%dist\cli.js" %*
