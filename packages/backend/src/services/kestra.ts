import * as fs from 'fs';
import * as path from 'path';
import * as base64 from 'base64-js';
import * as AWS from 'aws-sdk';
import * as simpleGit from 'simple-git';
import { promisify } from 'util';
import { S3_REGION } from '../utils/costants.js';

// Configuration
const BASE_DIR = path.join(process.cwd(), "repo-uploads");


async function saveToGitRepo(workspaceName: string, content: string): Promise<string> {
  /**
   * Save the processed data to a Git repository.
   */
  const repoPath = path.join(BASE_DIR, workspaceName);

  // Clear existing repo if it exists
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  // Create new repo directory
  fs.mkdirSync(repoPath, { recursive: true });

  const filePath = path.join(repoPath, `${workspaceName}.txt`);
  fs.writeFileSync(filePath, content);

  // Initialize git repo and commit
  const git = simpleGit(repoPath);
  await git.init();
  await git.add(filePath);
  await git.commit(`Initial commit: Added ${workspaceName}`);

  return repoPath;
}

async function uploadRepoToS3(
  repoPath: string, 
  s3Client: AWS.S3, 
  bucketName: string, 
  prefix: string = ""
): Promise<void> {
  /**
   * Upload all files in a repository to S3 recursively.
   */
  if (!fs.existsSync(repoPath) || !fs.lstatSync(repoPath).isDirectory()) {
    throw new Error(`The provided path '${repoPath}' is not a directory.`);
  }

  // Check if bucket exists
  try {
    await s3Client.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket '${bucketName}' already exists.`);
  } catch (error) {
    if (error.code === 'NotFound') {
      await createS3Bucket(s3Client, bucketName);
    } else {
      console.error(`Error checking bucket: ${error}`);
      throw error;
    }
  }

  // Recursively upload files
  const uploadFiles = (dirPath: string) => {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const localPath = path.join(dirPath, file);
      const stat = fs.lstatSync(localPath);
      
      if (stat.isDirectory()) {
        uploadFiles(localPath);
      } else {
        const s3Key = path.relative(repoPath, localPath).replace(/\\/g, '/');
        const fullS3Key = prefix ? `${prefix.replace(/\/$/, '')}/${s3Key}` : s3Key;
        
        try {
          const fileContent = fs.readFileSync(localPath);
          s3Client.putObject({
            Bucket: bucketName,
            Key: fullS3Key,
            Body: fileContent
          }).promise();
          
          console.log(`Uploaded ${fullS3Key} to S3.`);
        } catch (error) {
          console.error(`Failed to upload ${localPath} to S3:`, error);
        }
      }
    }
  };

  uploadFiles(repoPath);
}

async function createS3Bucket(s3Client: AWS.S3, bucketName: string): Promise<void> {
  /**
   * Create an S3 bucket in the specified region.
   */
  try {
    await s3Client.createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: S3_REGION
      }
    }).promise();
    console.log(`Bucket '${bucketName}' created successfully in region '${S3_REGION}'.`);
  } catch (error) {
    console.error(`Failed to create bucket '${bucketName}':`, error);
    throw error;
  }
}


// Uncomment to run
// main().catch(console.error);

export { 
  saveToGitRepo, 
  uploadRepoToS3, 
  createS3Bucket 
};