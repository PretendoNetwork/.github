# Contributing Guide

The following is a guide designed to help new developers get a feel for how best to contribute to Pretendo. It is important that all who want to help contribute read these guidelines.

#### Table Of Contents

[Code of Conduct](#code-of-conduct)

[Prerequisites](#prerequisites)
  * [Different areas](#different-areas)
  * [Prerequisites for PRUDP](#prerequisites-for-prudp)
  * [Prerequisites for NEX](#prerequisites-for-nex)
  * [Prerequisites for Services](#prerequisites-for-services)
  * [Prerequisites for PUS](#prerequisites-for-pus)
  * [Prerequisites for Misc](#prerequisites-for-misc)
  
[Contributing](#contributing)
  * [Getting started](#getting-started)
  * [Contributing to PRUDP, NEX, or services](#contributing-to-prudp-nex-or-services)

## Code of Conduct

This project and everyone participating in it is governed by the [Pretendo Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Prerequisites

### Different areas

Before you can contribute it is important to know what area you would like to contribute to. Due to the scale and complexity of the network, the Pretendo Network project is split into several different areas of development which cover specific sections of the network. Each of these sections require slightly different prerequisites and background knowledge.

### Prerequisites for PRUDP

PRUDP(S) is the protocol layer ontop of all network requests made by the Nintendo WiiU/3DS family of consoles. It is a simple protocol spec sitting on top of UDP. It aims to make UDP reliable and secure, and was originally developed by [Quazal](http://www.quazal.com/index.html), with a custom version made for Nintendo.

For more information about PRUDP, see [this Wiki](https://github.com/Kinnay/NintendoClients/wiki/PRUDP-Protocol)

### Prerequisites for NEX

NEX is the server middleware/framework used to handle the PRUDP connections. It handles the authentication, done through Kerberos, and connections to the secure server. In Pretendo both the PRUDP and NEX implementations are written in [Golang](http://golang.org). All non-(PR)UDP services are written in [NodeJS](https://nodejs.org).

For more information about NEX, see [this Wiki](https://github.com/Kinnay/NintendoClients/wiki/Game-Server-Overview)

### Prerequisites for Services

Services are servers which implement NEX in a functional way. These can be game servers such as the Super Mario Maker server or Mario Kart 8 match making server, or service servers such as the Friends service, ect.

### Prerequisites for PUS

PUS stands for Pretendo Update Server and, as the name suggests, is the Pretendo implementation of NUS (Nintendo Update Server). This server handles things such as FW updates, serving titles to the eShop, ect. It utilizes SOAP rather than REST. NUS has not been properly reverse engineered, we are simply mimicing what we have seen the official servers send during network dumps.

### Prerequisites for Misc

There are several other, smaller, areas of development. These range from the account server, to the frontend website, the Discord bot, the OTP/SEEPROM/account.dat generation (for [Cemu](http://cemu.info/) users), ect. These serve various purposes and use various languages/technologies.

## Contributing

### Getting started

Before you can contribute you need a few things first. First of all, you need to decided which area you are contributing to. If you are contributing to the development of NEX/PRUDP, or any services using them, you must first install [Golang](http://golang.org) and read the [Prerequisites for PRUDP](#prerequisites-for-prudp) and/or [Prerequisites for NEX](#prerequisites-for-nex) sections.

If you wish to contribute to PUS, or any other parts of the network, you must install [NodeJS](https://nodejs.org) and then read the correct prerequisites section.

### Contributing to PRUDP, NEX, or services

To contribute to PRUDP, NEX, or services decide which console you will be using to test (WiiU or 3DS). Alternatively, if you lack a console you can use [Cemu](http://cemu.info/) to emulate a WiiU, which supports network connections, as well as using this [Python library](https://github.com/Kinnay/NintendoClients) to build custom clients to test with.

If using a physical console or Cemu, you must download and run a local copy of the [account server](https://github.com/PretendoNetwork/account) to direct the client to the local NEX server.

If using the NintendoClients Python library you simply have to point the client to your local NEX server.

If using a physical console, install [Fiddler Proxy](https://www.telerik.com/fiddler) and then follow this setup guide to setup a WiiU (we currently do not have a setup guide for the 3DS):

1. In Fiddler, open `Tools > Options`
2. In the `HTTPS` tab turn on HTTPS Connects
3. Enable HTTPS decrypting
4. Ignore server certificate errors
5. In the `Connections` tab tick `Allow remote computers to connect`
6. Turn off `Act as system proxy on startup`
7. Back in the `HTTPS` tab click `Actions > Export Root Certificate to Desktop`
8. Rename `FiddlerRoot.cer` to `CACERT_NINTENDO_CA_G3.der` wherever you exported it to. Make sure the file extension`.der` NOT `.cer`. If its the wrong format you risk a brick
9. Install FTPiiU_Everywhere (not regular FTPiiU)
10. Launch in to Mocha (redNAND or sysNAND, doesn't matter. Do which ever you want)
11. Launch the Homebrew Launcher and startup FTPiiU_Everywhere
12. Connect to the FTP server on your computer using any FTP client (FileZilla/WinSCP on Windows or Finder on MacOS for example)
13. Navigate to `/storage_mlc/sys/title/0005001b/10054000/content`
14. Dump the `ccerts` folder to your PC (Will be used later. The file you will be using is common to ALL WiiU consoles, so you can download this file online if you want)
15. Enter `scerts` and replace the `CACERT_NINTENDO_CA_G3.der` file there with the `CACERT_NINTENDO_CA_G3.der` file you just made earlier from the `FiddlerRoot.cer` (make sure to backup the original. replacing this cert makes you unable to connect to the official servers without the proxy, you must change it back if you want to disable the proxy and still go online)
16. Close the FTP connection on your computer and exit FTPiiU_Everywhere (press Home button)
17. Reboot your console (Do not force-reboot (holding power button for 4 seconds), reboot normally (only hold for 2 seconds), to prevent cache issues)
18. Go to the connection settings for your WiFi connection on your WiiU and turn on proxy connections
19. Set the proxy server to your PC's IP, and the port to `8888` (unless you changed the Fiddler port)
20. On your PC go to where you dumped `ccerts` and copy `WIIU_COMMON_1_CERT.der` (again, this file is common to all consoles. You can find it online if you want)
21. Paste the cert in `%USERPROFILE%\My Documents\Fiddler2\` and rename it to `ClientCertificate.cer`
22. Open the `FiddlerScript` tab and find the `OnBeforeRequest` method
23. At the end of the method, add:
```
// Change "account.nintendo.net" to whatever official Nintendo server you are replacing
if (oSession.HostnameIs("account.nintendo.net"))
{
    if (oSession.HTTPMethodIs("CONNECT"))
    {
        oSession["x-replywithtunnel"] = "PretendoTunnel";
        return;
    }

    oSession.fullUrl = "address.of.account.server" + oSession.PathAndQuery;
}
```
24. Restart Fiddler to save changes

If using Cemu, follow the [Cemu online play guide](http://compat.cemu.info/wiki/Tutorial:Online_Play) to get Cemu online. Then modify the above steps to work with Cemu (untested).

## Attribution

This contributing guideline is adapted from the [Atom contributing guideline](https://github.com/atom/atom/blob/master/CONTRIBUTING.md).