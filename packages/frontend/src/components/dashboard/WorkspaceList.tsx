import { Button } from '@/components/ui/button'

interface WorkspaceData {
  id: string
  name: string
  image: string | null
}

interface WorkspaceListProps {
  workspaces: WorkspaceData[]
  onSelectWorkspace: (workspace: WorkspaceData) => void
}

export function WorkspaceList({ workspaces, onSelectWorkspace }: WorkspaceListProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Workspaces</h1>
      {workspaces.length === 0 ? (
        <p>You don't have any workspaces yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <div key={workspace.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{workspace.name}</h2>
              {workspace.image && (
                <img src={workspace.image} alt={workspace.name} className="mb-2 w-full h-32 object-cover" />
              )}
              <Button onClick={() => onSelectWorkspace(workspace)}>
                Open Workspace
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
