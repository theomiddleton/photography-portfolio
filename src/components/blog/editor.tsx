'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  frontmatterPlugin,
  diffSourcePlugin,
  ListsToggle,
  CodeToggle,
  InsertTable,
  InsertThematicBreak,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  jsxPlugin,
  type MDXEditorMethods,
  usePublisher,
  insertJsx$,
  type JsxComponentDescriptor,
} from '@mdxeditor/editor'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import '@mdxeditor/editor/style.css'
import type { BlogPost, BlogImage } from '~/server/db/schema'
import { createPost, updatePost } from '~/lib/actions/blog-actions'
import { UploadImg } from '~/components/upload-img'

import { InfoBox } from './info-box'

interface BlogEditorProps {
  post?: BlogPost & { images?: BlogImage[] }
  session?: { id: number, email: string, role: string }
}

// Define your custom component descriptor
const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: 'InfoBox',
    kind: 'flow',
    source: './info-box',
    props: [
      { name: 'title', type: 'string' },
    ],
    Editor: ({ mdastNode, ...props }) => {
      const nodeProps = mdastNode?.attributes?.reduce((acc, attr) => {
        if (attr.type === 'mdxJsxAttribute') {
          acc[attr.name] = attr.value
        }
        return acc
      }, {} as Record<string, any>) ?? {}

      return (
        <InfoBox title={nodeProps.title}>
          {nodeProps.children}
        </InfoBox>
      )
    }
  }
]

// Custom Insert Button Component
const InsertInfoBoxButton: React.FC = () => {
  const insertJsx = usePublisher(insertJsx$)

  return (
    <Button
      variant="ghost"
      className="h-8 px-2 text-xs"
      onClick={() =>
        insertJsx({
          name: 'InfoBox',
          kind: 'flow',
          props: {
            title: 'Information'
          }
        })
      }
    >
      Insert Info Box
    </Button>
  )
}

export function BlogEditor({ post, session }: BlogEditorProps = {}) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [description, setDescription] = useState(post?.description || '')
  const [content, setContent] = useState(post?.content || '')
  const [published, setPublished] = useState(post?.published || false)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<MDXEditorMethods>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)

  useEffect(() => {
    // Generate slug from title
    if (title && !post?.slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-'),
      )
    }
  }, [title, post?.slug])

  const handleSave = async () => {
    if (!title || !slug || !content) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)

    try {
      const postData = {
        title,
        slug,
        description,
        content,
        published,
        authorId: session?.id,
      }

      if (post) {
        await updatePost(post.id, postData)
        toast('Post updated successfully')
      } else {
        const newPost = await createPost(postData)
        toast('Post created successfully')

        // Redirect to edit page for the new post
        router.push(`/admin/edit/${newPost.slug}`)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      toast('Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // TODO: Implement image upload
    console.log('handleImageUpload')
  }

  const handleImageUploaded = (image: { name: string; url: string }) => {
    // Insert the uploaded image into the editor
    if (editorRef.current) {
      editorRef.current.insertMarkdown(`![${image.name}](${image.url})`)
      setShowImageUpload(false)
    }
  }

  const testInsert = () => {
    if (editorRef.current) {
      // editorRef.current.insertMarkdown('Test')
      editorRef.current?.insertMarkdown(
        'waow\n ```jsx\n<InfoBox title="Information">\nYour information content here\n</InfoBox>\n```',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <div className="flex gap-2">
          {post && post.published && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Post
              </Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the post"
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <div className="mt-1 rounded-md border">
            <MDXEditor
              ref={editorRef}
              markdown={content}
              onChange={setContent}
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin(),
                tablePlugin(),
                codeBlockPlugin(),
                codeMirrorPlugin(),
                diffSourcePlugin(),
                frontmatterPlugin(),
                markdownShortcutPlugin(),
                jsxPlugin({ jsxComponentDescriptors }),
                toolbarPlugin({
                  toolbarContents: () => (
                    <div className="flex flex-wrap items-center gap-0.5 rounded-md bg-black/5 p-1 dark:bg-white/10">
                      <UndoRedo />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <BoldItalicUnderlineToggles />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <BlockTypeSelect />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <ListsToggle />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <CreateLink />
                      <InsertImage />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <CodeToggle />
                      <ConditionalContents
                        options={[
                          {
                            when: (editor) =>
                              editor?.editorType === 'codemirror',
                            contents: () => <ChangeCodeMirrorLanguage />,
                          },
                        ]}
                      />
                      <div className="mx-1 h-6 w-px bg-current opacity-20" />
                      <InsertTable />
                      <InsertThematicBreak />
                      {/* Image Upload Button */}
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        title="Upload Image"
                      >
                        Upload Image
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={testInsert}
                        title="Test Insert"
                      >
                        Test Insert
                      </Button>
                      <InsertInfoBoxButton />
                    </div>
                  ),
                }),
              ]}
              contentEditableClassName="prose dark:prose-invert max-w-none p-4 min-h-[400px]"
            />
          </div>
          {showImageUpload && (
            <div className="mt-4 rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Upload Image</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageUpload(false)}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <UploadImg bucket="blog" onImageUpload={handleImageUploaded} />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>
    </div>
  )
}
