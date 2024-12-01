import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In a real application, you would fetch this data from your database
  // This is just a simulation
  const commit = {
    id: parseInt(params.id),
    message: `Commit ${params.id} message`,
    timestamp: new Date().toISOString(),
    image: `/placeholder.svg?height=300&width=300&text=Commit+${params.id}+Image`,
    branch: 'main',
    parentId: parseInt(params.id) - 1
  }

  return NextResponse.json(commit)
}
