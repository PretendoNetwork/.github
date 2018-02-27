# Pretendo

<p align="left">
    <a href="https://discord.gg/rxekqVJ" target="_blank">
        <img src="https://discordapp.com/api/guilds/408718485913468928/widget.png?style=banner3">
    </a>
</p>

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)

## A close-as-possible server emulation project for the 3DS and WiiU

# What is this useful for?
1. Preservation - The WiiU and the 3DS, just like every other consoles, have an EOL (End of Life.) There will be a point where Nintendo shuts the entirety of Nintendo Network that the WiiU and 3DS depend on for many features. One of the goals with this project is to keep Nintendo Network alive, and to prepare for the EOL.
2. Customization - With a custom server you have full control. Nintendo currently enforces certain things which may not be desirable to all (for example, requiring console-specific information to login and use services, as official accounts are tied to consoles.) This could also become useful for tools like Cemu and Citra, as the former currently supports online play but requires dumps of console-specific files to get online (as, again, official accounts are tied to consoles.) Custom servers could remove this barrier and allow anyone to go online with Cemu (and potentially Citra, if they make it work)

# Cool! How far along is it?
Not far at all. Currently only NNID accounts work, and no games are currently supported

# Supported games:
- None yet

# Running a server
### Prerequisites:
- [NodeJS](https://nodejs.org/en/)
- [Fiddler](https://www.telerik.com/fiddler)
- [Python](https://python.org)
- [This repo](https://github.com/PretendoNetwork/Pretendo/archive/master.zip) (or just clone it)
- Homebrew on either your [WiiU](https://wiiu.hacks.guide) or [3DS](https://3ds.hacks.guide)
- [This file](https://mega.nz/#!5rx1xKyS!iusrXFMZUiYhuOO-wAsi9FQyBIVdmpvYHyBqqn_GOcU). If you would like to get it yourself, go down to the 'Getting the ClientCertificate.cer' for your respective console.
- [This set of patches for the 3DS](https://mega.nz/#!UuxnxIKK!vRCKoU88RUu7uqvTXFNErWOoccxvN7kskaQAoMZ-00w)

### Setup (Computah):
1. Enter the source folder (where you downloaded it to)
2. Type `python launch.py` on your computer
3. In Fiddler, open `Tools > Options`
4. In the `HTTPS` tab turn on HTTPS Connects
5. Enable HTTPS decrypting
6. Ignore server certificate errors
7. In the `Connections` tab tick `Allow remote computers to connect`
8. Turn off `Act as system proxy on startup`
9. Back in the `HTTPS` tab click `Actions > Export Root Certificate to Desktop`
10. Rename `FiddlerRoot.cer` to `CACERT_NINTENDO_CA_G3.der` wherever you exported it to.
11. Go complete on of the console sections
12. Open the `FiddlerScript` section of the Fiddler UI and find the `OnBeforeRequest` method
13. At the end of the method, add:
```
// Change "account.nintendo.net" to whatever server you are replacing
if (oSession.HostnameIs("account.nintendo.net"))
{
    if (oSession.HTTPMethodIs("CONNECT"))
    {
        // This is just a fake tunnel for CONNECT requests
        oSession["x-replywithtunnel"] = "PretendoTunnel";
        return;
    }

    // Change "http://account.pretendo.cc" to your custom server address
    oSession.fullUrl = "http://account.pretendo.cc" + oSession.PathAndQuery;
}
```
14. Move the ClientCertificate.cer that you downloaded or obtained to `%USERPROFILE%\My Documents\Fiddler2\`
15. Restart Fiddler to apply changes

### Setup (WiiU):
Quick note, you will need Mocha installed on your WiiU. If you followed the guide all the way through, you will.
1. Install FTPiiU_Everywhere (NOT THE REGULAR FTPiiU!)
2. In your WiiU launch in to Mocha (redNAND or sysNAND, doesn't matter. Do which ever you want)
3. Launch the Homebrew Launcher and startup FTPiiU_Everywhere
4. Connect to the FTP server on your computer. On Windows, I use FileZilla. On Linux, I just use the `ftp` command. On MacOS, I use Finder.
5. Go to `/vol/storage_mlc01/sys/title/0005001b/10054000/content`
6. Enter `scerts` and replace the `CACERT_NINTENDO_CA_G3.der` file there with the `CACERT_NINTENDO_CA_G3.der` file we just made earlier from the FiddlerRoot.cer
7. Close the FTP connection on your computer and exit FTPiiU_Everywhere (press Home button)
8. Reboot your console (DO NOT FORCE REBOOT (holding power button for 4 seconds)! REBOOT NORMALLY! FORCE REBOOTING CAN SOMETIMES ERASE CHANGES!)
9. Go to the connection settings for your WiFi connection on your WiiU and turn on proxy connections
10. Set the proxy server to your PC's IP, and the port to `8888` (unless you changed the Fiddler port)
11. Congratulations! You have now set up a Pretendo server.

### Getting the ClientCertificate.cer (WiiU):
1. Launch FTPiiU_Everywhere
2. Connect to the FTP server on your computer.
3. Go to /vol/storage_mlc01/sys/title/0005001b/10054000/content/
4. Dump the ccerts folder to your computer.
5. Disconnect from the WiiU and exit FTPiiU_Everywhere on it.
6. On your PC go to wher you dumped ccerts and rename WIIU_COMMON_1_CERT.der to ClientCertificate.cer
7. Congratulations! You now have your own copy of ClientCertificate.cer. Now you can go through the setup of creating your own Pretendo server!

# Currently implemented endpoints
- [GET] https://account.nintendo.net/v1/api/admin/mapped_ids
- [GET] https://account.nintendo.net/v1/api/content/time_zones/:REGION/:LANGUAGE
- [GET] https://account.nintendo.net/v1/api/content/agreements/:TYPE/:REGION/:VERSION (partly, need help<sup id="a1">[1](#f1)</sup>)
- [GET] https://account.nintendo.net/v1/api/devices/@current/status
- [ALL] https://account.nintendo.net/v1/api/oauth20/access_token/generate (Both `password` and `refresh_token` grant types)
- [POST] https://account.nintendo.net/v1/api/people (PARTLY! NEED HELP!<sup id="a3">[3](#f3)</sup>)
- [GET] https://account.nintendo.net/v1/api/people/:USERNAME
- [GET] https://account.nintendo.net/v1/api/people/@me/profile
- [PUT] https://account.nintendo.net/v1/api/people/@me/miis/@primary
- [GET] https://account.nintendo.net/v1/api/people/@me/devices/owner
- [POST] https://account.nintendo.net/v1/api/people/@me/devices
- [GET] https://account.nintendo.net/v1/api/people/@me/devices
- [PUT] https://account.nintendo.net/v1/api/people/@me/devices/@current/inactivate
- [POST] https://account.nintendo.net/v1/api/people/@me/deletion
- [GET] https://account.nintendo.net/v1/api/provider/service_token/@me
- [GET] https://account.nintendo.net/v1/api/provider/nex_token/@me (partly, still in testing)
- [PUT] https://account.nintendo.net/v1/api/support/email_confirmation/:USERPID/:CONFIRMCODE
- [POST] https://account.nintendo.net/v1/api/support/validate/email
- [GET] https://id.nintendo.net/account/email-confirmation



### Footnotes

<b id="f1">1</b> I do not know what other `TYPE`'s there are. I currently only know of one, `Nintendo-Network-EULA`, I still am unsure as to when I should throw error `1102` and I lack the remaining data for the rest of the EULA agreements. [↩](#a1)

<b id="f3">2</b> There are MANY values here that Nintendo seems to generate on their servers. I have no idea what some of these values mean and where/how they are used. Because of this I am unsure how to properly generate these values, and I am using placeholder values instead! ([see here for an example of what the return for an account is ](https://github.com/RedDuckss/csms/blob/master/OFFICIAL_SCHEMA.md#grab-profile))

The entire `accounts` section at the beginning is new, and not sent by the registration request. It seems to have something to do with eShop accounts, though I don't know what exactly. I went to the eShop and it never even makes a request to that endpoint so the eShop isn't using that data, yet it's the only "account" mentioned. I am also unsure as to what `active_flag` is used for. There are also several `id` fields that seem completely pointless, like the `id` field in the `email` section and how the `mii` has it's own `id`, as do each of the different `mii_image` fields. [↩](#a3)

# Developer and general thanks list

### Developers:
![RedDuckss' avatar](https://avatars1.githubusercontent.com/u/27011796?s=40&v=4)&nbsp;&nbsp;[RedDuckss](https://github.com/RedDuckss) | Lead Developer
<br><br>
![SuperMarioDaBom's avatar](https://avatars2.githubusercontent.com/u/19657053?s=40&v=4)&nbsp;&nbsp;[SuperMarioDaBom](https://github.com/SuperMarioDaBom) | Development
<br><br>
![superwhiskers' vatar](https://avatars2.githubusercontent.com/u/10212424?s=40&v=4)&nbsp;&nbsp;[superwhiskers](https://github.com/superwhiskers) | Development
