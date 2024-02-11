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

// Get the frame select element
var frameSelect = document.getElementById('frame');

// Add an event listener to the frame select element
frameSelect.addEventListener('change', function() {
    // Get the user's image
    var userImage = document.getElementById('user_image_preview').src;

    // Load the user's image and the new frame on the canvas
    loadImage(userImage);
});

document.getElementById('canvasId').style.cursor = 'move';

// Function to set initial frame
function setInitialFrame() {
    var frameSelect = document.getElementById('frame');
    if (frameSelect.options.length > 0) {
        frameSelect.selectedIndex = 0; // Select the first option
        frameSelect.dispatchEvent(new Event('change')); // Trigger the change event
    }
}

// Call the function when the page loads
window.onload = setInitialFrame;

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

            setInitialFrame();
            replaceButtons();

            // Show the canvas and hide the user's image in the preview div
            document.getElementById('canvasId').style.visibility = 'visible';
            document.getElementById('user_image_preview').style.display = 'none';
        };
        reader.readAsDataURL(userFile);
    } else {
        alert('Please select a file before generating.');
    }
}

// Function to handle reset button click
function handleResetButtonClick() {
    // Reset the scale factor
    scaleFactor = 1;

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

            drawImageAndFrame(userImageSrc); // Call drawImageAndFrame instead of loadImage
        };
        image.src = userImageSrc;
    }

    // Reset the form
    document.getElementById('frameForm').reset();

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

// Function to display user's image
function displayUserImage(imageSrc) {
    document.getElementById('user_image_preview').src = imageSrc;
}

var scaleFactor = 1; // Initialize the scale factor

// Modify this function
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
        imageX = centerX - imageWidth / 2;
        imageY = centerY - imageHeight / 2;

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight);

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.drawImage(tempCanvas, imageX, imageY, imageWidth, imageHeight); // Draw the image at the new position
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    };
    image.src = imageSrc; // Set the src after defining the onload function
}

function drawImageAndFrame(imageSrc) {
    var canvas = document.getElementById('canvasId');
    var ctx = canvas.getContext('2d');
    var frameImage = document.getElementById('frame_preview');

    var image = new Image();
    image.onload = function() {
        var scaleX = 1080 / image.width * scaleFactor;
        var scaleY = 1080 / image.height * scaleFactor;
        var scale = Math.max(scaleX, scaleY);

        imageWidth = image.width * scale;
        imageHeight = image.height * scale;

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, imageX, imageY, imageWidth, imageHeight);
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    };
    image.src = imageSrc;
}

document.getElementById('canvasId').addEventListener('mousemove', function(e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    if (isDragging) {
        imageX = x - dragStartX;
        imageY = y - dragStartY;

        // Use requestAnimationFrame to make the movement smoother
        requestAnimationFrame(function() {
            var canvas = document.getElementById('canvasId');
            var ctx = canvas.getContext('2d');
            var frameImage = document.getElementById('frame_preview');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight); // Draw the image at the new position
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        });
    }
});

document.getElementById('canvasId').addEventListener('mousedown', function(e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    isDragging = true;
    dragStartX = x - imageX;
    dragStartY = y - imageY;
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
    var newScaleFactor = scaleFactor * Math.exp(e.deltaY / -500);

    // Calculate the new image position
    var newX = x - (x - imageX) * (newScaleFactor / scaleFactor);
    var newY = y - (y - imageY) * (newScaleFactor / scaleFactor);

    // Update the scale factor and image position
    scaleFactor = newScaleFactor;
    imageX = newX;
    imageY = newY;

    // Redraw the image with the new scale factor and position
    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        drawImageAndFrame(userImageSrc);
    }
});




// Function to set initial frame
function setInitialFrame() {
    var frameSelect = document.getElementById('frame');
    frameSelect.dispatchEvent(new Event('change'));
}

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
    buttonDiv.style.position = 'absolute';
    buttonDiv.style.bottom = '10px';

    buttonDiv.appendChild(createDownloadButton());
    buttonDiv.appendChild(createResetButton());

    return buttonDiv;
}

// Function to create download button
function createDownloadButton() {
    var downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.type = 'button';
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
    resetButton.textContent = 'Reset';
    resetButton.type = 'button';
    resetButton.id = 'resetButtonId'; // Add this line to set the ID of the reset button
    resetButton.onclick = handleResetButtonClick; // Add the event listener here
    return resetButton;
}

// Function to handle frame change
function handleFrameChange() {
    var frame = 'img/' + this.value;
    document.getElementById('frame_preview').src = frame;

    var frameImage = new Image();
    frameImage.onload = function() {
        var userImageSrc = document.getElementById('user_image_preview').src;
        if (!userImageSrc) {
            return; // Return if the user image is not loaded
        }

        // Draw the user's image and the new frame on the canvas
        drawImageAndFrame(userImageSrc);
    };
    frameImage.src = frame;
}

// Add event listeners
document.getElementById('user_image').addEventListener('change', handleUserImageChange);
document.getElementById('frame').addEventListener('change', handleFrameChange);
