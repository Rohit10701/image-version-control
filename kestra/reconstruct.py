import boto3
import git
import os
import cv2
import numpy as np
import requests
import base64
from kestra import Kestra

# Get inputs from the trigger
os.environ["GIT_PYTHON_REFRESH"] = "quiet"
artifact_url = os.environ["ART_URL"]  # Fixed the comma issue
commit_hash = os.environ["COMMIT_HASH"]  # The commit hash passed from the trigger
workspace_id = os.environ["WORKSPACE_ID"]


def download_s3_folder(bucket_name, s3_folder, local_dir=None):
    """
    Download the contents of a folder directory
    Args:
        bucket_name: the name of the s3 bucket
        s3_folder: the folder path in the s3 bucket
        local_dir: a relative or absolute directory path in the local file system
    """
    print(bucket_name)
    response = s3_client.list_objects(Bucket=bucket_name)
    for obj in response["Contents"]:
        target = (
            obj["Key"]
            if local_dir is None
            else os.path.join(local_dir, os.path.relpath(obj["Key"], s3_folder))
        )
        if not os.path.exists(os.path.dirname(target)):
            os.makedirs(os.path.dirname(target))
        if obj["Key"][-1] == "/":
            continue
        s3_client.download_file(bucket_name, obj["Key"], target)


# Configure S3 client for LocalStack
s3_client = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name="ap-south-1",
)

# Ensure the local folder exists for storing downloaded files
local_folder = "./repo-uploads"
os.makedirs(local_folder, exist_ok=True)

# Download the file from S3
bucket_name = os.environ["S3_BUCKET_NAME"]
print(artifact_url)
# Assuming artifact_url is the file path, use it as the S3 object key
# s3_client.download_file(bucket_name, artifact_url, os.path.join(local_folder, 'artifact.txt'))

download_s3_folder(bucket_name, artifact_url, local_folder)

# Checkout the specific commit hash in the repository
repo = git.Repo(local_folder)
repo.git.checkout(commit_hash)

# Define the path to the local text file
local_filename = os.path.join(local_folder, workspace_id + ".txt")

# Read the pixel data from the S3 file
with open(local_filename, "r") as f:
    full_string = f.read()

# Extract metadata and pixel data
metadata, pixel_string = full_string.split("|")
height, width, channels = map(int, metadata.split(","))

# Reconstruct the image from pixel data
pixels = np.array(
    [int(pixel_string[i : i + 3]) for i in range(0, len(pixel_string), 3)]
)
pixels = pixels.reshape((height, width, channels))
pixels = np.clip(pixels, 0, 255).astype(np.uint8)

# Save the image to a file
cv2.imwrite("reverted_image.jpg", pixels)

# Convert the image to Base64
with open("reverted_image.jpg", "rb") as image_file:
    image_data = image_file.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")

# Send Base64 image data to the backend endpoint
outputs = {"image": base64_image}

print(f"Image upload response: {outputs}")
Kestra.outputs(outputs)
