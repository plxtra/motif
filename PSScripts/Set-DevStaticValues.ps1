using module ./DevStaticValues
using module ./BundledExtension

param (
    [Parameter(Mandatory = $true)]
    [PSCustomObject] $Values # Should be type DevStaticValues but PowerShell param does not support that yet
)

$Values = [DevStaticValues]$Values

$clearDevStaticScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Clear-DevStatic.ps1"
$devStaticFolderPath = Join-Path -Path $PSScriptRoot -ChildPath "../dev_static"
$configFolderPath = Join-Path -Path $devStaticFolderPath -ChildPath "config"
$brandingFolderPath = Join-Path -Path $configFolderPath -ChildPath "branding"

& $clearDevStaticScriptPath

$brandingSourceFolderPath = $Values.BrandingSourceFolderPath

Copy-Item -Path $brandingSourceFolderPath -Destination $brandingFolderPath -Recurse -Force

$bundledExtensionPlusJsSourceFolderPathArray = $Values.BundledExtensionPlusJsSourceFolderPathArray
$count = $bundledExtensionPlusJsSourceFolderPathArray.Count
$bundledExtensions = [System.Collections.Generic.List[BundledExtension]]::new($count)

foreach ($bundledExtensionPlusJsSourceFolderPath in $bundledExtensionPlusJsSourceFolderPathArray) {
    $bundledExtension = $bundledExtensionPlusJsSourceFolderPath.BundledExtension
    $urlPath = $bundledExtension.Info.UrlPath
    $urlFolderPath = Split-Path -Path $urlPath -Parent
    $jsFolderPath = Join-Path -Path $devStaticFolderPath -ChildPath $urlFolderPath
    $jsSourceFolderPath = $bundledExtensionPlusJsSourceFolderPath.JsSourceFolderPath

    Copy-Item -Path $jsSourceFolderPath -Destination $jsFolderPath -Recurse -Force

    $bundledExtensions.Add($bundledExtension)
}

$config = $Values.Config
$config.BundledExtensions = $bundledExtensions

$configJson = $config | ConvertTo-Json -Depth 15
$configPath = Join-Path -Path $configFolderPath -ChildPath "config.json"
Set-Content -Path $configPath -Value $configJson -Force
