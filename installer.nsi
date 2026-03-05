Outfile "SwagatInventorySetup.exe"
InstallDir "$PROGRAMFILES\SwagatInventory"

RequestExecutionLevel admin

ShowInstDetails show
ShowUnInstDetails show

Page directory
Page instfiles

Section "Install"

  DetailPrint "Stopping existing service..."
  nsExec::Exec 'sc stop SwagatInventoryAgent'
  Sleep 1000

  DetailPrint "Deleting existing service..."
  nsExec::Exec 'sc delete SwagatInventoryAgent'
  Sleep 1000

  DetailPrint "Copying application files..."
  SetOutPath "$INSTDIR"
  File "InventoryAgent.exe"

  DetailPrint "Opening Registration..."
  ExecWait '"$INSTDIR\InventoryAgent.exe" --register' $0

  StrCmp $0 0 +2
  Abort "Registration Failed. Service not installed."

  DetailPrint "Creating Windows Service..."
  nsExec::Exec 'sc create SwagatInventoryAgent binPath= "\"$INSTDIR\InventoryAgent.exe\"" start= auto DisplayName= \"Swagat Inventory Agent\"'

  Sleep 2000

  DetailPrint "Starting Service..."
  nsExec::Exec 'sc start SwagatInventoryAgent'

  WriteUninstaller "$INSTDIR\Uninstall.exe"

  DetailPrint "Installation Completed Successfully"
  Sleep 1500

SectionEnd


Section "Uninstall"

  DetailPrint "Stopping Service..."
  nsExec::Exec 'sc stop SwagatInventoryAgent'
  Sleep 1000

  DetailPrint "Deleting Service..."
  nsExec::Exec 'sc delete SwagatInventoryAgent'
  Sleep 1000

  Delete "$INSTDIR\InventoryAgent.exe"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

  DetailPrint "Uninstall Completed Successfully"
  Sleep 1500

SectionEnd