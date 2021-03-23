import {BrowserSerial} from "../src/BrowserSerial"

const serial = new BrowserSerial();
var connect_button = document.getElementById("connect-button");
connect_button.addEventListener("click", () => serial.connect());