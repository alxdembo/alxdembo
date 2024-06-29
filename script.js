const outputDiv = document.getElementById('output');
const gallery = document.getElementById('gallery');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const canvas2 = document.getElementById('canvas');
const context2 = canvas2.getContext('2d');

const div = document.getElementById('myDiv');
const video = document.getElementById('video');

let isCooldown = false;
let capturedImages = [];
// snapButton.addEventListener('click', captureAndSegment);

function updateOrientation() {
    const cock = new Audio('sounds/cocking-a-revolver.mp3');
    cock.play();
}

screen.orientation.addEventListener("change", updateOrientation);

// Access the camera

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: {ideal: "environment"},  // Use back camera
        height: {ideal: 600}, width: {ideal: 600},
    }
}).then(stream => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function () {
        console.log('Video is available');

        // Make the video proportions square
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const size = Math.min(videoWidth, videoHeight);
        video.width = size;
        video.height = size;

        const segmentation = net.segmentPersonParts(video);
        segmentation.data;
        outputDiv.textContent = 'Ready!';
        setTimeout(() => {
            outputDiv.textContent = '';
        }, delay);
        console.log('Model is loaded.');
    });
    video.addEventListener('play', function () {
        function draw() {
            if (video.paused || video.ended) {
                return;
            }
            context2.drawImage(video, 0, 0, canvas2.width, canvas2.height);
            // applySepia(context2);
            requestAnimationFrame(draw);

        }

        draw();
    });
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


div.addEventListener('click', captureAndSegment);

const delay = 500; // Delay in milliseconds (2000ms = 2s)


async function captureAndSegment() {
    if (isCooldown) {
        return;
    }
    const audio = new Audio('sounds/deagle-1.mp3');
    audio.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');
    addImageToGallery(imageDataURL);

    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);

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

        outputDiv.textContent = partIdsToNames[partId][0];
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

function addImageToGallery(imageDataURL) {
    capturedImages.unshift(imageDataURL);
    if (capturedImages.length > 3) {
        capturedImages.pop();
    }
    renderGallery();
}

function renderGallery() {
    gallery.innerHTML = '';
    capturedImages.forEach(imageDataURL => {
        const img = document.createElement('img');
        img.src = imageDataURL;
        gallery.appendChild(img);
    });
}