var initialDistance = null;
var initialPosition = { x: 0, y: 0 };
var translate = { x: 0, y: 0 };
var initialAngle = 0;
var scaleFactor = 1;
var rotation = 0;
// Variable to store the current frame
var currentFrame = document.getElementById('frame_preview');


// drawImageAndFrame For Mobile
function drawImageAndFrame(newX, newY) {
    var canvas = document.getElementById('canvasId');
    var ctx = canvas.getContext('2d');
    var frameImage = document.getElementById('frame_preview');
    var userImage = document.getElementById('user_image_preview'); // Assuming this is the image you want to draw

    // Update the image position
    translate.x = newX || translate.x;
    translate.y = newY || translate.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(translate.x, translate.y);
    // ctx.rotate(rotation); //TENTATIVE - ROTATE
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(userImage, 0, 0, userImage.width, userImage.height); // Draw the image at the new position
    ctx.restore();
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}


// Function to handle user image selection
function handleImageUpload(e) {
    var userFile = e.target.files[0];

    if (userFile) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Clear the canvas
            var canvas = document.getElementById('canvasId');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Display the user's image in the preview div
            displayUserImage(e.target.result);

            // Load the user's image and the frame on the canvas
            loadImage(e.target.result);

            replaceButtons();

            // Show the canvas and hide the user's image in the preview div
            document.getElementById('canvasId').style.visibility = 'visible';
            document.getElementById('user_image_preview').style.display = 'none';

            // Redraw the current frame
            ctx.drawImage(currentFrame, 0, 0, canvas.width, canvas.height);
        };
        reader.readAsDataURL(userFile);
    } else {
        alert('Please select a file before downloading.');
    }
}
// Add an event listener to the file input element
document.getElementById('user_image').addEventListener('change', handleImageUpload);


document.getElementById('canvasId').addEventListener('touchstart', function(e) {
    var rect = e.target.getBoundingClientRect();
    var touch = e.touches[0];
    if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) {
        return;
    }

    if (e.touches.length === 1) {
        initialPosition = getTouchPosition(e);
    } else if (e.touches.length === 2) {
        initialDistance = getDistanceBetweenTouches(e);
        initialPosition = getMidpointBetweenTouches(e);
    }
    if (e.touches.length === 2) {
        initialDistance = getDistanceBetweenTouches(e);
        initialPosition = getMidpointBetweenTouches(e);
    }
});
document.getElementById('canvasId').addEventListener('touchmove', function(e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var touch = e.touches[0];
    if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) {
        return;
    }

    if (e.touches.length === 1) {
        var newPosition = getTouchPosition(e);
        var dx = 2 * (newPosition.x - initialPosition.x); // Increase the factor to move faster
        var dy = 2 * (newPosition.y - initialPosition.y); // Increase the factor to move faster
        translate.x += dx;
        translate.y += dy;
        imageX += dx / scaleFactor;
        imageY += dy / scaleFactor;
        initialPosition = newPosition;
    } else if (e.touches.length === 2) {
        var newDistance = getDistanceBetweenTouches(e);
        var scaleFactorChange = newDistance / initialDistance;

        // Add these two lines at the top of your script
        var minScaleFactor = 0.1; // Minimum zoom level
        var maxScaleFactor = 10;  // Maximum zoom level

        // Modify this part of your touchmove event listener
        if (Math.abs(1 - scaleFactorChange) > 0.02) { // Increase the threshold to make pinch-to-zoom less sensitive
            initialDistance = newDistance;
            scaleFactor *= Math.sqrt(scaleFactorChange); // Apply square root to slow down zooming

            // Add these lines to limit the scaleFactor
            if (scaleFactor < minScaleFactor) {
                scaleFactor = minScaleFactor;
            } else if (scaleFactor > maxScaleFactor) {
                scaleFactor = maxScaleFactor;
            }
        }

        var newPosition = getMidpointBetweenTouches(e);
        var dx = newPosition.x - initialPosition.x;
        var dy = newPosition.y - initialPosition.y;
        translate.x += dx;
        translate.y += dy;
        imageX += dx / scaleFactor;
        imageY += dy / scaleFactor;

        initialPosition = newPosition;
    }

    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        requestAnimationFrame(function() {
            drawImageAndFrame(translate.x, translate.y); // Pass the new position of the image
        });
    }
}, { passive: false });

function getDistanceBetweenTouches(e) {
    var touch1 = e.touches[0];
    var touch2 = e.touches[1];
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
}
function getMidpointBetweenTouches(e) {
    var touch1 = e.touches[0];
    var touch2 = e.touches[1];
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}
function getTouchPosition(e) {
    var rect = e.target.getBoundingClientRect();
    var touch = e.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}
