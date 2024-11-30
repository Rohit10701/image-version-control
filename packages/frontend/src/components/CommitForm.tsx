import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CommitFormProps {
  onCommit: (message: string) => void
}

export default function CommitForm({ onCommit }: CommitFormProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onCommit(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter commit message"
        className="flex-grow"
      />
      <Button type="submit">Commit</Button>
    </form>
  )
}
