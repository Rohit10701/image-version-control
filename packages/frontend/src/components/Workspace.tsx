'use client'

import { useState, useCallback } from 'react'

import { TABS, TOOLS } from 'react-filerobot-image-editor'
const FilerobotImageEditor = dynamic(() => import('react-filerobot-image-editor'), { ssr: false })
import Image from 'next/image'
import dynamic from 'next/dynamic'

interface WorkspaceProps {
  image: string
  onChange: (editedImage: string) => void
}

export default function Workspace({ image, onChange }: WorkspaceProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(true)

  const onComplete = useCallback((editedImageObject: any) => {
    setIsEditorOpen(false)
    onChange(editedImageObject.imageBase64)
  }, [onChange])

  const onClose = () => {
    setIsEditorOpen(false)
  }

  const config = {
    source: image,
    onComplete,
    onClose,
    annotationsCommon: {
      fill: '#ff0000'
    },
    Text: { text: 'Text...' },
    Crop: {
      presetsItems: [
        {
          titleKey: 'classicTv',
          descriptionKey: '4:3',
          ratio: 4 / 3,
        },
        {
          titleKey: 'cinemascope',
          descriptionKey: '21:9',
          ratio: 21 / 9,
        },
      ],
      presetsFolders: [
        {
          titleKey: 'socialMedia',
          groups: [
            {
              titleKey: 'facebook',
              items: [
                {
                  titleKey: 'profile',
                  width: 180,
                  height: 180,
                  descriptionKey: 'fbProfileSize',
                },
                {
                  titleKey: 'coverPhoto',
                  width: 820,
                  height: 312,
                  descriptionKey: 'fbCoverPhotoSize',
                },
              ],
            },
          ],
        },
      ],
    },
    tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.RESIZE],
    defaultTabId: TABS.ADJUST,
    defaultToolId: TOOLS.CROP,
  }

  return (
    <div className="workspace">
      {isEditorOpen && (
        <FilerobotImageEditor
          {...config}
          onSave={onComplete}
          onClose={onClose}
        />
      )}
      {!isEditorOpen && (
      <>
	      <Image src={image} alt="image" width={500}
          height={300} style={{ maxWidth: '100%', height: 'auto' }} />
        <button
          onClick={() => setIsEditorOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Image
        </button>
      </>
      )}
    </div>
  )
}
