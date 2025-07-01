import * as React from "react"
import { Separator } from "~/components/blog/tiptap-ui-primitive/separator"

type BaseProps = React.HTMLAttributes<HTMLDivElement>

interface ToolbarProps extends BaseProps {
  variant?: "floating" | "fixed"
}

const mergeRefs = <T,>(
  refs: Array<React.RefObject<T> | React.Ref<T> | null | undefined>
): React.RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.RefObject<T | null>).current = value
      }
    })
  }
}

const useObserveVisibility = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
): void => {
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let isMounted = true

    if (isMounted) {
      requestAnimationFrame(callback)
    }

    const observer = new MutationObserver(() => {
      if (isMounted) {
        requestAnimationFrame(callback)
      }
    })

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      isMounted = false
      observer.disconnect()
    }
  }, [ref, callback])
}

const useToolbarKeyboardNav = (
  toolbarRef: React.RefObject<HTMLDivElement | null>
): void => {
  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const getFocusableElements = () =>
      Array.from(
        toolbar.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
        )
      )

    const navigateToIndex = (
      e: KeyboardEvent,
      targetIndex: number,
      elements: HTMLElement[]
    ) => {
      e.preventDefault()
      let nextIndex = targetIndex

      if (nextIndex >= elements.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = elements.length - 1
      }

      elements[nextIndex]?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements()
      if (!focusableElements.length) return

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = focusableElements.indexOf(currentElement)

      if (!toolbar.contains(currentElement)) return

      const keyActions: Record<string, () => void> = {
        ArrowRight: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowDown: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowLeft: () =>
          navigateToIndex(e, currentIndex - 1, focusableElements),
        ArrowUp: () => navigateToIndex(e, currentIndex - 1, focusableElements),
        Home: () => navigateToIndex(e, 0, focusableElements),
        End: () =>
          navigateToIndex(e, focusableElements.length - 1, focusableElements),
      }

      const action = keyActions[e.key]
      if (action) {
        action()
      }
    }

    toolbar.addEventListener("keydown", handleKeyDown)
    return () => toolbar.removeEventListener("keydown", handleKeyDown)
  }, [toolbarRef])
}

const useToolbarVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const toolbar = ref.current
    if (!toolbar) return

    // Check if any group has visible children
    const hasVisibleChildren = Array.from(toolbar.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      if (child.getAttribute("role") === "group") {
        return child.children.length > 0
      }
      return false
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useGroupVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const group = ref.current
    if (!group) return

    const hasVisibleChildren = Array.from(group.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      return true
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useSeparatorVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const separator = ref.current
    if (!separator) return

    const prevSibling = separator.previousElementSibling as HTMLElement
    const nextSibling = separator.nextElementSibling as HTMLElement

    if (!prevSibling || !nextSibling) {
      setIsVisible(false)
      return
    }

    const areBothGroups =
      prevSibling.getAttribute("role") === "group" &&
      nextSibling.getAttribute("role") === "group"

    const haveBothChildren =
      prevSibling.children.length > 0 && nextSibling.children.length > 0

    setIsVisible(areBothGroups && haveBothChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant = "fixed", ...props }, ref) => {
    const toolbarRef = React.useRef<HTMLDivElement>(null)
    const isVisible = useToolbarVisibility(toolbarRef)

    useToolbarKeyboardNav(toolbarRef)

    if (!isVisible) return null

    const baseClasses = `
      flex items-center gap-1
      ${variant === "fixed" ? `
        sticky top-0 z-10 w-full
        min-h-11
        bg-white dark:bg-black
        border-b border-gray-100 dark:border-gray-800
        px-2
        overflow-x-auto overscroll-contain
        touch-pan-x
        scrollbar-none
        sm:flex-wrap
        sm:justify-start
        sm:static
        sm:bottom-auto
        sm:border-t-0
        sm:border-b
        sm:p-2
      ` : `
        p-[0.188rem]
        rounded-xl
        border border-gray-100 dark:border-gray-800
        bg-white dark:bg-black
        shadow-md
        outline-hidden
        overflow-hidden
        data-[plain=true]:p-0
        data-[plain=true]:rounded-none
        data-[plain=true]:border-0
        data-[plain=true]:shadow-none
        data-[plain=true]:bg-transparent
        md:w-full
        md:rounded-none
        md:border-0
        md:shadow-none
      `}
      ${className || ""}
    `.trim()

    return (
      <div
        ref={mergeRefs([toolbarRef, ref])}
        role="toolbar"
        aria-label="toolbar"
        data-variant={variant}
        className={baseClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Toolbar.displayName = 'Toolbar'

export const ToolbarGroup = React.forwardRef<HTMLDivElement, BaseProps>(
  ({ children, className, ...props }, ref) => {
    const groupRef = React.useRef<HTMLDivElement>(null)
    const isVisible = useGroupVisibility(groupRef)

    if (!isVisible) return null

    return (
      <div
        ref={mergeRefs([groupRef, ref])}
        role="group"
        className={`flex items-center gap-0.5 empty:hidden ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, BaseProps>(
  ({ ...props }, ref) => {
    const separatorRef = React.useRef<HTMLDivElement>(null)
    const isVisible = useSeparatorVisibility(separatorRef)

    if (!isVisible) return null

    return (
      <Separator
        ref={mergeRefs([separatorRef, ref])}
        orientation="vertical"
        decorative
        {...props}
      />
    )
  }
)

ToolbarSeparator.displayName = "ToolbarSeparator"
