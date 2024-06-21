// prevent landscape mode

function updateOrientation() {
    const cock = new Audio('sounds/cocking-a-revolver.mp3');
    cock.play();
}

screen.orientation.addEventListener("change", updateOrientation);

// Access the camera
const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: {ideal: "environment"}  // Use back camera
    }
}).then(stream => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function () {
        console.log('Video is available');
        const segmentation = net.segmentPersonParts(video);
        segmentation.data;
        outputDiv.textContent = 'Ready!';

        console.log('Model is loaded.');
    });

}).catch(err => {
    console.error("Error accessing the camera: " + err);
});

// Load BodyPix model
let net;
bodyPix.load().then(model => {
    net = model;
});

// Mapping of part IDs to part names
let partIdsToNames;

fetch('partIds.json')
    .then(response => response.json())
    .then(data => {
        partIdsToNames = data;
        // Now you can use the partIdsToNames object
    })
    .catch(error => console.error('Error:', error));

// Take a picture and perform body segmentation
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const outputDiv = document.getElementById('output');

// snapButton.addEventListener('click', captureAndSegment);
const div = document.getElementById('myDiv');

div.addEventListener('click', captureAndSegment);

const delay = 500; // Delay in milliseconds (2000ms = 2s)


async function captureAndSegment() {

    if (isCooldown) {
        // Function is on cooldown, do nothing
        return;
    }
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0);

    const audio = new Audio('sounds/deagle-1.mp3');
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

        setTimeout(() => {
            bodypart.play();
        }, delay);

        const bodyPart = partIdsToNames[partId][0];
        outputDiv.textContent = bodyPart;
    } else {
        const missed = new Audio('sounds/missed.mp3');
        setTimeout(() => {
            missed.play();
        }, delay);

        outputDiv.textContent = "Missed!";
    }

    isCooldown = true;

    // Set a delay of 1 second (1000 milliseconds) before resetting the cooldown flag
    setTimeout(() => {
        isCooldown = false;
    }, 1000);
}

let isCooldown = false;