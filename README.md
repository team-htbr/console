# Bloeddonatie console
A web based application that makes it possible to control the notifications send to users of the bloeddonatie Android application.

## Run locally

Run `$ bower install` first in the console directory. 

## Basic functionality

Currently it is only possible to send messages to specific devices. Follow the steps below to send a message to your testing device.

1. Connect your Android device with Android Studio or use an emulator
2. Run app on device
3. Toggle **Android monitoring** at the bottom of Android Studio and press the **SHOW TOKEN** button
4. Copy string after **Token:** 
5. Paste string in constant **phoneKey** (`src/js/scripts.js`)
