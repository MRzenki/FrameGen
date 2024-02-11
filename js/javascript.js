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
    var frameSelect = document.getElementById('frame');
    var userFile = this.files[0];

    if (userFile) {
        var reader = new FileReader();
        reader.onload = function(e) {
            displayUserImage(e.target.result);
            drawImageAndFrame(e.target.result);
            setInitialFrame();
            replaceButtons();
        };
        reader.readAsDataURL(userFile);
    } else {
        alert('Please select a file before generating.');
    }
}

// Function to display user's image
function displayUserImage(imageSrc) {
    document.getElementById('user_image_preview').src = imageSrc;
}

// Function to draw user's image and frame onto canvas
function drawImageAndFrame(imageSrc) {
    var image = new Image();
    image.onload = function() {
        var canvas = document.getElementById('canvasId');
        var ctx = canvas.getContext('2d');
        var frameImage = document.getElementById('frame_preview');

        var scaleX = 1080 / image.width;
        var scaleY = 1080 / image.height;
        var scale = Math.max(scaleX, scaleY);

        var newWidth = image.width * scale;
        var newHeight = image.height * scale;

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0, newWidth, newHeight);

        canvas.width = 1080;
        canvas.height = 1080;
        ctx.drawImage(tempCanvas, (canvas.width - newWidth) / 2, (canvas.height - newHeight) / 2, newWidth, newHeight);
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    };
    image.src = imageSrc;
}

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
    resetButton.onclick = function() {
        var form = document.getElementById('frameForm');
        var buttonDiv = document.getElementById('buttonDiv');
        form.removeChild(buttonDiv);

        var uploadButton = document.getElementById('upload_button');
        uploadButton.style.display = 'flex';
        uploadButton.style.justifyContent = 'center';
        uploadButton.style.alignItems = 'center';
        uploadButton.style.width = '100%';
        uploadButton.style.gap = '10px';

        document.getElementById('user_image').value = '';
        document.getElementById('user_image_preview').src = '';
    };
    return resetButton;
}

// Function to handle frame change
function handleFrameChange() {
    var frame = 'img/' + this.value;
    document.getElementById('frame_preview').src = frame;

    var frameImage = new Image();
    frameImage.onload = function() {
        var userImageSrc = document.getElementById('user_image_preview').src;
        if (userImageSrc) {
            drawImageAndFrame(userImageSrc);
        }
    };
    frameImage.src = frame;
}

// Add event listeners
document.getElementById('user_image').addEventListener('change', handleUserImageChange);
document.getElementById('frame').addEventListener('change', handleFrameChange);
