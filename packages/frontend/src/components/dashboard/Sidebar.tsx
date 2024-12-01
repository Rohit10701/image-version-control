import { Button } from '@/components/ui/button'

interface WorkspaceData {
  id: string
  name: string
  image: string | null
}

interface SidebarProps {
  workspaces: WorkspaceData[]
  onCreateWorkspace: () => void
  onSelectWorkspace: (workspace: WorkspaceData) => void
}

export function Sidebar({ workspaces, onCreateWorkspace, onSelectWorkspace }: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Workspaces</h2>
        <Button onClick={onCreateWorkspace} className="w-full mb-4">
          Create New Workspace
        </Button>
        <nav>
          <ul>
            {workspaces.map(workspace => (
              <li key={workspace.id} className="mb-2">
                <Button
                  variant="ghost"
                  className="w-full text-left"
                  onClick={() => onSelectWorkspace(workspace)}
                >
                  {workspace.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
