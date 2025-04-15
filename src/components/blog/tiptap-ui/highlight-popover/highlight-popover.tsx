import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "~/hooks/use-menu-navigation"
import { useTiptapEditor } from "~/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "~/components/blog/tiptap-icons/ban-icon"
import { HighlighterIcon } from "~/components/blog/tiptap-icons/highlighter-icon"

// --- Lib ---
import { isMarkInSchema } from "~/lib/tiptap-utils"

// --- UI Primitives ---
import { Button, ButtonProps } from "~/components/blog/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/blog/tiptap-ui-primitive/popover"
import { Separator } from "~/components/blog/tiptap-ui-primitive/separator"

// --- Styles ---
// Remove SCSS import
// import "@/components/tiptap-ui/highlight-popover/highlight-popover.scss"

export interface HighlightColor {
  label: string
  value: string
  border?: string
}

export interface HighlightContentProps {
  editor?: Editor | null
  colors?: HighlightColor[]
  activeNode?: number
}

export const DEFAULT_HIGHLIGHT_COLORS: HighlightColor[] = [
  {
    label: "Green",
    value: "#dcfce7",
    border: "#86efac",
  },
  {
    label: "Blue",
    value: "#e0f2fe",
    border: "#93c5fd",
  },
  {
    label: "Red",
    value: "#ffe4e6",
    border: "#fca5a5",
  },
  {
    label: "Purple",
    value: "#f3e8ff",
    border: "#d8b4fe",
  },
  {
    label: "Yellow",
    value: "#fef9c3",
    border: "#fde047",
  },
]

export const useHighlighter = (editor: Editor | null) => {
  const markAvailable = isMarkInSchema("highlight", editor)

  const getActiveColor = React.useCallback(() => {
    if (!editor) return null
    if (!editor.isActive("highlight")) return null
    const attrs = editor.getAttributes("highlight")
    return attrs.color || null
  }, [editor])

  const toggleHighlight = React.useCallback(
    (color: string) => {
      if (!markAvailable || !editor) return
      if (color === "none") {
        editor.chain().focus().unsetMark("highlight").run()
      } else {
        editor.chain().focus().toggleMark("highlight", { color }).run()
      }
    },
    [markAvailable, editor]
  )

  return {
    markAvailable,
    getActiveColor,
    toggleHighlight,
  }
}

export const HighlighterButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Highlight text"
      tooltip="Highlight"
      ref={ref}
      {...props}
    >
      {children || <HighlighterIcon className="tiptap-button-icon" />}
    </Button>
  )
})

export function HighlightContent({
  editor: providedEditor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  onClose,
}: {
  editor?: Editor | null
  colors?: HighlightColor[]
  onClose?: () => void
}) {
  const editor = useTiptapEditor(providedEditor)

  const containerRef = React.useRef<HTMLDivElement>(null)

  const { getActiveColor, toggleHighlight } = useHighlighter(editor)
  const activeColor = getActiveColor()

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      toggleHighlight(item.value)
      onClose?.()
    },
    onClose,
    autoSelectFirstItem: false,
  })

  return (
    <div 
      ref={containerRef} 
      className="flex items-center gap-1 outline-none" 
      tabIndex={0}
    >
      <div className="flex items-center" data-orientation="horizontal">
        {colors.map((color, index) => (
          <Button
            key={color.value}
            type="button"
            role="menuitem"
            data-active-state={activeColor === color.value ? "on" : "off"}
            aria-label={`${color.label} highlight color`}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-style="ghost"
            onClick={() => toggleHighlight(color.value)}
            data-highlighted={selectedIndex === index}
          >
            <span
              className={`
                relative w-5 h-5 -mx-0.5 rounded-full
                transition-transform duration-200 ease-in-out
                after:content-[''] after:absolute after:inset-0
                after:rounded-full after:border
                after:border-current after:opacity-20
                data-[active-state=on]:after:opacity-40
              `}
              style={{
                backgroundColor: color.value,
                borderColor: color.border,
              }}
            />
          </Button>
        ))}
      </div>

      <Separator />

      <div className="flex items-center">
        <Button
          onClick={() => toggleHighlight("none")}
          aria-label="Remove highlight"
          tabIndex={selectedIndex === colors.length ? 0 : -1}
          type="button"
          role="menuitem"
          data-style="ghost"
          data-highlighted={selectedIndex === colors.length}
        >
          <BanIcon className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    </div>
  )
}

export interface HighlightPopoverProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * The highlight colors to display in the popover.
   */
  colors?: HighlightColor[]
  /**
   * Whether to hide the highlight popover.
   */
  hideWhenUnavailable?: boolean
}

export function HighlightPopover({
  editor: providedEditor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  hideWhenUnavailable = false,
  ...props
}: HighlightPopoverProps) {
  const editor = useTiptapEditor(providedEditor)

  const { markAvailable } = useHighlighter(editor)
  const [isOpen, setIsOpen] = React.useState(false)

  const isDisabled = React.useMemo(() => {
    if (!markAvailable || !editor) {
      return true
    }

    return (
      editor.isActive("code") ||
      editor.isActive("codeBlock") ||
      editor.isActive("imageUpload")
    )
  }, [markAvailable, editor])

  const canSetMark = React.useMemo(() => {
    if (!editor || !markAvailable) return false

    try {
      return editor.can().setMark("highlight")
    } catch {
      return false
    }
  }, [editor, markAvailable])

  const isActive = editor?.isActive("highlight") ?? false

  const show = React.useMemo(() => {
    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection) || !canSetMark) {
        return false
      }
    }

    return true
  }, [hideWhenUnavailable, editor, canSetMark])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <HighlighterButton
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          aria-pressed={isActive}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Highlight colors">
        <HighlightContent
          editor={editor}
          colors={colors}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

HighlighterButton.displayName = "HighlighterButton"

export default HighlightPopover
