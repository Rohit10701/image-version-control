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
    input_base64_string = "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"


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