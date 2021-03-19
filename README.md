# browser-serial

API for communicating with serial ports in the browser. This package is currently under active development. Contributions are more than welcomed!

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
for await (let { value, done } of serial.readLine()) {
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
