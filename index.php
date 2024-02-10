<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('gd.jpeg_ignore_warning', 1);

function applyFrame($imagePath, $framePath) {
    // Check if the image file exists
    if (!file_exists($imagePath)) {
        die("File does not exist: $imagePath");
    }

    // Check if PHP has the necessary permissions to read the image file
    if (!is_readable($imagePath)) {
        die("File is not readable: $imagePath");
    }

    // Get the image type
    $imageInfo = getimagesize($imagePath);
    if ($imageInfo === false) {
        die("Not a valid image file: $imagePath");
    }

    // Create an image resource based on the image type
    switch ($imageInfo[2]) {
        case IMAGETYPE_PNG:
            $user_image = @imagecreatefrompng($imagePath);
            break;
        case IMAGETYPE_JPEG:
            $user_image = @imagecreatefromjpeg($imagePath);
            break;
        case IMAGETYPE_GIF:
            $user_image = @imagecreatefromgif($imagePath);
            break;
        default:
            die("Unsupported image type: $imagePath");
    }

    // Check if the frame file exists
    if (!file_exists($framePath)) {
        die("Frame file does not exist: $framePath");
    }

    // Check if PHP has the necessary permissions to read the frame file
    if (!is_readable($framePath)) {
        die("Frame file is not readable: $framePath");
    }

    // Load the frame
    $frame = @imagecreatefrompng($framePath);

    // Get the dimensions of the frame
    $frame_width = imagesx($frame);
    $frame_height = imagesy($frame);

    // Get the dimensions of the user image
    $user_image_width = imagesx($user_image);
    $user_image_height = imagesy($user_image);

    // Calculate the scale factor for the width and height
    $scale_width = $frame_width / $user_image_width;
    $scale_height = $frame_height / $user_image_height;

    // Use the larger scale factor to scale the image
    $scale = max($scale_width, $scale_height);
    $scaled_width = $user_image_width * $scale;
    $scaled_height = $user_image_height * $scale;

    // Create a new true color image
    $scaled_image = imagecreatetruecolor($scaled_width, $scaled_height);

    // Scale the user image
    imagecopyresampled($scaled_image, $user_image, 0, 0, 0, 0, $scaled_width, $scaled_height, $user_image_width, $user_image_height);

    // Calculate the position to center the user image within the frame
    $crop_x = ($scaled_width - $frame_width) / 2;
    $crop_y = ($scaled_height - $frame_height) / 2;

    // Create a new true color image for the cropped image
    $cropped_image = imagecreatetruecolor($frame_width, $frame_height);

    // Crop the scaled image to fit the frame
    imagecopy($cropped_image, $scaled_image, 0, 0, $crop_x, $crop_y, $frame_width, $frame_height);

    // Merge the frame onto the cropped image
    imagecopy($cropped_image, $frame, 0, 0, 0, 0, $frame_width, $frame_height);

    // Save the framed image
    imagepng($cropped_image, 'output/framed_image.png');

    // Free memory
    imagedestroy($user_image);
    imagedestroy($scaled_image);
    imagedestroy($cropped_image);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['user_image']) && $_FILES['user_image']['error'] == UPLOAD_ERR_OK) {
    // Move the uploaded file to the 'img' directory
    move_uploaded_file($_FILES['user_image']['tmp_name'], 'img/user_image.png');

    // Apply the frame to the uploaded image
    applyFrame('img/user_image.png', 'img/' . $_POST['frame']);

    // Set a flag to indicate that the image has been processed
    $imageProcessed = true;
}
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>
    <header>
        <h1>
            <span class="red">Frame</span><span class="green">Gen</span> by microdrgz
        </h1>
    </header>

    <div class="container">
        <div class="form-container">
            <form action="index.php" method="post" enctype="multipart/form-data" id="upload-form">
                Select frame:
                <select name="frame">
                    <option value="frame1.png">Single & Blessed</option>
                    <option value="frame2.png">Waiting for God's Will</option>
                    <option value="frame3.png">Faithfully Committed</option>
                    <option value="frame4.png">Moving Forward</option>
                </select>
                <br>
                Select image to upload:
                <input type="file" name="user_image" id="user_image" style="display: none;">
                <label for="user_image" class="button">Upload Image</label>
                <input type="hidden" name="x" id="x">
                <input type="hidden" name="y" id="y">
                <input type="submit" value="Generate" name="submit" class="generate-button">
            </form>


            <?php if (isset($imageProcessed) && $imageProcessed): ?>
                <script>
                    document.getElementById('upload-form').style.display = 'none';
                </script>
                <div class="image-preview">
                    <img src="output/framed_image.png">
                    <a href="download.php" class="button">Download</a>
                    <a href="index.php" class="button">Back</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>


<script>
// When the user selects an image, display a preview and make it draggable and resizable


document.getElementById('user_image').onchange = function() {
    // Display the name of the selected file
    document.querySelector('label[for="user_image"]').textContent = this.files[0].name;

    // Create a FileReader to read the selected file
    var reader = new FileReader();

    // When the file has been read, display a preview
    reader.onload = function(e) {
        // Create a new Image object
        var img = new Image();

        // When the image has loaded, replace the preview image with it
        img.onload = function() {
            // Replace the preview image
            $('#preview').replaceWith(this);

            // Give the new image the id 'preview'
            this.id = 'preview';

            // Make the new image draggable and resizable
            $('#preview').draggable({
                containment: '#preview-container',
                stop: function(event, ui) {
                    // Update the hidden input fields with the new position
                    $('#x').val(ui.position.left);
                    $('#y').val(ui.position.top);
                }
            }).resizable({
                aspectRatio: true,
                containment: '#preview-container'
            });
        };

        // Set the source of the new image to the data URL of the file
        img.src = e.target.result;
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(this.files[0]);
};

// Make the frame non-draggable
$('#frame').draggable({ disabled: true });
</script>

</html>

