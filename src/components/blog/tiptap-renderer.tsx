'use client'

import * as React from 'react'

type NodeHandler = (props: { node: any; children: React.ReactNode }) => JSX.Element
type NodeHandlers = Record<string, NodeHandler>

const defaultHandlers: NodeHandlers = {
  doc: ({ children }) => <>{children}</>,
  paragraph: ({ children }) => <p className="mt-4">{children}</p>,
  text: ({ node }) => {
    let content = <span>{node.text}</span>

    if (node.marks) {
      node.marks.forEach((mark: any) => {
        switch (mark.type) {
          case 'bold':
            content = <strong>{content}</strong>
            break
          case 'italic':
            content = <em>{content}</em>
            break
          case 'strike':
            content = <del>{content}</del>
            break
          case 'code':
            content = <code>{content}</code>
            break
          case 'link':
            content = <a href={mark.attrs.href}>{content}</a>
            break
        }
      })
    }

    return content
  },
  heading: ({ node, children }) => {
    const Tag = `h${node.attrs.level}` as keyof JSX.IntrinsicElements
    return <Tag>{children}</Tag>
  },
  bulletList: ({ children }) => <ul>{children}</ul>,
  orderedList: ({ children }) => <ol>{children}</ol>,
  listItem: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  image: ({ node }) => (
    <img
      src={node.attrs.src}
      alt={node.attrs.alt}
      title={node.attrs.title}
      className="my-4 rounded-lg"
    />
  ),
}

export function TipTapRenderer({
  content,
  handlers = {},
}: {
  content: any
  handlers?: NodeHandlers
}) {
  const allHandlers = { ...defaultHandlers, ...handlers }

  const renderNode = (node: any): React.ReactNode => {
    const handler = allHandlers[node.type]
    if (!handler) {
      console.warn(`No handler for node type: ${node.type}`)
      return null
    }

    const children = node.content
      ? node.content.map((child: any) => renderNode(child))
      : null

    return handler({ node, children })
  }

  return <div className="tiptap-content">{renderNode(content)}</div>
}