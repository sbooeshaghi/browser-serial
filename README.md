# browser-serial

API for communicating with serial ports in the browser. This package is currently under active development. Contributions are more than welcomed!

## Installation

```
npm install browser-serial
```

## Usage:

Import the package

```
import { BrowserSerial } from "browser-serial";
const serial = new BrowserSerial();
```

## Connect/disconnect to the serial port on a user-action

For example, connect/disconnect to the port when the user clicks a button.

```
const serial = new BrowserSerial();
connect_button = document.getElementById("connect-button");
disconnect_button = document.getElementById("disconnect-button");

connect_button.addEventListener("click", () => serial.connect());
disconnect_button.addEventListener("click", () => serial.disconnect());
```

## Read data from the port

```
// read data continuously, readLoop takes a callback
serial.readLoop(console.log)

// read data line by line as it comes in
for await (let { value, done } of serial.readLine()) {
  console.log(value)
  if (done === "true") {
    break;
  }
}

```

---

## Acknowledgments

This code was motivated by https://github.com/GoogleChromeLabs/serial-terminal and builds on the work of those contributed to the WICG Serial specification, https://github.com/wicg/serial/graphs/contributors.
