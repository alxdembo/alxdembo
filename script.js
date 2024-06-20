// prevent landscape mode

screen.orientation.addEventListener("change", (event) => {
    var cock = new Audio('cocking-a-revolver.mp3');
    cock.play();
});


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
    0: ['Headshot!', 'headshot.mp3'],
    1: ['Headshot!', 'headshot.mp3'],
    2: ['Left arm', 'left_arm.mp3'],
    3: ['Left arm', 'left_arm.mp3'],
    6: ['Left arm', 'left_arm.mp3'],
    7: ['Left arm', 'left_arm.mp3'],
    10: ['Left arm', 'left_arm.mp3'],
    4: ['Right arm', 'right_arm.mp3'],
    5: ['Right arm', 'right_arm.mp3'],
    8: ['Right arm', 'right_arm.mp3'],
    9: ['Right arm', 'right_arm.mp3'],
    11: ['Right arm', 'right_arm.mp3'],
    12: ['Torso', 'torso.mp3'],
    13: ['Torso', 'torso.mp3'],
    14: ['Left leg', 'left_leg.mp3'],
    15: ['Left leg', 'left_leg.mp3'],
    18: ['Left leg', 'left_leg.mp3'],
    19: ['Left leg', 'left_leg.mp3'],
    22: ['Left leg', 'left_leg.mp3'],
    16: ['Right leg', 'right_leg.mp3'],
    17: ['Right leg', 'right_leg.mp3'],
    20: ['Right leg', 'right_leg.mp3'],
    21: ['Right leg', 'right_leg.mp3'],
    23: ['Right leg', 'right_leg.mp3'],
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

    var audio = new Audio('deagle-1.wav');
    audio.play();


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
        var bodypart = new Audio('sounds/' + partIdsToNames[partId][1]);
        bodypart.play();

        const bodyPart = partIdsToNames[partId][0];
        outputDiv.textContent = `Shot into ${bodyPart}`;
    } else {
        const missed = new Audio('sounds/missed.mp3');
        missed.play();

        outputDiv.textContent = "Missed!";
    }
}
