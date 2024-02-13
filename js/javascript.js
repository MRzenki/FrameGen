// Variables to store the drag state and position
var isDragging = false;
var dragStartX = 0;
var dragStartY = 0;
var imageX = 0;
var imageY = 0;
var imageWidth = 0;
var imageHeight = 0;
var canvas = document.getElementById('canvasId');
var image = new Image(); // Move the image object to the global scope
var frameSelect = document.getElementById('frame');

document.getElementById('canvasId').style.cursor = 'move';

// Call the function when the page loads
window.onload = function() {
    preloadFrameImages();
    setInitialFrame();
};

function drawImageAndFrame(newX, newY) {
    var canvas = document.getElementById('canvasId');
    var ctx = canvas.getContext('2d');
    var frameImage = document.getElementById('frame_preview');

    // Update the image position
    translate.x = newX || translate.x;
    translate.y = newY || translate.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(translate.x + imageWidth / 2, translate.y + imageHeight / 2); // Translate to the center of the image
    ctx.rotate(rotation); // Apply the rotation
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(offscreenCanvas, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight); // Draw the image at the center
    ctx.restore();
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Add event listeners
document.getElementById('user_image').addEventListener('change', handleUserImageChange);
document.getElementById('frame').addEventListener('change', handleFrameChange);

// Add an event listener to the frame select element
frameSelect.addEventListener('change', function() {
    // Get the user's image
    var userImage = document.getElementById('user_image_preview').src;
    // Load the user's image and the new frame on the canvas
    loadImage(userImage);
});

// Function to set initial frame
function setInitialFrame() {
    if (frameSelect.options.length > 0) {
        frameSelect.selectedIndex = 0; // Select the first option
        frameSelect.dispatchEvent(new Event('change')); // Trigger the change event
    }
}

// Function to handle user image selection
function handleUserImageChange() {
    var userFile = this.files[0];

    if (userFile) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Display the user's image in the preview div
            displayUserImage(e.target.result);

            // Load the user's image and the frame on the canvas
            loadImage(e.target.result);

            // Comment out the line below to prevent the frame from being reset
            // setInitialFrame();
            replaceButtons();

            // Show the canvas and hide the user's image in the preview div
            document.getElementById('canvasId').style.visibility = 'visible';
            document.getElementById('user_image_preview').style.display = 'none';
        };
        reader.readAsDataURL(userFile);
    } else {
        alert('Please select a file before downloading.');
    }
}

// Map to store the preloaded frame images
var frameImages = new Map();

// Function to preload frame images
function preloadFrameImages() {
    for (var i = 0; i < frameSelect.options.length; i++) {
        var frameImage = new Image();
        frameImage.src = 'img/' + frameSelect.options[i].value;
        frameImages.set(frameSelect.options[i].value, frameImage);
    }
}

// Function to handle frame change
function handleFrameChange() {
    var frame = this.value;

    // Get the preloaded frame image
    var frameImage = frameImages.get(frame);
    document.getElementById('frame_preview').src = frameImage.src;

    var userImageSrc = document.getElementById('user_image_preview').src;
    if (!userImageSrc) {
        return; // Return if the user image is not loaded
    }

    // Draw the user's image and the new frame on the canvas
    loadImage(userImageSrc);
}

// Function to display user's image
function displayUserImage(imageSrc) {
    document.getElementById('user_image_preview').src = imageSrc;
}

var scaleFactor = 1; // Initialize the scale factor
var offscreenCanvas = document.createElement('canvas');
var offscreenCtx = offscreenCanvas.getContext('2d');

function loadImage(imageSrc) {
    var canvas = document.getElementById('canvasId');
    var ctx = canvas.getContext('2d');
    var frameImage = document.getElementById('frame_preview');

    // Set the canvas dimensions before loading the image
    canvas.width = 1080;
    canvas.height = 1080;

    image.onload = function() {
        var scaleX = 1080 / image.width * scaleFactor; // Use the scaleFactor variable
        var scaleY = 1080 / image.height * scaleFactor; // Use the scaleFactor variable
        var scale = Math.max(scaleX, scaleY);

        imageWidth = image.width * scale; // Update the global variable
        imageHeight = image.height * scale; // Update the global variable

        // Calculate the center of the canvas
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;

        // Adjust the position of the image so it's centered
        imageX = translate.x || centerX - imageWidth / 2;
        imageY = translate.y || centerY - imageHeight / 2;

        // Draw the image onto the offscreen canvas
        offscreenCanvas.width = imageWidth;
        offscreenCanvas.height = imageHeight;
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCtx.drawImage(image, 0, 0, imageWidth, imageHeight);

        // Draw the offscreen canvas onto the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, imageX, imageY, imageWidth, imageHeight);
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    };
    image.src = imageSrc; // Set the src after defining the onload function
}


document.getElementById('canvasId').addEventListener('mousemove', function(e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    if (isDragging) {
        var dx = (x - dragStartX) / scaleFactor;
        var dy = (y - dragStartY) / scaleFactor;
        var newX = imageX + dx;
        var newY = imageY + dy;
        dragStartX = x;
        dragStartY = y;

        // Use requestAnimationFrame to make the movement smoother
        requestAnimationFrame(function() {
            var userImageSrc = document.getElementById('user_image_preview').src;
            if (userImageSrc) {
                drawImageAndFrame(userImageSrc, newX, newY);
            }
        });
    }
});

document.getElementById('canvasId').addEventListener('mousedown', function(e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    isDragging = true;
    dragStartX = x;
    dragStartY = y;
});


document.getElementById('canvasId').addEventListener('mouseup', function(e) {
    isDragging = false;

    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        drawImageAndFrame(userImageSrc);
    }
});

// Add a 'wheel' event listener to handle zooming
document.getElementById('canvasId').addEventListener('wheel', function(e) {
    e.preventDefault();

    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // Calculate the new scale factor
    var newScaleFactor = scaleFactor * Math.exp(e.deltaY / -400);

    // Calculate the new image position
    var newX = imageX - (x - imageX) * (newScaleFactor / scaleFactor);
    var newY = imageY - (y - imageY) * (newScaleFactor / scaleFactor);

    // Update the scale factor and image position
    scaleFactor = newScaleFactor;
    imageX = newX;
    imageY = newY;

    // Redraw the image with the new scale factor and position
    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        drawImageAndFrame(userImageSrc, newX, newY);
    }
});



// ------------------ -------------------- this is the border --------------- -------------------


// Function to replace buttons
function replaceButtons() {
    var form = document.getElementById('frameForm');
    var buttonDiv = createButtonDiv();

    var existingButtonDiv = document.getElementById('buttonDiv');
    if (existingButtonDiv) {
        form.removeChild(existingButtonDiv);
    }

    form.appendChild(buttonDiv);
}

// Function to create button div
function createButtonDiv() {
    var buttonDiv = document.createElement('div');
    buttonDiv.id = 'buttonDiv';
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifyContent = 'center';
    buttonDiv.style.width = '100%';
    buttonDiv.style.gap = '2rem';
    buttonDiv.style.position = 'relative';
    buttonDiv.style.marginTop = '20px'; // Add a margin to the top of the buttonDiv

    buttonDiv.appendChild(createDownloadButton());
    buttonDiv.appendChild(createResetButton());

    return buttonDiv;
}

// Function to create download button
function createDownloadButton() {
    var downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.style.fontSize = '10px'; // Adjust the font size of the button text
    downloadButton.style.display = 'flex'; // Make the button a flex container
    downloadButton.style.flexDirection = 'column'; // Stack the icon and text vertically
    downloadButton.style.width = '60px'; // Set the width of the button
    downloadButton.style.height = '60px'; // Set the height of the button
    downloadButton.style.alignItems = 'center'; // Center the contents of the button
    downloadButton.style.justifyContent = 'center'; // Center the contents of the button

    var downloadImage = document.createElement('img');
    downloadImage.src = 'img/download.png'; // Set the image URL
    downloadImage.style.width = '30px'; // Adjust the width of the image
    downloadImage.style.height = '30px'; // Adjust the height of the image

    downloadButton.appendChild(downloadImage);
    downloadButton.appendChild(document.createTextNode('Download')); // Use createTextNode to add text

    downloadButton.onclick = function() {
        var userImageSrc = document.getElementById('user_image_preview').src;
        if (userImageSrc) {
            drawImageAndFrame(userImageSrc);
        }

        var link = document.createElement('a');
        var canvas = document.getElementById('canvasId');
        link.href = canvas.toDataURL('image/png');
        link.download = 'download.png';
        link.click();
    };

    return downloadButton;
}

// Function to create reset button
function createResetButton() {
    var resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.style.fontSize = '10px'; // Adjust the font size of the button text
    resetButton.id = 'resetButtonId'; // Set the ID of the reset button
    resetButton.style.width = '60px'; // Set the width of the button
    resetButton.style.height = '60px'; // Set the height of the button
    resetButton.style.display = 'flex'; // Make the button a flex container
    resetButton.style.flexDirection = 'column'; // Stack the icon and text vertically
    resetButton.style.alignItems = 'center'; // Center the contents of the button
    resetButton.style.justifyContent = 'center'; // Center the contents of the button

    var resetImage = document.createElement('img');
    resetImage.src = 'img/reset.png'; // Set the image URL
    resetImage.style.width = '30px'; // Adjust the width of the image
    resetImage.style.height = '30px'; // Adjust the height of the image

    resetButton.appendChild(resetImage);
    resetButton.appendChild(document.createTextNode('Recenter')); // Use createTextNode to add text

    resetButton.onclick = handleResetButtonClick; // Add the event listener here

    return resetButton;
}

// Function to handle reset button click
function handleResetButtonClick() {
    // Reset the scale factor and translation
    scaleFactor = 1;
    translate = { x: 0, y: 0 };

    // Redraw the image with the initial scale factor and position
    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        var canvas = document.getElementById('canvasId');
        var image = new Image();
        image.onload = function() {
            var scaleX = 1080 / image.width * scaleFactor;
            var scaleY = 1080 / image.height * scaleFactor;
            var scale = Math.max(scaleX, scaleY);

            imageWidth = image.width * scale;
            imageHeight = image.height * scale;

            // Calculate the center of the canvas
            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;

            // Adjust the position of the image so it's centered
            imageX = centerX - imageWidth / 2;
            imageY = centerY - imageHeight / 2;

            // Update the translate object with the new position
            translate = { x: imageX, y: imageY };

            drawImageAndFrame(translate.x, translate.y); // Call drawImageAndFrame instead of loadImage
        };
        image.src = userImageSrc;
    }

    // Reset the form
    // document.getElementById('frameForm').reset();

    // Display the user's image in the preview div
    displayUserImage(userImageSrc);
}

document.addEventListener('DOMContentLoaded', function() {
    // Add an event listener to the reset button
    var resetButton = document.getElementById('resetButtonId');
    if (resetButton) {
        resetButton.addEventListener('click', handleResetButtonClick);
    } else {
        console.error('Reset button not found');
    }
});