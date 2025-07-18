# Plxtra Motif

Motif is a browser based extensible trading terminal that is part of [Plxtra](https://plxtra.org)' brokerage / exchange solution.

This repository contains the unconfigured Motif application.  It needs to be paired with a Motif Configuration to make a useable application. See [XOSP Motif Config](/plxtra/xosp-motif-config) for an example configuration.

Note that this npm package is configured to use the PowerShell shell.

## Build

See DockerFile for production build details.

## Debug

This Motif application can be debugged in conjunction with the XOSP Motif Configuration.

The Motif Configuration includes the following Motif extensions:
* [`highcharts-motif-extension`](/plxtra/highcharts-motif-extension/)
* [`ts-demo-motif-extension`](/plxtra/ts-demo-motif-extension/)
* [`website-embed-motif-extension`](/plxtra/website-embed-motif-extension/)

In order to debug Motif, it is necessary for the above Motif Extensions to have been built (with the npm `dist` script).

To Debug:
1. Run `npm run start:xosp-dev` to to start the debug server.  This will:
    * Get a copy of the config file.
    * Generate a `BundledExtension` for each of the Motif extensions the and sets this as the bundled extensions in the config file.
    * Copies the config file and branding files to the `dev_static` folder
    * Copies the JavaScript file(s) under `dist` to the `dev_static` folder

1. If you are using Visual Studio Code, use the `Attach to Chrome` launch configuration to start Chrome and run Motif with this extension.  With this launch configuration you can place breakpoints in any of the extension's source code or the Motif source code.\
Otherwise, go to URL `http://localhost:4200` in your browser and use the browser's development tools to debug Motif.

