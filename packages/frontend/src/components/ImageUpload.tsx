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
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    } else {
      // Optional: handle invalid file type error (if needed)
      alert('Please select an image file.')
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        onUpload(e.target.result as string)
      }
    }

    reader.onerror = () => {
      // Handle file read errors here
      alert('Error reading file')
    }
    console.log({file})
    reader.readAsDataURL(file as Blob)
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
        // className="hidden"
        id="fileInput"
      />
      {/* <label htmlFor="fileInput">
        <Button>Select Image</Button>
      </label> */}
    </div>
  )
}
