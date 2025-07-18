class PublisherId {
    [string] $type
    [string] $name

    PublisherId([string] $Type, [string] $Name) {
        $this.type = $Type
        $this.name = $Name
    }
}

Function New-PublisherId {
    param (
        [parameter(Mandatory = $true)]
        [string] $Type,
        [parameter(Mandatory = $true)]
        [string] $Name
    )

    return [PublisherId]::new($Type, $Name)
}

class BundledExtensionInfo {
    [PublisherId] $publisherId
    [string] $name
    [string] $version
    [string] $apiVersion
    [string] $shortDescription
    [string] $longDescription
    [string] $urlPath

    BundledExtensionInfo(
        [PublisherId] $PublisherId,
        [string] $Name,
        [string] $Version,
        [string] $ApiVersion,
        [string] $ShortDescription,
        [string] $LongDescription,
        [string] $UrlPath
    ) {
        $this.publisherId = $PublisherId
        $this.name = $Name
        $this.version = $Version
        $this.apiVersion = $ApiVersion
        $this.shortDescription = $ShortDescription
        $this.longDescription = $LongDescription
        $this.urlPath = $UrlPath
    }
}

Function New-BundledExtensionInfo {
    param (
        [parameter(Mandatory = $true)]
        [PublisherId] $PublisherId,
        [parameter(Mandatory = $true)]
        [string] $Name,
        [parameter(Mandatory = $true)]
        [string] $Version,
        [parameter(Mandatory = $true)]
        [string] $ApiVersion,
        [parameter(Mandatory = $true)]
        [string] $ShortDescription,
        [parameter(Mandatory = $true)]
        [string] $LongDescription,
        [parameter(Mandatory = $true)]
        [string] $UrlPath
    )

    return [BundledExtensionInfo]::new($PublisherId, $Name, $Version, $ApiVersion, $ShortDescription, $LongDescription, $UrlPath)
}

class BundledExtension {
    [BundledExtensionInfo] $info
    [bool] $install

    BundledExtension([BundledExtensionInfo] $Info, [bool] $Install) {
        $this.info = $Info
        $this.install = $Install
    }
}

Function New-BundledExtension {
    param (
        [parameter(Mandatory = $true)]
        [BundledExtensionInfo] $Info,
        [parameter(Mandatory = $true)]
        [bool] $Install
    )

    return [BundledExtension]::new($Info, $Install)
}
