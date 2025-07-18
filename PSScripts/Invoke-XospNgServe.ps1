$xospMotifConfigRepositoryPath = Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath "../../xosp-motif-config")
$xospMotifConfigGetDevStaticValuesScriptPath = Join-Path -Path $xospMotifConfigRepositoryPath -ChildPath "PSScripts/Get-DevStaticValues.ps1"

$devStaticValues = & $xospMotifConfigGetDevStaticValuesScriptPath

$invokeNgServeScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-NgServe.ps1"
& $invokeNgServeScriptPath -DevStaticValues $devStaticValues
