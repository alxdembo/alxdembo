// Access the camera
const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: {ideal: "environment"}  // Use back camera
    }
}).then(stream => {
    video.srcObject = stream;
}).catch(err => {
    console.error("Error accessing the camera: " + err);
});

// Load BodyPix model
let net;
bodyPix.load().then(model => {
    net = model;
});

// Mapping of part IDs to part names
const partIdsToNames = {
    0: 'Face',
    1: 'Face',
    2: 'left upper arm front',
    3: 'left upper arm back',
    4: 'right upper arm front',
    5: 'right upper arm back',
    6: 'left lower arm front',
    7: 'left lower arm back',
    8: 'right lower arm front',
    9: 'right lower arm back',
    10: 'left hand',
    11: 'right hand',
    12: 'torso front',
    13: 'torso back',
    14: 'left upper leg front',
    15: 'left upper leg back',
    16: 'right upper leg front',
    17: 'right upper leg back',
    18: 'left lower leg front',
    19: 'left lower leg back',
    20: 'right lower leg front',
    21: 'right lower leg back',
    22: 'left feet',
    23: 'right feet',
};

// Take a picture and perform body segmentation
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const outputDiv = document.getElementById('output');

// snapButton.addEventListener('click', captureAndSegment);
const div = document.getElementById('myDiv');

div.addEventListener('click', captureAndSegment);


async function captureAndSegment() {
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0);


    // Draw crosshair
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    context.strokeStyle = 'red';
    context.beginPath();
    context.moveTo(centerX - 10, centerY);
    context.lineTo(centerX + 10, centerY);
    context.moveTo(centerX, centerY - 10);
    context.lineTo(centerX, centerY + 10);
    context.stroke();

    // Perform body segmentation
    const segmentation = await net.segmentPersonParts(video);

    // Get the body part in the center of the image
    const centerIndex = centerY * canvas.width + centerX;
    const partId = segmentation.data[centerIndex];

    if (partId !== -1) {
        const bodyPart = partIdsToNames[partId];
        outputDiv.textContent = `Shot into ${bodyPart}`;
    } else {
        outputDiv.textContent = "Missed!";
    }
}
