# import os
# import cv2
# import numpy as np
# import base64
# from io import BytesIO
# from kestra import Kestra
# import requests

# BACKEND_ENDPOINT=http://localhost:5000/kestra/image_string


# # Get the base64 string from the environment variable
# input_base64_string = os.environ.get('KESTRA_INPUT_FILE_BASE64')

# # Check if the input base64 string is empty
# if not input_base64_string:
#     raise ValueError("Base64 input string not found in environment variable.")

# # Remove the "data:image/png;base64," part if it's included
# base64_string = input_base64_string.split(",")[1] if "," in input_base64_string else input_base64_string

# # Add padding to make the Base64 string length a multiple of 4
# padding = '=' * (4 - len(base64_string) % 4)
# base64_string += padding

# # Decode the base64 string to bytes
# image_data = base64.b64decode(base64_string)

# # Convert bytes to numpy array
# nparr = np.frombuffer(image_data, np.uint8)

# # Decode the numpy array into an image
# image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# if image is None:
#     raise ValueError("Failed to decode image from base64 string.")

# # Get image dimensions
# height, width, channels = image.shape

# # Flatten the image and create the pixel string
# flattened = image.flatten()
# pixel_string = ''.join([f'{pixel:03}' for pixel in flattened])

# # Metadata with dimensions
# metadata = f"{height},{width},{channels}"

# # Combine metadata and pixel string
# full_string = metadata + "|" + pixel_string

# # Prepare outputs for Kestra
# outputs = {
#     'image_string': full_string
# }

# # Print confirmation message
# print("Pixel string with metadata generated.")

# try:
#     response = requests.post(BACKEND_ENDPOINT, json=outputs)
# except:
#     print("Request failed with status code")


# # Send output to Kestra
# Kestra.outputs(outputs)













# import os
# import cv2
# import numpy as np
# import base64
# from io import BytesIO
# from kestra import Kestra
# import requests


# BACKEND_ENDPOINT="http://localhost:3002/kestra/image-string"


# # Get the base64 string from the environment variable
# input_base64_string = os.environ.get('KESTRA_INPUT_FILE_BASE64')

# # Check if the input base64 string is empty
# if not input_base64_string:
#     raise ValueError("Base64 input string not found in environment variable.")

# # Remove the "data:image/png;base64," part if it's included
# base64_string = input_base64_string.split(",")[1] if "," in input_base64_string else input_base64_string

# # Add padding to make the Base64 string length a multiple of 4
# padding = '=' * (4 - len(base64_string) % 4)
# base64_string += padding

# # Decode the base64 string to bytes
# image_data = base64.b64decode(base64_string)

# # Convert bytes to numpy array
# nparr = np.frombuffer(image_data, np.uint8)

# # Decode the numpy array into an image
# image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# if image is None:
#     raise ValueError("Failed to decode image from base64 string.")

# # Get image dimensions
# height, width, channels = image.shape

# # Flatten the image and create the pixel string
# flattened = image.flatten()
# pixel_string = ''.join([f'{pixel:03}' for pixel in flattened])

# # Metadata with dimensions
# metadata = f"{height},{width},{channels}"

# # Combine metadata and pixel string
# full_string = metadata + "|" + pixel_string

# # Prepare outputs for Kestra
# outputs = {
#     'image_string': full_string
# }

# # Print confirmation message
# print("Pixel string with metadata generated.")

# try:
#     response = requests.post(BACKEND_ENDPOINT, json=outputs)
# except:
#     print("Request failed with status code")


# # Send output to Kestra
# Kestra.outputs(outputs)





import os
import cv2
import numpy as np
import base64
import boto3
from io import BytesIO
from git import Repo
import shutil

# Configuration
BACKEND_ENDPOINT = "http://localhost:3002/kestra/image-string"
BASE_DIR = os.path.join(os.getcwd(), "repo-uploads")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
LOCALSTACK_S3_URL = os.getenv("LOCALSTACK_S3_URL")

def process_base64_image(base64_string):
    """Decode a Base64 image, extract metadata, and generate pixel string."""
    # Remove "data:image/png;base64," if present
    base64_string = base64_string.split(",")[1] if "," in base64_string else base64_string

    # Decode Base64 string
    image_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(image_data, np.uint8)

    # Decode numpy array to an image
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image from Base64 string.")

    # Extract metadata
    height, width, channels = image.shape
    metadata = f"{height},{width},{channels}"

    # Flatten image and create pixel string
    pixel_string = ''.join([f'{pixel:03}' for pixel in image.flatten()])
    return metadata + "|" + pixel_string, image

def save_to_git_repo(workspace_name, content):
    """Save the processed data to a Git repository."""
    # Create base directory
    os.makedirs(BASE_DIR, exist_ok=True)

    # Create workspace directory
    repo_path = os.path.join(BASE_DIR, workspace_name)
    if os.path.exists(repo_path):
        shutil.rmtree(repo_path)  # Clear if already exists
    os.makedirs(repo_path, exist_ok=True)

    # Save content to a file
    file_path = os.path.join(repo_path, f"{workspace_name}.txt")
    with open(file_path, 'w') as f:
        f.write(content)

    # Initialize Git repository
    repo = Repo.init(repo_path)
    repo.index.add([file_path])
    repo.index.commit(f"Initial commit: Added {workspace_name}")

    print(file_path, repo_path)
    return file_path, repo_path

def upload_to_s3(file_path, s3_client, bucket_name, object_key):
    """Upload a file to an S3 bucket."""
    with open(file_path, 'rb') as f:
        s3_client.put_object(Bucket=bucket_name, Key=object_key, Body=f)

def main():
    # Read Base64 input
    input_base64_string = os.getenv("KESTRA_INPUT_FILE_BASE64")
    if not input_base64_string:
        raise ValueError("Base64 input string not found in environment variable.")

    # Process Base64 image
    image_string, _ = process_base64_image(input_base64_string)
    print(image_string)

    # Save to Git repository
    workspace_name = "image_processing_workspace"
    file_path, repo_path = save_to_git_repo(workspace_name, image_string)

    # Configure S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        endpoint_url=LOCALSTACK_S3_URL
    )

    # Upload to S3
    upload_to_s3(file_path, s3_client, S3_BUCKET_NAME, f"{workspace_name}.txt")

    print("Processing and upload completed.")
    print(f"Local file path: {file_path}")
    print(f"Git repository path: {repo_path}")

if __name__ == "__main__":
    main()



Repo    
    - workspace1 - folder
        file.txt
        .git
    - workspace2
        file2.txt
