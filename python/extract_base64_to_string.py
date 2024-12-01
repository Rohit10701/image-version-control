import os
import cv2
import numpy as np
import base64
import boto3
from git import Repo
from botocore.exceptions import ClientError

# Configuration
BASE_DIR = os.path.join(os.getcwd(), "repo-uploads")
S3_BUCKET_NAME= "localstackkestra"
S3_REGION="ap-south-1"
AWS_ACCESS_KEY_ID= "test"
AWS_SECRET_ACCESS_KEY= "test"
LOCALSTACK_S3_URL= "http://localhost:4566"

def process_base64_image(base64_string):
    """Decode a Base64 image, extract metadata, and generate pixel string."""
    base64_string = base64_string.split(",")[1] if "," in base64_string else base64_string
    image_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image from Base64 string.")
    height, width, channels = image.shape
    metadata = f"{height},{width},{channels}"
    pixel_string = ''.join([f'{pixel:03}' for pixel in image.flatten()])
    return metadata + "|" + pixel_string, image

def save_to_git_repo(workspace_name, content):
    """Save the processed data to a Git repository."""
    os.makedirs(BASE_DIR, exist_ok=True)
    repo_path = os.path.join(BASE_DIR, workspace_name)
    if os.path.exists(repo_path):
        for root, dirs, files in os.walk(repo_path, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            for dir in dirs:
                os.rmdir(os.path.join(root, dir))
        os.rmdir(repo_path)
    os.makedirs(repo_path, exist_ok=True)
    file_path = os.path.join(repo_path, f"{workspace_name}.txt")
    with open(file_path, 'w') as f:
        f.write(content)
    repo = Repo.init(repo_path)
    repo.index.add([file_path])
    repo.index.commit(f"Initial commit: Added {workspace_name}")
    return repo_path

def upload_repo_to_s3(repo_path, s3_client, bucket_name, prefix=""):
    """
    Upload all files in a repository to S3 recursively.

    Args:
        repo_path (str): Local path to the repository.
        s3_client (boto3.client): Boto3 S3 client instance.
        bucket_name (str): Name of the S3 bucket.
        prefix (str): Optional prefix for S3 keys.
    """
    
    if not os.path.isdir(repo_path):
        raise ValueError(f"The provided path '{repo_path}' is not a directory.")
    
    # Check if the bucket exists, and create it if it does not
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"Bucket '{bucket_name}' already exists.")
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            print(f"Bucket '{bucket_name}' does not exist. Creating it now.")
            create_s3_bucket(s3_client, bucket_name)
        else:
            print(f"Error checking bucket '{bucket_name}': {e}")
            raise

    # Upload files to the bucket
    for root, _, files in os.walk(repo_path):
        for file in files:
            local_path = os.path.join(root, file)
            s3_key = os.path.relpath(local_path, repo_path).replace(os.sep, '/')
            if prefix:
                s3_key = f"{prefix.rstrip('/')}/{s3_key}"
            try:
                with open(local_path, 'rb') as f:
                    s3_client.put_object(Bucket=bucket_name, Key=s3_key, Body=f)
                    print(f"Uploaded {s3_key} to S3.")
            except Exception as e:
                print(f"Failed to upload {local_path} to S3. Error: {e}")

def create_s3_bucket(s3_client, bucket_name):
    """
    Create an S3 bucket in the specified region.
    
    Args:
        s3_client (boto3.client): Boto3 S3 client instance.
        bucket_name (str): Name of the S3 bucket to be created.
    """
    try:
        region = S3_REGION  # Specify the desired region (change as needed)
        s3_client.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={
                'LocationConstraint': region
            }
        )
        print(f"Bucket '{bucket_name}' created successfully in region '{region}'.")
    except ClientError as e:
        print(f"Failed to create bucket '{bucket_name}': {e}")
        raise

def main():
    input_base64_string=''

    if not input_base64_string:
        raise ValueError("Base64 input string not found in environment variable.")
    image_string, _ = process_base64_image(input_base64_string)
    workspace_name = "image_processing_workspace"
    repo_path = save_to_git_repo(workspace_name, image_string)
    
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        endpoint_url=LOCALSTACK_S3_URL,
        region_name="ap-south-1"               # Match your LocalStack configuration
    )
    print(s3_client)
    upload_repo_to_s3(repo_path, s3_client, S3_BUCKET_NAME, prefix=workspace_name)
    print("Processing and upload completed.")
    print(f"Git repository path: {repo_path}")

if __name__ == "__main__":
    main()

