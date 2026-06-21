# QR Studio App 📷

Hi! This is my fourth project. It is a QR code app that can generate new QR codes and scan existing ones using the camera or an uploaded image.
I built it using HTML, CSS and JavaScript, and made it work completely offline by downloading all the libraries and fonts into my own project instead of loading them from the internet.

I am still learning so the code might not be perfect but it works fine and I tried my best 😊

---

## What this app does

- Generate a QR code from any text or link you type
- Choose between 4 different color styles for your QR code
- Download the generated QR code as a PNG image
- Copy the original text used to make the QR code
- Scan a QR code using your phone or laptop camera in real time
- Scan a QR code by uploading an image instead of using the camera
- Automatically shows an "Open link" button if the scanned result is a URL
- Copy the scanned result to clipboard
- Works fully offline once the page is loaded — no internet needed

---
Download the App
You can download and install the APK file directly from this link :

👉 Download Qr APK
https://github.com/krrishsaini708/SCT_AD_4/releases/download/v1.0/app-debug.apk

Note: Your phone might show a security warning since this app is not on the Play Store. Just tap "More Details" and then "Install Anyway" to proceed.

## Technologies I used

| Technology | What I used it for |
|---|---|
| **HTML5** | Structure of the create and scan panels, buttons and layout |
| **CSS3** | Design, dark theme, animations like the sliding tab switch and scan line |
| **JavaScript (ES6)** | All the logic for generating, scanning, camera access and clipboard actions |
| **qrcode (npm package)** | The library that actually draws the QR code onto a canvas |
| **jsQR** | The library that reads pixel data and decodes a QR code from it |
| **getUserMedia API** | Browser API used to access the device camera for live scanning |

---

## Problems I faced

- **Wrong library at first** — I initially downloaded a QR generator library that did not have the function my code needed. I learned that two different libraries can have the same name "qrcode" but completely different features, so I had to find the right one and even bundle it myself using a tool called esbuild
- **CDN vs offline** — All my libraries and fonts were loading from the internet at first. I learned how to download these files and load them locally instead so the app works without wifi or data, which is important since I plan to convert this into an Android app
- **Camera permissions** — The camera would not turn on at first because browsers block camera access on plain HTTP links. I learned that it only works on `localhost` or a secure HTTPS connection

---

## What I learned

- How to use the `getUserMedia()` API to access a device camera
- How to continuously scan video frames using `requestAnimationFrame`
- How to generate and decode QR codes using JavaScript libraries
- How to bundle a Node.js package into a single browser-ready file
- How to make a web app fully offline by saving fonts and libraries locally
- How to build a mobile-first, interactive UI with smooth CSS animations

---

## Screenshots
<img width="717" height="1600" alt="image" src="https://github.com/user-attachments/assets/6c82c25b-9ca8-498e-b73f-39b44ff623d2" />
<img width="717" height="1600" alt="image" src="https://github.com/user-attachments/assets/706f451a-b0bc-4007-8870-a91611254f98" />
<img width="717" height="1600" alt="image" src="https://github.com/user-attachments/assets/a6ae2958-b688-4240-9230-73adc491bcfb" />
<img width="717" height="1600" alt="image" src="https://github.com/user-attachments/assets/426eb915-f32d-4bb5-81f2-f9e2f02f6f97" />

---

## Author

Made by "KRRISH SAINI" as part of my internship project 
Suggest any improvements!🙂
