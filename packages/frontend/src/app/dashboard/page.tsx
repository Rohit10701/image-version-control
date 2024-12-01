'use client'

import { useState } from 'react'
import { Sidebar } from '../../components/dashboard/Sidebar'
import { WorkspaceList } from '../../components/dashboard/WorkspaceList'
import Workspace from '../../components/Workspace'

interface WorkspaceData {
  id: string
  name: string
  image: string | null
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceData | null>(null)

  const handleCreateWorkspace = () => {
    const newWorkspace: WorkspaceData = {
      id: `workspace-${Date.now()}`,
      name: `New Workspace ${workspaces.length + 1}`,
      image: null
    }
    setWorkspaces([...workspaces, newWorkspace])
    setSelectedWorkspace(newWorkspace)
  }

  const handleSelectWorkspace = (workspace: WorkspaceData) => {
    setSelectedWorkspace(workspace)
  }

  const handleImageUpload = (image: string) => {
    if (selectedWorkspace) {
      const updatedWorkspace = { ...selectedWorkspace, image }
      setSelectedWorkspace(updatedWorkspace)
      setWorkspaces(workspaces.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w))
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        workspaces={workspaces}
        onCreateWorkspace={handleCreateWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
      />
      <main className="flex-1 p-6">
        {selectedWorkspace ? (
          <Workspace
            workspace={selectedWorkspace}
            onImageUpload={handleImageUpload}
          />
        ) : (
          <WorkspaceList
            workspaces={workspaces}
            onSelectWorkspace={handleSelectWorkspace}
          />
        )}
      </main>
    </div>
  )
}
