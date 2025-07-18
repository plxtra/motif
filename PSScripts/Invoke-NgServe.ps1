using module ./DevStaticValues

param (
    [Parameter(Mandatory = $true)]
    [PSCustomObject] $DevStaticValues # Should be type DevStaticValues but PowerShell param does not support that yet
)

$DevStaticValues = [DevStaticValues]$DevStaticValues

$setDevStaticValuesScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Set-DevStaticValues.ps1"
& $setDevStaticValuesScriptPath -Values $DevStaticValues

$motifFolder = Join-Path -Path $PSScriptRoot -ChildPath ".."

$originalWorkingDirectory = $PWD
try {
    Set-Location $motifFolder
    ng serve
} finally {
    Set-Location $originalWorkingDirectory
}
