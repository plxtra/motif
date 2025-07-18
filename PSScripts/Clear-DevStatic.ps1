$devStaticFolderPath = Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "../dev_static")
Get-ChildItem -Path $devStaticFolderPath -Recurse |
    Where-Object { $_.Name -ne "README.txt" -or $_.Directory -notin ("$devStaticFolderPath") } |
    Remove-Item -Recurse -Force
