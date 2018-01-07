TP-Link HS100 API
===================

This is a simple API for the TP-Link HS100 Smartplug using NodeJS for local devices.
To use the API you will need to first install thy dependencies.

Setup
-------------

After installing all dependencies, preferably via **npm**, you should now be able to run the test command or just run the **index.js** file in the **/api** folder.

> **Note:**
> - This guide will probably not be updated regularly, so I don't give any guarantees for it to work 
> - This Repo also provides a **Web-Interface** which can be accessed by locally opening the index.html file in the main directory.


**IMPORTANT:**

For this to work from the get-go you need to provide some data for your device inside the **devices.json** file. These will need to be in the following format:

```
{"devices":[
  {
    "name":"Lamp",
    "room":"Living room",
    "ip":"192.168.178.75",
    "mac":"70:4F:57:FA:1D:A2",
    "description":"WiFi Plug",
    "brand":"TP-Link"
  },
  {
    "name":"Desk Lamp",
    "room":"Bedroom",
    "ip":"192.168.178.66",
    "mac":"70:4F:57:FA:1D:C3",
    "description":"WiFi Plug",
    "brand":"TP-Link"
  }
]}
```

> **Note:**
> - More brands and devices may be added in the future. For now every device will just have the same brand, as no other Smartplugs will work with the API.

After all this is set up, you may now make requests to the API normally.
All requests are currently in the form of a post request to **Port 999** and will require the following **JSON** format:

```
{"request":"get_info","ip":"123.456.789"}
```
> **Note:**
> - You will always have to supply the IP of the device, as it is not yet possible to create device objects and the API will need to know which device the command is to be sent to.

Commands
-------------

All currently available commands are listed here. These will of course be added to in the future.


Command  			| Description
-------- 				| ---
`get_info` 			| returns general information about the device and its states
`toggle_relay` 	| toggles the plug on and off alternately
`set_relay_on` 	| activates the plug
`set_relay_off`	| deactivates the plug
`get_relay_state`	| gets the state of the plug (on/off)
`set_led_on`		| activates the led on the device
`set_led_off`		| deactivates the led (night mode)
`get_led_state`	| gets the led state (on/off)

Again to make a request it must be in the following format (**JSON**):
```
{"request":"[request command]","ip":"[IP of the target device]"}
```

Additional Information
-------

- As Cors is a dependency of the API and it is also used, you will in fact be able to run the API express Server and the HTML interface on the same device if you wish to do so.
- If you have any suggestions or bugs to tell me about you can contact me under **julian[at]karhof[dot]net** or just leave an issue on the repo.
- Thanks to [SoftScheck](https://github.com/softScheck/) for providing the Wireshark Dissector and Reverse engineered encryption of the Smartplugs communication protocol.
