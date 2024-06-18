// Access the camera
const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the camera: " + err);
    });

// Load BodyPix model
let net;
bodyPix.load().then(model => {
    net = model;
});

// Mapping of part IDs to part names
const partIdsToNames = {
    0: 'left_face',
    1: 'right_face',
    2: 'left_upper_arm_front',
    3: 'left_upper_arm_back',
    4: 'right_upper_arm_front',
    5: 'right_upper_arm_back',
    6: 'left_lower_arm_front',
    7: 'left_lower_arm_back',
    8: 'right_lower_arm_front',
    9: 'right_lower_arm_back',
    10: 'left_hand',
    11: 'right_hand',
    12: 'torso_front',
    13: 'torso_back',
    14: 'left_upper_leg_front',
    15: 'left_upper_leg_back',
    16: 'right_upper_leg_front',
    17: 'right_upper_leg_back',
    18: 'left_lower_leg_front',
    19: 'left_lower_leg_back',
    20: 'right_lower_leg_front',
    21: 'right_lower_leg_back',
    22: 'left_feet',
    23: 'right_feet',
};

// Take a picture and perform body segmentation
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const outputDiv = document.getElementById('output');

snapButton.addEventListener('click', async () => {
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

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
        outputDiv.textContent = `Body part in the center: ${bodyPart}`;
    } else {
        outputDiv.textContent = "Missed.";
    }
});
