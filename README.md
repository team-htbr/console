# Bloeddonatie console

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/093bed5c38d34a9f98a90bd8a009706b)](https://www.codacy.com/app/rubenthys22/console?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=team-htbr/console&amp;utm_campaign=Badge_Grade)

A web based application that makes it possible to control the notifications sent to users of the bloeddonatie Android application.

## Run locally

Run `$ bower install` first in the console directory.

## Basic functionality

Currently it is only possible to send messages to specific devices. Follow the steps below to send a message to your testing device.

1. Connect your Android device with Android Studio or use an emulator
2. Run app on device
3. Toggle **Android monitoring** at the bottom of Android Studio and press the **SHOW TOKEN** button in the app
4. Copy string after **Token:**, it will pop up in the Android monitoring tab (example string: dE2Z0lNiB_w:APA91bG4pyDqWhzJKBQjL1z7gPxlcIp8tYBtCvSdtBWFY6ByBF42537J2a6iypJ67T0KRkdGLgJ_u0l7Su2VuE75BVXPU76_fshdUJQ2C5IPkp6dcje_q7vL4QLkc8fc0S0ykBR9q7ys)
5. Paste string in constant **phoneKey** (`src/js/scripts.js`)

## Test POST requests easily

[Request Maker](http://requestmaker.com/)
