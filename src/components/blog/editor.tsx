'use client'

import * as React from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Underline } from '@tiptap/extension-underline'

// --- Custom Extensions ---
import { Link } from '~/components/blog/tiptap-extension/link-extension'
import { Selection } from '~/components/blog/tiptap-extension/selection-extension'
import { TrailingNode } from '~/components/blog/tiptap-extension/trailing-node-extension'

// --- UI Primitives ---
import { Button } from '~/components/blog/tiptap-ui-primitive/button'
import { Spacer } from '~/components/blog/tiptap-ui-primitive/spacer'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '~/components/blog/tiptap-ui-primitive/toolbar'

// --- Tiptap Node ---
import { ImageUploadNode } from '~/components/blog/image-upload-node/image-upload-node-extension'

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '~/components/blog/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '~/components/blog/tiptap-ui/image-upload-button'
import { ListDropdownMenu } from '~/components/blog/tiptap-ui/list-dropdown-menu'
import { NodeButton } from '~/components/blog/tiptap-ui/node-button'
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from '~/components/blog/tiptap-ui/highlight-popover'
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from '~/components/blog/tiptap-ui/link-popover'
import { MarkButton } from '~/components/blog/tiptap-ui/mark-button'
import { TextAlignButton } from '~/components/blog/tiptap-ui/text-align-button'
import { UndoRedoButton } from '~/components/blog/tiptap-ui/undo-redo-button'

// --- Icons ---
import { ArrowLeftIcon } from '~/components/blog/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '~/components/blog/tiptap-icons/highlighter-icon'
import { LinkIcon } from '~/components/blog/tiptap-icons/link-icon'

// --- Hooks ---
import { useMobile } from '~/hooks/use-mobile'
import { useWindowSize } from '~/hooks/use-window-size'

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '~/lib/tiptap-utils'

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
)

export function SimpleEditor({ initialContent }: { initialContent: any }) {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const [rect, setRect] = React.useState({ y: 0 })
  const [isEditorReady, setIsEditorReady] = React.useState(false)
  const [isToolbarReady, setIsToolbarReady] = React.useState(false)

  React.useEffect(() => {
    setRect(document.body.getBoundingClientRect())
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList.configure({
            HTMLAttributes: {
              class: 'not-prose pl-0',
            },
          }),
          TaskItem.configure({
            nested: true,
            HTMLAttributes: {
              class: 'flex items-start gap-2 my-2 text-base text-gray-900 [&:has(input:checked)]:text-gray-500 [&:has(input:checked)]:line-through',
            },
          }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent,  // Use the passed content instead of imported content
    onCreate: () => {
      setIsEditorReady(true)
      setIsToolbarReady(true)
    },
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <EditorContext.Provider value={{ editor }}>
      {!isToolbarReady ? (
        <div className="h-11 bg-white animate-pulse" />
      ) : (
        <Toolbar
          style={
            isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                }
              : {}
          }
          className="h-11"
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>
      )}

      <div className="h-[calc(100%-2.75rem)] overflow-y-auto scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        {!isEditorReady ? (
          <div className="max-w-2xl w-full mx-auto px-12 py-12 sm:px-6 sm:py-4">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
            </div>
          </div>
        ) : (
          <EditorContent
            editor={editor}
            role="presentation"
            className={`
              max-w-2xl w-full mx-auto
              px-12 py-12 sm:px-6 sm:py-4
              simple-editor-content
              prose prose-sm sm:prose lg:prose-lg xl:prose-xl
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-2xl prose-h1:mt-12
              prose-h2:text-xl prose-h2:mt-10
              prose-h3:text-lg prose-h3:mt-8
              prose-h4:text-base prose-h4:mt-8
              prose-p:text-base prose-p:leading-relaxed prose-p:mt-5 first:prose-p:mt-0
              prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-md prose-pre:p-4 prose-pre:my-6
              prose-code:bg-gray-100 prose-code:text-gray-700 prose-code:border prose-code:border-gray-200 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
              prose-blockquote:border-l-4 prose-blockquote:border-gray-900 prose-blockquote:pl-4 prose-blockquote:py-1.5 prose-blockquote:my-6
              prose-ol:list-decimal prose-ol:mt-6 prose-ol:mb-6 prose-ol:pl-6
              prose-ul:list-disc prose-ul:mt-6 prose-ul:mb-6 prose-ul:pl-6
              prose-li:mt-2
              [&_.task-list]:list-none [&_.task-list]:pl-0
              [&_.task-item]:flex [&_.task-item]:items-start [&_.task-item]:gap-2
              [&_.task-item]:pl-0 [&_.task-item]:mt-2
              [&_.task-item]:text-base [&_.task-item]:text-gray-900
              [&_.task-item_input[type="checkbox"]]:mt-1 [&_.task-item_input[type="checkbox"]]:mr-1
              [&_.task-item]:before:content-none
              prose-a:text-blue-500 prose-a:underline
              prose-hr:my-12 prose-hr:border-gray-200
              prose-img:my-8 prose-img:rounded-sm prose-img:max-w-full prose-img:h-auto
              [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-blue-500
              [&_.collaboration-cursor__caret]:border-r [&_.collaboration-cursor__caret]:border-l [&_.collaboration-cursor__caret]:border-transparent
              [&_.tiptap-thread]:transition-colors [&_.tiptap-thread--unresolved]:border-b-2 [&_.tiptap-thread--unresolved]:border-dashed [&_.tiptap-thread--unresolved]:border-yellow-400
              [&_.tiptap-thread--selected]:bg-yellow-50 [&_.tiptap-thread--selected]:border-transparent
              [&_[data-type="mention"]]:inline-block [&_[data-type="mention"]]:text-blue-500
              [&_[data-type="emoji"]_img]:inline-block [&_[data-type="emoji"]_img]:w-5 [&_[data-type="emoji"]_img]:h-5 [&_[data-type="emoji"]_img]:cursor-text
              [&_.ProseMirror-gapcursor]:hidden [&_.ProseMirror-gapcursor]:pointer-events-none [&_.ProseMirror-gapcursor]:absolute
              [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-gray-400 [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:pointer-events-none
              outline-none
            `}
          />
        )}
      </div>
    </EditorContext.Provider>
  )
}
