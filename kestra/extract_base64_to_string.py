import os
import cv2
import numpy as np
import base64
from io import BytesIO
from kestra import Kestra
import requests

BACKEND_ENDPOINT="http://localhost:3010/kestra/image-string"

KESTRA_WORKSPACE_ID = os.environ.get('KESTRA_WORKSPACE_ID')
# Get the base64 string from the environment variable
input_base64_string = os.environ.get('KESTRA_INPUT_FILE_BASE64')

print(KESTRA_WORKSPACE_ID)

# Check if the input base64 string is empty
if not input_base64_string:
    raise ValueError("Base64 input string not found in environment variable.")

# Remove the "data:image/png;base64," part if it's included
base64_string = input_base64_string.split(",")[1] if "," in input_base64_string else input_base64_string

# Add padding to make the Base64 string length a multiple of 4
padding = '=' * (4 - len(base64_string) % 4)
base64_string += padding

# Decode the base64 string to bytes
image_data = base64.b64decode(base64_string)

# Convert bytes to numpy array
nparr = np.frombuffer(image_data, np.uint8)

# Decode the numpy array into an image
image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

if image is None:
    raise ValueError("Failed to decode image from base64 string.")

# Get image dimensions
height, width, channels = image.shape

# Flatten the image and create the pixel string
flattened = image.flatten()
pixel_string = ''.join([f'{pixel:03}' for pixel in flattened])

# Metadata with dimensions
metadata = f"{height},{width},{channels}"

# Combine metadata and pixel string
full_string = metadata + "|" + pixel_string

# Prepare outputs for Kestra
outputs = {
    "image_string": full_string,
    "workspace_id" : KESTRA_WORKSPACE_ID
}

# Print confirmation message
print("Pixel string with metadata generated.")

# response = requests.post("https://9x3m5dzn-3002.inc1.devtunnels.ms/kestra/image-string", json=outputs)
# print(response)




# Send output to Kestra
Kestra.outputs(outputs)
