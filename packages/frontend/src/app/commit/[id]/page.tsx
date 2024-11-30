'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Commit } from '../../../types'

export default function CommitDetails() {
  const params = useParams()
  const [commit, setCommit] = useState<Commit | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the commit data from your backend
    // For this example, we'll simulate fetching data
    const fetchCommit = async () => {
      // Simulated API call
      const response = await fetch(`/api/commits/${params.id}`)
      const data = await response.json()
      setCommit(data)
    }

    fetchCommit()
  }, [params.id])

  if (!commit) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Commit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Commit Information</h2>
              <p><strong>ID:</strong> {commit.id}</p>
              <p><strong>Message:</strong> {commit.message}</p>
              <p><strong>Branch:</strong> {commit.branch}</p>
              <p><strong>Timestamp:</strong> {new Date(commit.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Image Preview</h2>
              <div className="relative w-full h-64">
                <Image
                  src={commit.image}
                  alt={`Commit ${commit.id} preview`}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/">
              <Button>Back to Commit History</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
