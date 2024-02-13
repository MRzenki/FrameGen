// Get the canvas and context
let userCanvas = document.getElementById('userCanvas');
let frameCanvas = document.getElementById('frameCanvas');
let ctxUser = userCanvas.getContext('2d');
let ctxFrame = frameCanvas.getContext('2d');

// Create new Image objects
let userImage = new Image();
let frameImage = new Image();

// Variables to store the current position and scale of the image
let posX = 0;
let posY = 0;
let scale = 1;

// Get the header element
let header = document.getElementById('header');

// Create a new instance of Hammer on the header
let hammerHeader = new Hammer(header);

// Set the press event options
hammerHeader.get('press').set({ time: 2000 }); // 2 seconds

// Function to unlock the hidden frame
function unlockHiddenFrame() {
    alert('Congratulations! You have unlocked a new frame option.');

    // Add the hidden frame to the list of frames
    let frameSelect = document.getElementById('frame');
    let option = document.createElement('option');
    option.value = 'baby.png';
    option.text = 'Secret Frame';
    frameSelect.add(option);
}

// Variable to store the timer
let timer;

// Start the timer when the user presses the mouse button
header.addEventListener('mousedown', function(e) {
    // Check if the pointer type is mouse
    if (e.pointerType === 'mouse') {
        timer = setTimeout(unlockHiddenFrame, 2000); // 2 seconds
    }
});

// Cancel the timer when the user releases the mouse button
header.addEventListener('mouseup', function(e) {
    // Check if the pointer type is mouse
    if (e.pointerType === 'mouse') {
        clearTimeout(timer);
    }
});

// Listen for the press event
hammerHeader.on('press', unlockHiddenFrame);

// Set the size of the canvas to match the size of the frameCanvas
userCanvas.width = 1080; // Set the width to 1080
userCanvas.height = 1080; // Set the height to 1080
frameCanvas.width = 1080; // Set the width to 1080
frameCanvas.height = 1080; // Set the height to 1080

// Load an image when the user selects a file
document.getElementById('user_image').addEventListener('change', function(e) {
    let reader = new FileReader();
    reader.onload = function(event) {
        userImage.onload = function() {
            // Calculate the correct dimensions for the image to preserve its aspect ratio
            let aspectRatio = userImage.width / userImage.height;
            let newWidth = frameCanvas.width; // Set the new width to the width of the frame canvas
            let newHeight = newWidth / aspectRatio; // Calculate the new height based on the aspect ratio
        
            // Calculate an initial scale based on the ratio of the canvas width to the image width
            scale = frameCanvas.width / userImage.width;
        
            // Calculate initial posX and posY values to center the image on the canvas
            posX = (frameCanvas.width - newWidth) / 2;
            posY = (frameCanvas.height - newHeight) / 2;
        
            ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
            ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);

            // Change the cursor style after the image has been successfully loaded
            document.getElementById('userCanvas').style.cursor = 'move';
        }
        userImage.onerror = function() {
            alert('Invalid image file. Please select a different file.');
        }
        userImage.src = event.target.result;
    }
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    }
    reader.readAsDataURL(e.target.files[0]);
}, false);

// Load a frame when the user selects a frame
let frameSelect = document.getElementById('frame');
frameSelect.addEventListener('change', function(e) {
    frameImage.onload = function() {
        // Calculate the correct height for the image to preserve its aspect ratio
        let aspectRatio = frameImage.width / frameImage.height;
        let newHeight = frameCanvas.width / aspectRatio;

        ctxFrame.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        ctxFrame.drawImage(frameImage, 0, 0, frameCanvas.width, newHeight);
    }
    frameImage.src = 'img/' + e.target.value;
}, false);

// Trigger the 'change' event to load the first frame
let event = new Event('change');
frameSelect.dispatchEvent(event);

// Use Hammer.js to add pinch, zoom, and pan functionality
let hammer = new Hammer(userCanvas);
hammer.get('pinch').set({ enable: true });
hammer.get('pan').set({ enable: true });

let initialScale = 1;
hammer.on('pinchstart', function(e) {
    initialScale = scale;
});

hammer.on('pinchmove', function(e) {
    // Scale the image based on the pinch gesture
    scale = initialScale * e.scale;
    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
});

let initialPosX = 0;
let initialPosY = 0;
hammer.on('panstart', function(e) {
    initialPosX = posX;
    initialPosY = posY;
});

hammer.on('panmove', function(e) {
    // Move the image based on the pan gesture
    posX = initialPosX + e.deltaX;
    posY = initialPosY + e.deltaY;
    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
});

// ----------------- Add the following code to the end of the javascript.js file -----------------

// Create a download button
let downloadButton = document.createElement('button');
downloadButton.id = 'downloadButton'; // Add an id to the button for styling

// Create an img element for the button icon
let buttonIcon = document.createElement('img');
buttonIcon.src = 'img/download.png'; // Set the source of the img
buttonIcon.alt = 'Download'; // Set the alt text of the img

// Append the img to the button
downloadButton.appendChild(buttonIcon);

// Create a text node and append it to the button
let buttonText = document.createTextNode(' Download');
downloadButton.appendChild(buttonText);

// Add an event listener to the download button
downloadButton.addEventListener('click', function() {
    // Create a new canvas to combine the user image and the frame
    let combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = userCanvas.width;
    combinedCanvas.height = userCanvas.height;
    let ctxCombined = combinedCanvas.getContext('2d');

    // Draw the user image and the frame on the new canvas
    ctxCombined.drawImage(userCanvas, 0, 0);
    ctxCombined.drawImage(frameCanvas, 0, 0);

    // Create a new anchor element
    let link = document.createElement('a');

    // Set the href of the anchor element to the data URL of the new canvas
    link.href = combinedCanvas.toDataURL('image/png');

    // Set the download attribute of the anchor element
    link.download = 'edited-frame.png';

    // Simulate a click on the anchor element
    link.click();
});

// Append the download button to the body of the document
document.body.appendChild(downloadButton);

// Initially hide the download button
downloadButton.style.display = 'none';

// Show the download button when the user selects an image
document.getElementById('user_image').addEventListener('change', function(e) {
    downloadButton.style.display = 'flex';
}, false);


// let last_known_scroll_position = 0;
// let ticking = false;

// window.addEventListener('scroll', function(e) {
//     last_known_scroll_position = window.scrollY;

//     if (!ticking) {
//         window.requestAnimationFrame(function() {
//             if ((window.innerHeight + last_known_scroll_position) >= document.body.offsetHeight - 10) {
//                 downloadButton.style.flexDirection = 'column';
//             } else {
//                 downloadButton.style.flexDirection = 'row';
//             }
//             ticking = false;
//         });

//         ticking = true;
//     }
// });

// Create a recenter button
let recenterButton = document.createElement('button');
recenterButton.id = 'recenterButton'; // Add an id to the button for styling

// Create an img element and set its src attribute to the path of your image
let recenterButtonIcon = document.createElement('img');
recenterButtonIcon.src = 'img/reset.png';

// Append the img element to the button
recenterButton.appendChild(recenterButtonIcon);

// Add an event listener to the recenter button
recenterButton.addEventListener('click', function() {
    // Calculate the correct dimensions for the image to preserve its aspect ratio
    let aspectRatio = userImage.width / userImage.height;
    let newWidth = frameCanvas.width; // Set the new width to the width of the frame canvas
    let newHeight = newWidth / aspectRatio; // Calculate the new height based on the aspect ratio

    // Calculate an initial scale based on the ratio of the canvas width to the image width
    scale = frameCanvas.width / userImage.width;

    // Calculate initial posX and posY values to center the image on the canvas
    posX = (frameCanvas.width - newWidth) / 2;
    posY = (frameCanvas.height - newHeight) / 2;

    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
});

// Append the recenter button to the body of the document
document.body.appendChild(recenterButton);

// Initially hide the recenter button
recenterButton.style.display = 'none';

// Show the recenter button when the user selects an image
document.getElementById('user_image').addEventListener('change', function(e) {
    recenterButton.style.display = 'flex';
}, false);