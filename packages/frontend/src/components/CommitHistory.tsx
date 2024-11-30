'use client'

import { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Commit, Branch } from '../types'
import Link from 'next/link'

interface CommitHistoryProps {
  commits: Commit[]
  branches: Branch[]
  currentBranch: string
  onCommitClick: (commit: Commit) => void
  onCreateBranch: (name: string, fromCommitId: number) => void
  onMergeBranches: (fromBranch: string, toBranch: string) => void
  onBranchChange: (branch: string) => void
}

interface CommitNodePosition {
  x: number
  y: number
  commit: Commit
}

const COLORS = {
  main: '#8884d8',
  branch: '#82ca9d',
  merge: '#ffc658'
}

export default function CommitHistory({
  commits,
  branches,
  currentBranch,
  onCommitClick,
  onCreateBranch,
  onMergeBranches,
  onBranchChange
}: CommitHistoryProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [newBranchName, setNewBranchName] = useState('')
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [mergeFrom, setMergeFrom] = useState('')
  const [mergeTo, setMergeTo] = useState('')
  const [nodePositions, setNodePositions] = useState<CommitNodePosition[]>([])

  useEffect(() => {
    const initialPositions = calculateInitialPositions()
    setNodePositions(initialPositions)
  }, [commits])

  const calculateInitialPositions = (): CommitNodePosition[] => {
    const positions: CommitNodePosition[] = []
    const branchLanes: { [key: string]: number } = {}
    let maxLane = 0

    commits.forEach((commit, index) => {
      if (!branchLanes[commit.branch]) {
        branchLanes[commit.branch] = maxLane
        maxLane += 1
      }

      positions.push({
        x: 100 + branchLanes[commit.branch] * 150,
        y: 80 + index * 100,
        commit
      })
    })

    return positions
  }

  const BOX_WIDTH = 120
  const BOX_HEIGHT = 60

  const handleCreateBranch = () => {
    if (selectedCommit && newBranchName) {
      onCreateBranch(newBranchName, selectedCommit.id)
      setNewBranchName('')
      setSelectedCommit(null)
    }
  }

  const handleMergeBranches = () => {
    if (mergeFrom && mergeTo) {
      onMergeBranches(mergeFrom, mergeTo)
      setMergeFrom('')
      setMergeTo('')
    }
  }

  const drawArrow = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const curveFactor = 0.3
    const controlX = midX - dy * curveFactor
    const controlY = midY + dx * curveFactor

    return (
      <g key={`arrow-${x1}-${y1}-${x2}-${y2}`}>
        <path
          d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      </g>
    )
  }

  const handleDrag = (e: any, ui: any, commit: Commit) => {
    const updatedPositions = nodePositions.map(node =>
      node.commit.id === commit.id
        ? { ...node, x: node.x + ui.deltaX, y: node.y + ui.deltaY }
        : node
    )
    setNodePositions(updatedPositions)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Commit History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">Current Branch: {currentBranch}</div>
          {branches.length > 0 && (
            <Select onValueChange={onBranchChange} value={currentBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Switch branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex space-x-4 mb-4">
          <Input
            placeholder="New branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
          />
          <Button onClick={handleCreateBranch} disabled={!selectedCommit || !newBranchName}>
            Create Branch
          </Button>
        </div>
        <div className="flex space-x-4 mb-4">
          <Input
            placeholder="Merge from branch"
            value={mergeFrom}
            onChange={(e) => setMergeFrom(e.target.value)}
          />
          <Input
            placeholder="Merge to branch"
            value={mergeTo}
            onChange={(e) => setMergeTo(e.target.value)}
          />
          <Button onClick={handleMergeBranches} disabled={!mergeFrom || !mergeTo}>
            Merge Branches
          </Button>
        </div>
        {commits.length > 0 ? (
          <div className="w-full overflow-auto">
            <svg
              ref={svgRef}
              width="100%"
              height={commits.length * 100 + 100}
              className="min-w-[800px] min-h-[600px]"
              viewBox={`0 0 800 ${Math.max(600, commits.length * 100 + 100)}`}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8884d8" />
                </marker>
              </defs>
              {/* Draw connection arrows */}
              {nodePositions.map((node) => {
                const parent = commits.find(c => c.id === node.commit.parentId)
                if (!parent) return null
                const parentNode = nodePositions.find(n => n.commit.id === parent.id)
                if (!parentNode) return null

                const isNewBranch = parent.branch !== node.commit.branch
                const isMerge = parent.branch !== node.commit.branch && commits.indexOf(node.commit) > 0

                return drawArrow(
                  parentNode.x + BOX_WIDTH / 2,
                  parentNode.y + BOX_HEIGHT / 2,
                  node.x + BOX_WIDTH / 2,
                  node.y - BOX_HEIGHT / 2,
                  isNewBranch ? COLORS.branch : (isMerge ? COLORS.merge : COLORS.main)
                )
              })}

              {/* Draw commit boxes */}
              {nodePositions.map((node) => (
                <Draggable
                  key={node.commit.id}
                  onDrag={(e, ui) => handleDrag(e, ui, node.commit)}
                  position={{x: node.x, y: node.y}}
                >
                  <g
                    onClick={() => {
                      onCommitClick(node.commit)
                      setSelectedCommit(node.commit)
                    }}
                    className="cursor-move"
                  >
                    <rect
                      x="0"
                      y="0"
                      width={BOX_WIDTH}
                      height={BOX_HEIGHT}
                      rx="4"
                      fill={selectedCommit?.id === node.commit.id ? '#e0e7ff' : 'white'}
                      stroke={COLORS.main}
                      strokeWidth="2"
                      className="transition-colors hover:fill-blue-50"
                    />
                    <text
                      x={BOX_WIDTH / 2}
                      y={BOX_HEIGHT / 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#333"
                    >
                      {`Commit ${node.commit.id}`}
                    </text>
                    <text
                      x={BOX_WIDTH / 2}
                      y={BOX_HEIGHT / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="#666"
                    >
                      {node.commit.message}
                    </text>
                    <text
                      x={BOX_WIDTH / 2}
                      y={BOX_HEIGHT * 3 / 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="#666"
                    >
                      {`Branch: ${node.commit.branch}`}
                    </text>
                    <Link href={`/commit/${node.commit.id}`} className="absolute top-1 right-1">
                      <Button variant="ghost" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Button>
                    </Link>
                  </g>
                </Draggable>
              ))}
            </svg>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No commits yet. Make changes and commit to see the history.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
