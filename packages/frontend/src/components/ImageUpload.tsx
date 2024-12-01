import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onUpload: (image: string) => void
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)

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
    handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpload(e.target.result as string)
      }
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
        <Button>Select Image</Button>
      </label>
    </div>
  )
}
