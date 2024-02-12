var initialDistance = null;
var initialPosition = { x: 0, y: 0 };
var translate = { x: 0, y: 0 };
var initialAngle = 0;
var scaleFactor = 1;
var rotation = 0;


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
        // initialAngle = getAngleBetweenTouches(e); //TENTATIVE - ROTATE
    }
    if (e.touches.length === 2) {
        initialDistance = getDistanceBetweenTouches(e);
        initialPosition = getMidpointBetweenTouches(e);
        // initialAngle = getAngleBetweenTouches(e); //TENTATIVE - ROTATE
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
        translate.x += 2 * (newPosition.x - initialPosition.x); // Increase the factor to move faster
        translate.y += 2 * (newPosition.y - initialPosition.y); // Increase the factor to move faster
        initialPosition = newPosition;
    } else if (e.touches.length === 2) {
        var newDistance = getDistanceBetweenTouches(e);
        var scaleFactorChange = newDistance / initialDistance;
        initialDistance = newDistance;

        var newPosition = getMidpointBetweenTouches(e);
        translate.x = scaleFactor * (newPosition.x - initialPosition.x + translate.x / scaleFactor);
        translate.y = scaleFactor * (newPosition.y - initialPosition.y + translate.y / scaleFactor);
        scaleFactor *= Math.sqrt(scaleFactorChange); // Apply square root to slow down zooming

        // var newAngle = getAngleBetweenTouches(e); //TENTATIVE - ROTATE
        // rotation += newAngle - initialAngle; //TENTATIVE - ROTATE
        // initialAngle = newAngle; //TENTATIVE - ROTATE

        initialPosition = newPosition;
    }

    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        requestAnimationFrame(function() {
            drawImageAndFrame(userImageSrc);
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

function getAngleBetweenTouches(e) {
    var touch1 = e.touches[0];
    var touch2 = e.touches[1];
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
}

function drawImageAndFrame() {
    var canvas = document.getElementById('canvasId');
    var ctx = canvas.getContext('2d');
    var frameImage = document.getElementById('frame_preview');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(translate.x, translate.y);
    // ctx.rotate(rotation); //TENTATIVE - ROTATE
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(offscreenCanvas, imageX, imageY, imageWidth, imageHeight);
    ctx.restore();
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}


// weeewasdasd