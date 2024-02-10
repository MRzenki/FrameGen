<?php
// Set the headers to force a file download
header('Content-Type: image/png');
header('Content-Disposition: attachment; filename="framed_image.png"');

// Read and output the file
readfile('output/framed_image.png');