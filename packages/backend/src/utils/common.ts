import fs from 'fs'
import path from 'path'
import { simpleGit, type SimpleGit } from 'simple-git'

const BASE_DIR = path.join(process.cwd(), 'repo-uploads')

export async function saveToGitRepo(
  workspaceName: string,
  content: string
): Promise<string> {
  // Ensure base directory exists
  fs.mkdirSync(BASE_DIR, { recursive: true })

  // Define repo path
  const repoPath = path.join(BASE_DIR, workspaceName)

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
  await git.commit(`Initial commit: Added ${workspaceName}`)

  return repoPath
}
