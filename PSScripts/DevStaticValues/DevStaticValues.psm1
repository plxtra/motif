using module ../BundledExtension

class ConfigAndBrandingFolderPath {
    [PSCustomObject] $Config
    [string] $BrandingFolderPath

    ConfigAndBrandingFolderPath([PSCustomObject] $Config, [string] $BrandingFolderPath) {
        $this.Config = $Config
        $this.BrandingFolderPath = $BrandingFolderPath
    }
}

Function New-ConfigAndBrandingFolderPath {
    param (
        [parameter(Mandatory = $true)]
        [PSCustomObject] $Config,
        [parameter(Mandatory = $true)]
        [string] $BrandingFolderPath
    )

    return [ConfigAndBrandingFolderPath]::new($Config, $BrandingFolderPath)
}

class BundledExtensionPlusJsSourceFolderPath {
    [BundledExtension] $BundledExtension
    [string] $JsSourceFolderPath

    BundledExtensionPlusJsSourceFolderPath([BundledExtension] $BundledExtension, [string] $JsSourceFolderPath) {
        $this.BundledExtension = $BundledExtension
        $this.JsSourceFolderPath = $JsSourceFolderPath
    }
}

Function New-BundledExtensionPlusJsSourceFolderPath {
    param (
        [parameter(Mandatory = $true)]
        [BundledExtension] $BundledExtension,
        [parameter(Mandatory = $true)]
        [string] $JsSourceFolderPath
    )

    return [BundledExtensionPlusJsSourceFolderPath]::new($BundledExtension, $JsSourceFolderPath)
}

class DevStaticValues {
    [PSCustomObject] $Config # Bundled extensions included in this will be discarded
    [string] $BrandingSourceFolderPath
    [BundledExtensionPlusJsSourceFolderPath[]] $BundledExtensionPlusJsSourceFolderPathArray

    DevStaticValues([PSCustomObject] $Config, [string] $BrandingSourceFolderPath, [BundledExtensionPlusJsSourceFolderPath[]] $BundledExtensionPlusJsSourceFolderPathArray) {
        $this.Config = $Config
        $this.BrandingSourceFolderPath = $BrandingSourceFolderPath
        $this.BundledExtensionPlusJsSourceFolderPathArray = $BundledExtensionPlusJsSourceFolderPathArray
    }
}

Function New-DevStaticValues {
    param (
        [parameter(Mandatory = $true)]
        [PSCustomObject] $Config,
        [parameter(Mandatory = $true)]
        [string] $BrandingSourceFolderPath,
        [parameter(Mandatory = $true)]
        [BundledExtensionPlusJsSourceFolderPath[]] $BundledExtensionPlusJsSourceFolderPathArray
    )

    return [DevStaticValues]::new($Config, $BrandingSourceFolderPath, $BundledExtensionPlusJsSourceFolderPathArray)
}
