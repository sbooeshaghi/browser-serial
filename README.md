# browser-serial
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/sbooeshaghi/browser-serial/issues)
[![DOI](https://zenodo.org/badge/348448190.svg)](https://zenodo.org/badge/latestdoi/348448190)

API for communicating with serial ports in the browser. This package is currently under active development and contributions are more than welcomed! 

## About
This API builds off of the [WICG Serial specification](https://wicg.github.io/serial/) that is currently in an "experimental" phase in Chromium browsers and must be enabled in your browser's Experimental Web Platform Features to use. Copy and paste the following URL to enable it in your browser:

```
chrome://flags/#enable-experimental-web-platform-features
opera://flags/#enable-experimental-web-platform-features
edge://flags/#enable-experimental-web-platform-features
```

To learn more about the status of this feature, see the [WebSerial API Chrome Platform Status](https://chromestatus.com/feature/6577673212002304).

## Installation

```shell
npm install browser-serial
```

## Usage:

Import the package

```js
import { BrowserSerial } from "browser-serial";
const serial = new BrowserSerial();
```

### Connect/disconnect to the serial port on a user-action

For example, connect/disconnect to the port when the user clicks a button.

```js
const serial = new BrowserSerial();

connectButton = document.getElementById("connect-button");
disconnectButton = document.getElementById("disconnect-button");

connectButton.addEventListener("click", () => serial.connect());
disconnectButton.addEventListener("click", () => serial.disconnect());
```

### Read data from the port

```js
// read data continuously, readLoop takes a callback
serial.readLoop(console.log)

// read data line by line as it comes in
for await (let { value, done } of serial.readLineGenerator()) {
  console.log(value)
  if (done === "true") {
    break;
  }
}

```

### Write data to the port

```js
cmdInput = document.getElementById("cmd-input");

cmdInput.addEventListener("change", (e) => serial.write(e.target.value));
```

## Acknowledgments

This code was motivated by https://github.com/GoogleChromeLabs/serial-terminal and builds on the work of those who contributed to the WICG Serial specification, https://github.com/wicg/serial/graphs/contributors.
