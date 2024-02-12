var initialDistance = null;
var initialPosition = { x: 0, y: 0 };
var translate = { x: 0, y: 0 };

document.getElementById('canvasId').addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        initialPosition = getTouchPosition(e);
    } else if (e.touches.length === 2) {
        initialDistance = getDistanceBetweenTouches(e);
    }
});

document.getElementById('canvasId').addEventListener('touchmove', function(e) {
    if (e.touches.length === 1) {
        var newPosition = getTouchPosition(e);
        translate.x += newPosition.x - initialPosition.x;
        translate.y += newPosition.y - initialPosition.y;
        initialPosition = newPosition;
    } else if (e.touches.length === 2) {
        var newDistance = getDistanceBetweenTouches(e);
        scaleFactor *= newDistance / initialDistance;
        initialDistance = newDistance;
    }

    var userImageSrc = document.getElementById('user_image_preview').src;
    if (userImageSrc) {
        // Use requestAnimationFrame to limit the number of redraws
        requestAnimationFrame(function() {
            drawImageAndFrame(userImageSrc);
        });
    }
});

document.getElementById('canvasId').addEventListener('touchend', function(e) {
    initialDistance = null;
    initialPosition = { x: 0, y: 0 };
});

function getTouchPosition(e) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function getDistanceBetweenTouches(e) {
    var touch1 = e.touches[0];
    var touch2 = e.touches[1];
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
}

// Add this at the end of your file
document.getElementById('canvasId').addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

