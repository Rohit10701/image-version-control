import fs from 'fs'
import path from 'path'
import { simpleGit, type CommitResult, type SimpleGit } from 'simple-git'

const BASE_FOLDER = 'repo-uploads'
const BASE_DIR = path.join(process.cwd(), BASE_FOLDER)

export async function saveToGitRepo(
  workspaceName: string,
  content: string
): Promise<{ s3RepoPath: string; commitHash: string }> {
  // Ensure base directory exists
  fs.mkdirSync(BASE_DIR, { recursive: true })

  // Define repo path
  const repoPath = path.join(BASE_DIR, workspaceName)
  const s3RepoPath = path.join(BASE_FOLDER, workspaceName)
  // Remove existing repo if it exists
  try {
    fs.rmSync(repoPath, { recursive: true, force: true })
  } catch {}

  // Create new repo directory
  fs.mkdirSync(repoPath, { recursive: true })

  // Define file path
  const filePath = path.join(repoPath, `${workspaceName}.txt`)

  // Write content to file
  fs.writeFileSync(filePath, content)

  // Initialize git repository
  const git: SimpleGit = simpleGit(repoPath)

  // Initialize repo and commit
  await git.init()
  await git.add(filePath)
  const result = await git.commit(`Initial commit: Added ${workspaceName}`)

  return { s3RepoPath, commitHash: result.commit }
}
