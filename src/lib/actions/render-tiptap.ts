import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

const example = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }]
    }
  ]
}

export async function renderTiptapContent(json: any) {
  try {

    // Check if json is valid and has the required structure
    if (!json || typeof json !== 'object' || !json.type) {
      console.error('Invalid Tiptap JSON format')
      return `Error parsing content: Invalid JSON format` 
    }
    
    // if (!example || typeof example !== 'object' || !example.type) {
    //   console.error('Invalid Tiptap JSON format')
    //   return `Error parsing content: Invalid JSON format` 
    // }

    // Configure extensions with proper defaults for SSR
    const extensions = [
      StarterKit.configure({
        // Disable any features that require window/DOM
        history: false,
      })
    ]

    return generateHTML(json, extensions)
    // return generateHTML(example, extensions)
  } catch (error) {
    console.error('Error rendering Tiptap content:', error)
    return `Error rendering content: ${error.message}`
  }
}
