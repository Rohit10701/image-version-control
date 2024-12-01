'use client'

import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import Workspace from '../components/Workspace'
import CommitForm from '../components/CommitForm'
import CommitHistory from '../components/CommitHistory'
import { ICommit, IBranch } from '../types'

export default function ImageVersionControl() {
  const [image, setImage] = useState<string | null>(null)
  const [commits, setCommits] = useState<ICommit[]>([])
  const [branches, setBranches] = useState<IBranch[]>([{ name: 'main'}])
  const [currentBranch, setCurrentBranch] = useState('main')
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  const handleImageUpload = (uploadedImage: string) => {
    setImage(uploadedImage)
    setCurrentImage(uploadedImage)
    const initialCommit: ICommit = {
      id: "1",
      message: 'Initial commit',
      branchId: "1",
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    }
    setCommits([initialCommit])
    setBranches([{ name: 'main' }])
  }

  const handleCommit = (message: string) => {
    const newCommit: ICommit = {
      id: (commits.length + 1).toString(),
      message,
      branchId: currentBranch,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    }
    setCommits([...commits, newCommit])
    setBranches(branches.map(b =>
      b.name === currentBranch ? { ...b, head: newCommit.id } : b
    ))
  }

  const handleImageChange = (editedImage: string) => {
    setCurrentImage(editedImage)
  }

  const handleCommitClick = (commit: Commit) => {
    setCurrentImage(commit.image)
    setCurrentBranch(commit.branch)
  }

  const handleCreateBranch = (name: string, fromCommitId: number) => {
    if (branches.some(b => b.name === name)) {
      alert('Branch name already exists. Please choose a different name.')
      return
    }
    const newBranch: IBranch = { name, id: fromCommitId.toString() }
    setBranches([...branches, newBranch])
    setCurrentBranch(name)
  }

  const handleMergeBranches = (fromBranch: string, toBranch: string) => {
    const fromCommit = commits.find(c => c.id === branches.find(b => b.name === fromBranch)?.head)
    const toCommit = commits.find(c => c.id === branches.find(b => b.name === toBranch)?.head)

    if (fromCommit && toCommit) {
      const mergeCommit: ICommit = {
        id: (commits.length + 1).toString(),
        message: `Merge ${fromBranch} into ${toBranch}`,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        branchId: toCommit.id
      }
      setCommits([...commits, mergeCommit])
      setBranches(branches.map(b =>
        b.name === toBranch ? { ...b, head: mergeCommit.id } : b
      ))
      setCurrentBranch(toBranch)
      setCurrentImage(fromCommit.image)
    }
  }

  const handleBranchChange = (branch: string) => {
    setCurrentBranch(branch)
    const branchHead = branches.find(b => b.name === branch)?.head
    if (branchHead) {
      const headCommit = commits.find(c => c.id === branchHead)
      if (headCommit) {
        setCurrentImage(headCommit.image)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Image Version Control</h1>
      {!image ? (
        <ImageUpload onUpload={handleImageUpload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Workspace image={currentImage!} onChange={handleImageChange} />
            <CommitForm onCommit={handleCommit} />
          </div>
          <CommitHistory
            commits={commits}
            branches={branches}
            currentBranch={currentBranch}
            onCommitClick={handleCommitClick}
            onCreateBranch={handleCreateBranch}
            onMergeBranches={handleMergeBranches}
            onBranchChange={handleBranchChange}
          />
        </div>
      )}
    </div>
  )
}
