import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onUpload: (image: string) => void
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setError(null)
      setSuccess(false)
      handleFile(file)
    } else {
      setError('Please drop a valid image file.')
      setSuccess(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setError(null)
      setSuccess(false)
      handleFile(file)
    } else {
      setError('Please select a valid image file.')
      setSuccess(false)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        onUpload(e.target.result as string)
        setSuccess(true)
      }
    }

    reader.onerror = () => {
      setError('Error reading file')
      setSuccess(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="mb-4">Drag and drop an image here, or click to select a file</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="fileInput"
      />
      <label htmlFor="fileInput">
        <Button type="button" className="cursor-pointer">Select Image</Button>
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Image uploaded successfully!</p>}
    </div>
  )
}
