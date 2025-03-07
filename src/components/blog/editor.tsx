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
import { createPost, updatePost } from '~/lib/blog/blog-actions'

interface BlogEditorProps {
  post?: BlogPost & { images?: BlogImage[] }
}

export function BlogEditor({ post }: BlogEditorProps = {}) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [description, setDescription] = useState(post?.description || '')
  const [content, setContent] = useState(post?.content || '')
  const [published, setPublished] = useState(post?.published || false)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<MDXEditor>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      }

      if (post) {
        await updatePost(post.id, postData)
        toast('Post updated successfully')
      } else {
        const newPost = await createPost(postData)
        toast('Post created successfully')

        // Redirect to edit page for the new post
        router.push(`/admin/edit/${newPost.id}`)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      toast('Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement image upload
    console.log('handleImageUpload')
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
            {isSaving ? "Saving..." : "Save Post"}
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
          <Switch id="published" checked={published} onCheckedChange={setPublished} />
          <Label htmlFor="published">Published</Label>
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <div className="mt-1 border rounded-md">
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
                toolbarPlugin({
                  toolbarContents: () => (
                    <div className="flex items-center flex-wrap gap-0.5 bg-slate-50 p-1 rounded-md">
                      <UndoRedo className="rounded hover:bg-slate-100" />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <BoldItalicUnderlineToggles className="rounded hover:bg-slate-100" />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <BlockTypeSelect className="rounded hover:bg-slate-100" />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <ListsToggle className="rounded hover:bg-slate-100" />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <CreateLink className="rounded hover:bg-slate-100" />
                      <InsertImage className="rounded hover:bg-slate-100" />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <CodeToggle className="rounded hover:bg-slate-100" />
                      <ConditionalContents
                        options={[
                          {
                            when: (editor) => editor?.editorType === 'codemirror',
                            contents: () => <ChangeCodeMirrorLanguage />
                          }
                        ]}
                      />
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <InsertTable className="rounded hover:bg-slate-100" />
                      <InsertThematicBreak className="rounded hover:bg-slate-100" />
                    </div>
                  ),
                }),
              ]}
              
              contentEditableClassName="prose dark:prose-invert max-w-none p-4 min-h-[400px]"
            />
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    </div>
  )
}
