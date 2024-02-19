// PRELOADING IMAGES
let preloadedFrames = {};
let frameNames = ['SO INLOVE', 'BLESSED', 'SINGLE & BLESSED', 'STUDY FIRST', 'WAITING FOR GOD\'S WILL', 'FAITHFULL COMMITTED', 'IT\'S COMPLICATED', 'MOVING FORWARD', 'PUT GOD FIRST'];
let frameFiles = ['frame8.png', 'frame7.png', 'frame1.png', 'frame6.png', 'frame2.png', 'frame3.png', 'frame5.png', 'frame4.png', 'frame9.png', 'baby.png'];

frameFiles.forEach(function(frameFile, index) {
    let img = new Image();
    img.onload = function() {
        preloadedFrames[frameFile] = img;

        // If this is the last image, populate the select element and dispatch the 'change' event
        if (index === frameFiles.length - 1) {
            let frameSelect = document.getElementById('frame');
            frameNames.forEach(function(name, index) {
                let option = document.createElement('option');
                option.value = frameFiles[index];
                option.text = name;
                frameSelect.add(option);
            });

            let event = new Event('change');
            frameSelect.dispatchEvent(event);
        }
    }
    img.src = 'img/' + frameFile;
});

// Get the canvas and context
let userCanvas = document.getElementById('userCanvas');
let frameCanvas = document.getElementById('frameCanvas');
let ctxUser = userCanvas.getContext('2d');
let ctxFrame = frameCanvas.getContext('2d');

// Create new Image objects
let userImage = new Image();
userImage.crossOrigin = "anonymous"; // Add this line
let frameImage = new Image();
frameImage.crossOrigin = "anonymous"; // Add this line

// Get the header element
let header = document.getElementById('header');
// Create a new instance of Hammer on the header
let hammerHeader = new Hammer(header);

// Set the press event options
hammerHeader.get('press').set({ time: 2000 }); // 2 seconds


// Variable to store whether the secret frame has been unlocked
let isFrameUnlocked = false;

// Function to unlock the hidden frame
function unlockHiddenFrame() {
    // Check if the frame has already been unlocked
    if (isFrameUnlocked) {
        alert('You have already unlocked the secret frame.');
        return;
    }

    alert('Congratulations! You have unlocked a new frame option.');

    // Add the hidden frame to the list of frames
    let frameSelect = document.getElementById('frame');
    let secretGroup = document.createElement('optgroup');
    secretGroup.label = '--- Secret Frame ---';
    let option = document.createElement('option');
    option.value = 'baby.png';
    option.text = 'BABY, KALMA';
    secretGroup.appendChild(option);
    frameSelect.appendChild(secretGroup);

    // Set the frame as unlocked
    isFrameUnlocked = true;
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

// ------------------------------------ IMAGE LOADING CODE ------------------------------------------------------- //
// Create a new canvas for the blurred background
let backgroundCanvas = document.createElement('canvas');
let preview = document.getElementById('preview');

// Set the width and height to match the preview div
backgroundCanvas.width = preview.offsetWidth;
backgroundCanvas.height = preview.offsetHeight;

// Position it absolutely
backgroundCanvas.style.position = 'absolute';

// Place it behind all other canvases
backgroundCanvas.style.zIndex = -1;

// Append the backgroundCanvas to the preview div
preview.appendChild(backgroundCanvas);

// Get the context of the backgroundCanvas
let ctxBackground = backgroundCanvas.getContext('2d');

// Load an image when the user selects a file
document.getElementById('user_image').addEventListener('change', function(e) {
    let reader = new FileReader();

    // Show the spinner
    document.getElementById('spinner').style.display = 'block';
    
    reader.onload = function(event) {
        userImage.onload = function() {
            // Reset the position and scale variables
            posX = 0;
            posY = 0;
            scale = 1;
            initialScale = 1;
            initialPosX = 0;
            initialPosY = 0;
            // Calculate the correct dimensions for the user image to preserve its aspect ratio
            let userAspectRatio = userImage.width / userImage.height;
            let userNewWidth = frameCanvas.width; // Set the new width to the width of the frame canvas
            let userNewHeight = userNewWidth / userAspectRatio; // Calculate the new height based on the aspect ratio

            // Calculate an initial scale based on the ratio of the canvas width to the image width
            scale = frameCanvas.width / userImage.width;

            // Calculate initial userPosX and userPosY values to center the image on the canvas
            let userPosX = (frameCanvas.width - userNewWidth) / 2;
            let userPosY = (frameCanvas.height - userNewHeight) / 2;

            ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
            ctxUser.drawImage(userImage, userPosX, userPosY, userImage.width * scale, userImage.height * scale);

            // Check if the canvas is tainted
            try {
                let dataUrl = userCanvas.toDataURL();
                console.log('Canvas is not tainted');
            } catch (error) {
                if (error instanceof DOMException && error.name === 'SecurityError') {
                    console.log('Canvas is tainted');
                } else {
                    throw error;
                }
            }

            // Add the dashed border
            previewWrapper.classList.add('dashed-border'); // <-- Change this line

            // Change the cursor style after the image has been successfully loaded
            document.getElementById('userCanvas').style.cursor = 'move';

            // Create a new canvas to hold the blurred image
            let blurredCanvas = document.createElement('canvas');
            blurredCanvas.width = userCanvas.width;
            blurredCanvas.height = userCanvas.height;

            // Get the context of the blurredCanvas
            let ctxBlurred = blurredCanvas.getContext('2d');

            // Apply a blur effect to the image
            ctxBlurred.filter = 'blur(20px)'; // Increase the value to apply more blur

            // Draw the image on the blurredCanvas
            ctxBlurred.drawImage(userImage, 0, 0, blurredCanvas.width, blurredCanvas.height);

            // Clear the background canvas before drawing the new blurred image
            ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

            // Calculate the correct dimensions for the blurred image to preserve its aspect ratio
            let blurredAspectRatio = userImage.width / userImage.height;
            let blurredNewWidth, blurredNewHeight;

            if (backgroundCanvas.width / backgroundCanvas.height > blurredAspectRatio) {
                // If the aspect ratio of the background canvas is greater than the aspect ratio of the image,
                // set the width of the image to the width of the canvas and calculate the height
                blurredNewWidth = backgroundCanvas.width;
                blurredNewHeight = blurredNewWidth / blurredAspectRatio;
            } else {
                // If the aspect ratio of the background canvas is less than the aspect ratio of the image,
                // set the height of the image to the height of the canvas and calculate the width
                blurredNewHeight = backgroundCanvas.height;
                blurredNewWidth = blurredNewHeight * blurredAspectRatio;
            }

            // Calculate the position to center the image on the canvas
            let blurredPosX = (backgroundCanvas.width - blurredNewWidth) / 2;
            let blurredPosY = (backgroundCanvas.height - blurredNewHeight) / 2;

            // Draw the blurred image on the backgroundCanvas
            ctxBackground.drawImage(blurredCanvas, blurredPosX, blurredPosY, blurredNewWidth, blurredNewHeight);
        }
        userImage.onerror = function() {
            // Hide the spinner
            document.getElementById('spinner').style.display = 'none';

            alert('Invalid image file. Please select a different file.');
        }
        userImage.src = event.target.result;
    }
    reader.onerror = function() {
        // Hide the spinner
        document.getElementById('spinner').style.display = 'none';

        alert('Error reading file. Please try again.');
    }
    reader.readAsDataURL(e.target.files[0]);
}, false);

frameCanvas.addEventListener('transitionend', function(e) {
    // Check if the transition that ended is an opacity transition
    if (e.propertyName === 'opacity') {
        // If isMoving is false, ensure that the opacity is reset to 1.0
        if (!isMoving) {
            frameCanvas.style.opacity = 1.0;
        }
    }
});

let isFirstLoad = true;
// Load a frame when the user selects a frame
let frameSelect = document.getElementById('frame');
frameSelect.addEventListener('change', function(e) {
    let selectedFrame = preloadedFrames[e.target.value];
    if (selectedFrame) {
        // Update frameImage
        frameImage = selectedFrame;

        // Calculate the correct height for the image to preserve its aspect ratio
        let aspectRatio = selectedFrame.width / selectedFrame.height;
        let newHeight = frameCanvas.width / aspectRatio;

        if (isFirstLoad) {
            // Bounce and fade out the frameCanvas
            frameCanvas.style.transform = 'scale(1.2)';
            frameCanvas.style.opacity = 0;
            
            // Wait for the transition to finish
            setTimeout(function() {
                ctxFrame.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
                ctxFrame.drawImage(frameImage, 0, 0, frameCanvas.width, newHeight);
            
                // Return the frameCanvas to its original size and fade in
                frameCanvas.style.transform = 'scale(1)';
                frameCanvas.style.opacity = 1;
            
                // Set isFirstLoad to false after the first load
                isFirstLoad = false;
            }, 500); // Match this with the duration of your transition
        } else {
            ctxFrame.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
            ctxFrame.drawImage(frameImage, 0, 0, frameCanvas.width, newHeight);
        }
    } else {
        console.error('Frame not found: ' + e.target.value);
    }
}, false);

// Trigger the 'change' event to load the first frame
let event = new Event('change');
frameSelect.dispatchEvent(event);

// ------------------------------------ HAMMER.JS CODE ------------------------------------------------------- //
let previewWrapper = document.getElementById('previewWrapper');

// Use Hammer.js to add pinch, zoom, and pan functionality
let hammer = new Hammer(userCanvas, { touchAction: 'none' });
hammer.get('pinch').set({ enable: true });
hammer.get('pan').set({ enable: true });

// Variables to store the current position and scale of the image
let posX = 0;
let posY = 0;
let scale = 1;

let initialScale = 1;
let initialPosX = 0;
let initialPosY = 0;

// Assume ctxFrame is the context of the frameCanvas
let isMoving = false;

let moveFactor = 2; // Increase this value to increase the sensitivity of the pinch gesture for moving the image
let panMoveFactor = 4; // Increase this value to increase the sensitivity of the pan gesture for moving the image

hammer.on('hammer.input', function(e) {
    e.preventDefault();
    if (e.isFirst) {
        initialScale = scale;
        initialPosX = posX;
        initialPosY = posY;
    }
});

hammer.on('transformstart panstart', function(e) {
    // Add the green border
    previewWrapper.classList.add('green-border');
    // Set isMoving to true when the image starts moving
    isMoving = true;
    // Remove the transition duration for the opacity
    frameCanvas.style.transition = 'transform 1s, opacity 0s';
    // Reduce the opacity of the frameCanvas
    frameCanvas.style.opacity = 0.5; // Change this value to adjust the opacity
});

hammer.on('transformend panend', function(e) {
    // Set isMoving back to false when the image stops moving
    isMoving = false;
    // Reset the transition duration for the opacity
    frameCanvas.style.transition = 'transform 1s, opacity 0.5s';
    // Reset the opacity of the frameCanvas
    frameCanvas.style.opacity = 1.0;
    // Remove the green border
    previewWrapper.classList.remove('green-border');
});

function drawFrame() {
    // If the image is moving, reduce the opacity of the frame
    if (isMoving) {
        ctxFrame.globalAlpha = 0.5; // Change this value to adjust the opacity
    } else {
        ctxFrame.globalAlpha = 1.0;
    }

    // Draw the frame
    ctxFrame.drawImage(frameImage, 0, 0, frameCanvas.width, frameCanvas.height);

    // Reset the globalAlpha property
    ctxFrame.globalAlpha = 1.0;
}

hammer.on('transform', function(e) {
    // Scale the image based on the pinch gesture
    if (e.pointers.length > 1) {
        scale = initialScale * e.scale;
    }

    // Move the image based on the pinch or pan gesture
    posX = initialPosX + (e.deltaX * ((e.pointers.length > 1) ? scale * moveFactor : panMoveFactor));
    posY = initialPosY + (e.deltaY * ((e.pointers.length > 1) ? scale * moveFactor : panMoveFactor));

    // Clear the canvas
    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    // Reduce the opacity of the frameCanvas
    frameCanvas.style.opacity = 0.5; // Change this value to adjust the opacity
    // Draw the frame with the current opacity
    drawFrame();
    // Draw the image
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
});

hammer.on('panmove pinchmove', function(e) {
    // Add the green border
    previewWrapper.classList.add('green-border');

    // Scale the image based on the pinch gesture
    if (e.type === 'pinchmove') {
        scale = initialScale * e.scale;
    }

    // Move the image based on the pinch or pan gesture
    posX = initialPosX + (e.deltaX * ((e.type === 'pinchmove') ? scale * moveFactor : panMoveFactor));
    posY = initialPosY + (e.deltaY * ((e.type === 'pinchmove') ? scale * moveFactor : panMoveFactor));

    // Clear the canvas
    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    // Reduce the opacity of the frameCanvas
    frameCanvas.style.opacity = 0.5; // Change this value to adjust the opacity
    // Draw the frame with the current opacity
    drawFrame();
    // Draw the image
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
});

// Define a variable to hold the timeout
let timeout;
// Define a flag to check if the green border is already present
let isGreenBorderPresent = false;

// Listen for the wheel event on the user's canvas
userCanvas.addEventListener('wheel', function(e) {
    // Prevent the default behavior of the wheel event
    e.preventDefault();

    // Add the green border if it's not already present
    if (!isGreenBorderPresent) {
        previewWrapper.classList.add('green-border');
        isGreenBorderPresent = true;
    }

    // Clear the previous timeout if it exists
    if (timeout) {
        clearTimeout(timeout);
    }

    // Determine the direction of the wheel rotation
    let direction = e.deltaY < 0 ? 1 : -1;

    // Calculate the new scale
    let newScale = scale + direction * 0.1;

    // Ensure that the scale is within a certain range
    if (newScale < 0.1) {
        newScale = 0.1;
    } else if (newScale > 3.0) {
        newScale = 3.0;
    }

    // Update the scale
    scale = newScale;

    // Set isMoving to true when the image starts moving
    isMoving = true;
    // Reduce the opacity of the frameCanvas
    frameCanvas.style.opacity = 0.5; // Change this value to adjust the opacity

    // Clear the canvas
    ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
    // Draw the image with the new scale
    ctxUser.drawImage(userImage, posX, posY, userImage.width * scale, userImage.height * scale);
    // Draw the frame with the current opacity
    drawFrame();

    // Set isMoving back to false when the image stops moving
    isMoving = false;
    // Reset the opacity of the frameCanvas
    frameCanvas.style.opacity = 1.0;

    // Set a timeout to change the border to transparent after a delay
    timeout = setTimeout(function() {
        previewWrapper.style.border = '5px dashed transparent';

        // Set another timeout to remove the green border after the transition has completed
        setTimeout(function() {
            previewWrapper.classList.remove('green-border');
            previewWrapper.style.border = ''; // Reset the border style
            isGreenBorderPresent = false;
        }); 
    }, 500); // Change this value to adjust the delay
}, false);



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
    // Create a new canvas to combine the user image, the frame, and the blurred background
    let combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = userCanvas.width;
    combinedCanvas.height = userCanvas.height;
    let ctxCombined = combinedCanvas.getContext('2d');

    // Draw the blurred background image on the new canvas
    ctxCombined.drawImage(backgroundCanvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

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