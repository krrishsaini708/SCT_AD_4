// Project 4 - QR Studio
// This file has all my logic for generating and scanning QR codes
// For generating I use a library called qrcode.js
// For scanning I use a library called jsQR which can read QR codes from images and video frames
// Both are loaded from a CDN link in my index.html file

// I keep track of the colors the user picked for their QR code
let currentFg = "#16161f"
let currentBg = "#ffffff"

// I save the last generated text so download/copy buttons can use it
let lastGeneratedText = ""

// for the camera scanner
let cameraStream   = null     // holds the active camera stream
let cameraRunning  = false
let scanLoopId     = null     // requestAnimationFrame id so I can stop the loop
let lastDecodedText = ""


// ===================================================
// TAB SWITCHING (Create / Scan)
// ===================================================

function showTab(tab) {
    let generatePanel = document.getElementById("generatePanel")
    let scanPanel     = document.getElementById("scanPanel")
    let thumb         = document.getElementById("switchThumb")
    let btnGen         = document.getElementById("tabGenerate")
    let btnScan        = document.getElementById("tabScan")

    if (tab === "generate") {
        generatePanel.classList.remove("hidden")
        scanPanel.classList.add("hidden")
        thumb.classList.remove("right")
        btnGen.classList.add("active")
        btnScan.classList.remove("active")

        // stop the camera if it was running when we leave the scan tab
        stopCamera()
    } else {
        generatePanel.classList.add("hidden")
        scanPanel.classList.remove("hidden")
        thumb.classList.add("right")
        btnGen.classList.remove("active")
        btnScan.classList.add("active")
    }
}


// ===================================================
// COLOR / STYLE PICKER
// ===================================================

function pickStyle(button) {
    // remove active ring from all swatches
    let allSwatches = document.querySelectorAll(".swatch")
    allSwatches.forEach(function(s) {
        s.classList.remove("active")
    })

    // mark the clicked one as active
    button.classList.add("active")

    // read the colors stored in the data attributes
    currentFg = button.getAttribute("data-fg")
    currentBg = button.getAttribute("data-bg")
}


// ===================================================
// GENERATE QR CODE
// ===================================================

function generateQR() {
    let text = document.getElementById("qrText").value.trim()
    let hintEl = document.getElementById("genHint")

    if (text === "") {
        hintEl.textContent = "Type something first so I have data to encode."
        hintEl.className = "hint error"
        return
    }

    // save it for later (download / copy)
    lastGeneratedText = text

    // clear out anything that was drawn before
    let qrFrame = document.getElementById("qrFrame")
    qrFrame.innerHTML = ""

    // qrcode.js draws onto a canvas I create here
    let canvas = document.createElement("canvas")
    qrFrame.appendChild(canvas)

    QRCode.toCanvas(canvas, text, {
        width: 220,
        margin: 1,
        color: {
            dark: currentFg,
            light: currentBg
        }
    }, function(error) {
        if (error) {
            hintEl.textContent = "Something went wrong, please try again."
            hintEl.className = "hint error"
            return
        }

        // show the result card with a nice fade in animation (handled by css)
        document.getElementById("resultCard").classList.remove("hidden")
        document.getElementById("resultCaption").textContent = text

        hintEl.textContent = "Looks good! You can download it or copy the text below."
        hintEl.className = "hint success"
    })
}


// downloads the generated qr as a png file
function downloadQR() {
    let canvas = document.querySelector("#qrFrame canvas")
    if (!canvas) return

    let link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
}


// copies the original text used to generate the qr
function copyQRText() {
    if (!lastGeneratedText) return
    navigator.clipboard.writeText(lastGeneratedText).then(function() {
        let hintEl = document.getElementById("genHint")
        hintEl.textContent = "Copied to clipboard."
        hintEl.className = "hint success"
    })
}


// ===================================================
// SCAN FROM UPLOADED IMAGE
// ===================================================

function scanFromFile(event) {
    let file = event.target.files[0]
    if (!file) return

    let reader = new FileReader()

    reader.onload = function(e) {
        let img = new Image()
        img.src = e.target.result

        img.onload = function() {
            // draw the uploaded image onto a hidden canvas so jsQR can read its pixels
            let canvas  = document.getElementById("scanCanvas")
            let context = canvas.getContext("2d")

            canvas.width  = img.width
            canvas.height = img.height
            context.drawImage(img, 0, 0)

            let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            let result    = jsQR(imageData.data, imageData.width, imageData.height)

            let hintEl = document.getElementById("scanHint")

            if (result) {
                showDecodedResult(result.data)
                hintEl.textContent = "Decoded from image."
                hintEl.className = "hint success"
            } else {
                hintEl.textContent = "Couldn't find a QR code in that image, try a clearer photo."
                hintEl.className = "hint error"
            }
        }
    }

    reader.readAsDataURL(file)
}


// ===================================================
// LIVE CAMERA SCANNING
// ===================================================

// this runs when the user taps the "Start camera" button
function toggleCamera() {
    if (cameraRunning) {
        stopCamera()
    } else {
        startCamera()
    }
}


async function startCamera() {
    let video       = document.getElementById("cameraView")
    let placeholder = document.getElementById("scanPlaceholder")
    let scanLine    = document.getElementById("scanLine")
    let cameraBtn   = document.getElementById("cameraBtn")
    let hintEl      = document.getElementById("scanHint")

    try {
        // facingMode environment means use the back camera on a phone
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        })

        video.srcObject = cameraStream
        video.classList.remove("hidden")
        placeholder.classList.add("hidden")
        scanLine.classList.add("active")

        await video.play()

        cameraRunning = true
        cameraBtn.textContent = "Stop camera"
        cameraBtn.classList.add("recording")
        hintEl.textContent = "Hold steady, looking for a code..."
        hintEl.className = "hint"

        // start checking video frames for a qr code
        scanVideoFrame()

    } catch (error) {
        // this happens if user has no camera or denies permission
        hintEl.textContent = "Couldn't access the camera. You can still upload an image instead."
        hintEl.className = "hint error"
    }
}


function stopCamera() {
    if (cameraStream) {
        // stop every track (this turns off the camera light too)
        cameraStream.getTracks().forEach(function(track) {
            track.stop()
        })
        cameraStream = null
    }

    if (scanLoopId) {
        cancelAnimationFrame(scanLoopId)
        scanLoopId = null
    }

    cameraRunning = false

    let video       = document.getElementById("cameraView")
    let placeholder = document.getElementById("scanPlaceholder")
    let scanLine    = document.getElementById("scanLine")
    let cameraBtn   = document.getElementById("cameraBtn")

    video.classList.add("hidden")
    placeholder.classList.remove("hidden")
    scanLine.classList.remove("active")
    cameraBtn.textContent = "Start camera"
    cameraBtn.classList.remove("recording")
}


// this checks the live camera feed for a qr code, frame by frame
function scanVideoFrame() {
    let video  = document.getElementById("cameraView")
    let canvas = document.getElementById("scanCanvas")

    // only try to read frames once the video has actual size data
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        let context = canvas.getContext("2d")
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        let result    = jsQR(imageData.data, imageData.width, imageData.height)

        if (result) {
            // found one! show it and stop the camera automatically
            showDecodedResult(result.data)
            stopCamera()

            let hintEl = document.getElementById("scanHint")
            hintEl.textContent = "Decoded from camera."
            hintEl.className = "hint success"
            return  // stop the loop here, no need to keep scanning
        }
    }

    // keep checking the next frame if camera is still running
    if (cameraRunning) {
        scanLoopId = requestAnimationFrame(scanVideoFrame)
    }
}


// ===================================================
// SHOWING THE DECODED RESULT
// ===================================================

function showDecodedResult(text) {
    lastDecodedText = text

    document.getElementById("scanResultCard").classList.remove("hidden")
    document.getElementById("decodedText").textContent = text

    // only show the "Open link" button if the text actually looks like a URL
    let openBtn = document.getElementById("openLinkBtn")
    if (text.startsWith("http://") || text.startsWith("https://")) {
        openBtn.classList.remove("hidden")
    } else {
        openBtn.classList.add("hidden")
    }
}


function openDecodedLink() {
    if (lastDecodedText) {
        // opens the link in a new browser tab
        window.open(lastDecodedText, "_blank")
    }
}


function copyDecodedText() {
    if (!lastDecodedText) return
    navigator.clipboard.writeText(lastDecodedText).then(function() {
        let hintEl = document.getElementById("scanHint")
        hintEl.textContent = "Copied to clipboard."
        hintEl.className = "hint success"
    })
}