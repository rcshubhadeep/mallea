!macro MALLEA_STOP_CORE
  ${If} ${FileExists} "$INSTDIR\runtime\bin\node.exe"
    nsExec::ExecToStack '"$INSTDIR\runtime\bin\node.exe" "$INSTDIR\runtime\scripts\installed-stop.mjs" "$LOCALAPPDATA\dev.mallea.runtime"'
    Pop $0
    Pop $1
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONEXCLAMATION "Close all Mallea apps and quit Mallea before continuing. Your saved data has been kept."
      Abort
    ${EndIf}
  ${EndIf}
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro MALLEA_STOP_CORE
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro MALLEA_STOP_CORE
!macroend
