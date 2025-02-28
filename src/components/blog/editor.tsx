'use client'

import { type FC, useCallback, useEffect, useRef } from 'react'
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
} from '@mdxeditor/editor'
import { Card, CardContent } from '~/components/ui/card'
import { cn } from '~/lib/utils'

interface BlogEditorProps {
  content: string
  onChange: (content: string) => void
  onAutoSave?: () => void
  className?: string
  autoSaveInterval?: number
}

export const BlogEditor: FC<BlogEditorProps> = ({
  content,
  onChange,
  onAutoSave,
  className,
  autoSaveInterval = 30000, // Default to 30 seconds
}) => {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = useCallback(
    (newContent: string) => {
      onChange(newContent)

      // Reset auto-save timer
      if (onAutoSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }
        autoSaveTimerRef.current = setTimeout(() => {
          onAutoSave()
        }, autoSaveInterval)
      }
    },
    [onChange, onAutoSave, autoSaveInterval],
  )

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <MDXEditor
          onChange={handleChange}
          markdown={content}
          plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                </>
              ),
            }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            imagePlugin({
              imageUploadHandler: async (file) => {
                // TODO: Implement image upload handler
                return 'https://placeholder.com/image.jpg'
              },
            }),
            linkPlugin(),
            linkDialogPlugin(),
          ]}
        />
      </CardContent>
    </Card>
  )
}
