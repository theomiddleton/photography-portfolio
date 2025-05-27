import * as React from 'react'
import { isNodeSelection, type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

// --- Icons ---
import { ChevronDownIcon } from '~/components/blog/tiptap-icons/chevron-down-icon'

// --- Tiptap UI ---
import {
  TextAlignButton,
  textAlignIcons,
  textAlignLabels,
  type TextAlign,
  checkTextAlignExtension,
} from '~/components/blog/tiptap-ui/text-align-button/text-align-button'

// --- UI Primitives ---
import {
  Button,
  ButtonProps,
} from '~/components/blog/tiptap-ui-primitive/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '~/components/blog/tiptap-ui-primitive/dropdown-menu'

export interface TextAlignDropdownMenuProps extends Omit<ButtonProps, 'type'> {
  editor?: Editor | null
  alignments?: TextAlign[]
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function TextAlignDropdownMenu({
  editor: providedEditor,
  alignments = ['left', 'center', 'right', 'justify'],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: TextAlignDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const textAlignInSchema = checkTextAlignExtension(editor)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange],
  )

  const getActiveIcon = React.useCallback(() => {
    if (!editor) {
      const DefaultIcon = textAlignIcons.left
      return <DefaultIcon className="tiptap-button-icon" />
    }

    const activeAlignment = alignments.find((align) =>
      editor.isActive({ textAlign: align }),
    ) as TextAlign | undefined

    // Default to left alignment if none is explicitly set
    const alignment = activeAlignment || 'left'
    const ActiveIcon = textAlignIcons[alignment]
    return <ActiveIcon className="tiptap-button-icon" />
  }, [editor, alignments])

  const canSetAnyAlignment = React.useCallback((): boolean => {
    if (!editor) return false
    return alignments.some((align) => {
      try {
        return editor.can().setTextAlign(align)
      } catch {
        return false
      }
    })
  }, [editor, alignments])

  const isDisabled = !canSetAnyAlignment()
  const isAnyAlignmentActive = alignments.some((align) =>
    editor?.isActive({ textAlign: align }),
  )

  const show = React.useMemo(() => {
    if (!textAlignInSchema) {
      return false
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection)) {
        return false
      }
    }

    return true
  }, [textAlignInSchema, hideWhenUnavailable, editor])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isAnyAlignmentActive ? 'on' : 'off'}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Text alignment"
          aria-pressed={isAnyAlignmentActive}
          tooltip="Text Alignment"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {alignments.map((align) => (
            <DropdownMenuItem key={`text-align-${align}`} asChild>
              <TextAlignButton
                editor={editor}
                align={align}
                text={textAlignLabels[align]}
                tooltip=""
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TextAlignDropdownMenu
