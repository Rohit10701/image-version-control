import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface WorkspaceProps {
  image: string
  onChange: (editedImage: string) => void
}

export default function Workspace({ image, onChange }: WorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = image
      }
    }
  }, [image])

  const applyFilter = (filter: string) => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.filter = filter
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          onChange(canvas.toDataURL())
        }
        img.src = image
      }
    }
  }

  return (
    <div className="mb-4">
      <canvas ref={canvasRef} className="max-w-full mb-4" />
      <div className="flex space-x-2">
        <Button onClick={() => applyFilter('grayscale(100%)')}>Grayscale</Button>
        <Button onClick={() => applyFilter('sepia(100%)')}>Sepia</Button>
        <Button onClick={() => applyFilter('invert(100%)')}>Invert</Button>
        <Button onClick={() => applyFilter('none')}>Reset</Button>
      </div>
    </div>
  )
}
