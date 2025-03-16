'use client'

import React from 'react'
import { Button } from '~/components/ui/button'
import { usePublisher } from '@mdxeditor/editor'
import { insertJsx$ } from '@mdxeditor/editor'
import {
  InfoIcon,
  ImageIcon,
  LayoutIcon,
  FileTextIcon,
  SplitIcon,
} from 'lucide-react'

// Define types for the custom component insertion functions
interface CustomComponentProps {
  onClick: () => void
  title: string
  icon: React.ReactNode
}

// Custom component button for the toolbar
export function CustomComponentButton({
  onClick,
  title,
  icon,
}: CustomComponentProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="flex h-8 items-center gap-1 px-2 text-xs"
      title={title}
    >
      {icon}
      <span className="hidden md:inline">{title}</span>
    </Button>
  )
}

// InfoBox component insertion
export function InsertInfoBox() {
  const insertJsx = usePublisher(insertJsx$)
  const handleClick = () => {
    insertJsx({
      name: 'InfoBox',
      kind: 'flow',
      props: {
        title: 'Important Note',
        children: 'This is an important message that needs attention.',
      },
    })
  }

  return (
    <CustomComponentButton
      onClick={handleClick}
      title="InfoBox"
      icon={<InfoIcon className="h-4 w-4" />}
    />
  )
}

// ImageGallery component insertion
export function InsertImageGallery() {
  const insertJsx = usePublisher(insertJsx$)
  const handleClick = () => {
    insertJsx({
      name: 'ImageGallery',
      kind: 'flow',
      props: {
        images: [
          { src: 'image1.jpg', alt: 'Image 1' },
          { src: 'image2.jpg', alt: 'Image 2' },
        ],
      },
    })
  }

  return (
    <CustomComponentButton
      onClick={handleClick}
      title="Gallery"
      icon={<ImageIcon className="h-4 w-4" />}
    />
  )
}

// Banner component insertion
export function InsertBanner() {
  const insertJsx = usePublisher(insertJsx$)
  const handleClick = () => {
    insertJsx({
      name: 'Banner',
      kind: 'flow',
      props: {
        type: 'info',
        title: 'Notice',
        children: 'Important information here',
      },
    })
  }

  return (
    <CustomComponentButton
      onClick={handleClick}
      title="Banner"
      icon={<LayoutIcon className="h-4 w-4" />}
    />
  )
}

// Card component insertion
export function InsertCard() {
  const insertJsx = usePublisher(insertJsx$)
  const handleClick = () => {
    insertJsx({
      name: 'Card',
      kind: 'flow',
      props: {
        children: [
          {
            name: 'CardHeader',
            kind: 'flow',
            props: {
              children: [
                {
                  name: 'CardTitle',
                  kind: 'flow',
                  props: { children: 'Card Title' },
                },
                {
                  name: 'CardDescription',
                  kind: 'flow',
                  props: { children: 'Card description' },
                },
              ],
            },
          },
          {
            name: 'CardContent',
            kind: 'flow',
            props: { children: 'Card content goes here' },
          },
          {
            name: 'CardFooter',
            kind: 'flow',
            props: { children: 'Card footer' },
          },
        ],
      },
    })
  }

  return (
    <CustomComponentButton
      onClick={handleClick}
      title="Card"
      icon={<FileTextIcon className="h-4 w-4" />}
    />
  )
}

// ImageCompare component insertion
export function InsertImageCompare() {
  const insertJsx = usePublisher(insertJsx$)
  const handleClick = () => {
    insertJsx({
      name: 'ImageCompare',
      kind: 'flow',
      props: {
        beforeImage: 'before.jpg',
        afterImage: 'after.jpg',
        beforeLabel: 'Before',
        afterLabel: 'After',
      },
    })
  }

  return (
    <CustomComponentButton
      onClick={handleClick}
      title="Compare"
      icon={<SplitIcon className="h-4 w-4" />}
    />
  )
}
