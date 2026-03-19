'use client'

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BaseImage from '@tiptap/extension-image'
import ResizableImageNodeView from './ResizableImageNodeView'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import { useEffect, useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

// Extended Image with alignment + float + width attributes + drag-handle NodeView
const Image = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (el) => (el as HTMLImageElement).getAttribute('data-align') || 'center',
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
      float: {
        default: 'none',
        parseHTML: (el) => (el as HTMLImageElement).getAttribute('data-float') || 'none',
        renderHTML: (attrs) => ({ 'data-float': attrs.float }),
      },
      width: {
        default: null,
        parseHTML: (el) => (el as HTMLImageElement).getAttribute('data-width') || null,
        renderHTML: (attrs) => attrs.width ? { 'data-width': attrs.width, style: `width:${attrs.width}` } : {},
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView)
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

interface TBtnProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  className?: string
}

function TBtn({ onClick, active, title, children, className }: TBtnProps) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded text-xs font-medium transition-colors',
        active ? 'bg-[#1a1a2e] text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-[#1a1a2e]',
        className
      )}>
      {children}
    </button>
  )
}

function Divider() { return <div className="w-px h-5 bg-gray-200 mx-0.5" /> }

export default function RichTextEditor({
  value, onChange, placeholder = 'اكتب محتوى النشرة هنا...', className,
}: RichTextEditorProps) {
  const isFirstRender = useRef(true)
  const onChangeCb = useCallback(onChange, []) // eslint-disable-line

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, bulletList: false, orderedList: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'right' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#e63946] underline cursor-pointer' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => { onChangeCb(editor.getHTML()) },
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[400px] focus:outline-none p-4 text-[#1a1a2e] prose prose-sm max-w-none',
        dir: 'rtl',
      },
    },
  })

  useEffect(() => {
    if (editor && isFirstRender.current && value && value !== '<p></p>') {
      editor.commands.setContent(value)
      isFirstRender.current = false
    }
  }, [editor, value])

  const addImageFromUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt('أدخل رابط الصورة:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const json = await res.json()
      if (json.data?.url) editor.chain().focus().setImage({ src: json.data.url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('أدخل الرابط:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const [manualWidth, setManualWidth] = useState('')

  const setImageAlign = useCallback((align: 'right' | 'center' | 'left') => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { align }).run()
  }, [editor])

  const setImageFloat = useCallback((float: 'none' | 'right' | 'left') => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { float }).run()
  }, [editor])

  const setImageWidth = useCallback((width: string) => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { width: width || null }).run()
  }, [editor])

  const applyManualWidth = useCallback(() => {
    const px = parseInt(manualWidth, 10)
    if (!isNaN(px) && px > 0) setImageWidth(`${px}px`)
    else setImageWidth('')
  }, [manualWidth, setImageWidth])

  if (!editor) return null

  const imgActive = editor.isActive('image')
  const currentAlign = (editor.getAttributes('image').align as string | undefined) || 'center'
  const currentFloat = (editor.getAttributes('image').float as string | undefined) || 'none'

  return (
    <div className={cn('border border-gray-200 rounded-xl overflow-hidden bg-white', className)}>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">

        {/* Text style */}
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="غامق"><strong>B</strong></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="مائل"><em>I</em></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="تحته خط"><span className="underline">U</span></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="مشطوب"><s>S</s></TBtn>

        <Divider />

        {/* Headings */}
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="عنوان 1">H1</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="عنوان 2">H2</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="عنوان 3">H3</TBtn>
        <TBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="فقرة">P</TBtn>

        <Divider />

        {/* Text alignment */}
        <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="محاذاة يمين">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M9 12h12M3 17h18" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="توسيط">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M3 17h18" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="محاذاة يسار">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h18" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="ضبط">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
        </TBtn>

        <Divider />

        {/* Lists */}
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="قائمة نقطية">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="قائمة مرقمة">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="قائمة مهام">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </TBtn>

        <Divider />

        {/* Blocks */}
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="اقتباس">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3.691 6.292C5.094 4.771 7.217 4 10 4h1v2.819l-.804.161c-1.37.274-2.323.813-2.833 1.604A2.902 2.902 0 007 9.294V10h4v4H3v-4l.329-.451c-.01-.024-.097-.073-.329-.452-.17-.282-.229-.626-.279-.805l-.03-.109V6.292zm10 0C15.094 4.771 17.217 4 20 4h1v2.819l-.804.161c-1.37.274-2.323.813-2.833 1.604A2.902 2.902 0 0017 9.294V10h4v4h-8v-4l.329-.451c-.01-.024-.097-.073-.329-.452-.17-.282-.229-.626-.279-.805l-.03-.109V6.292z" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="كود">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="فاصل أفقي">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
        </TBtn>

        <Divider />

        {/* Link */}
        <TBtn onClick={setLink} active={editor.isActive('link')} title="رابط">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </TBtn>
        {/* Image from URL */}
        <TBtn onClick={addImageFromUrl} title="صورة (رابط)">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </TBtn>
        {/* Image upload */}
        <label className="flex items-center justify-center w-7 h-7 rounded text-gray-600 hover:bg-gray-200 hover:text-[#1a1a2e] transition-colors cursor-pointer" title="رفع صورة">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = '' }} />
        </label>

        <Divider />

        {/* History */}
        <TBtn onClick={() => editor.chain().focus().undo().run()} title="تراجع">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} title="إعادة">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="مسح التنسيق">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </TBtn>
      </div>

      {/* ── Image controls — visible only when image is selected ── */}
      {imgActive && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-sky-50 border-b border-sky-100 text-xs">
          <span className="text-sky-700 font-semibold shrink-0">تحكم بالصورة:</span>

          {/* Alignment — only when not floated */}
          {currentFloat === 'none' && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">محاذاة:</span>
              {(['right', 'center', 'left'] as const).map((a) => {
                const labels = { right: 'يمين', center: 'وسط', left: 'يسار' }
                return (
                  <button key={a} type="button" onClick={() => setImageAlign(a)}
                    className={cn('px-2 py-0.5 rounded text-xs border transition-colors',
                      currentAlign === a ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                    {labels[a]}
                  </button>
                )
              })}
              <div className="w-px h-4 bg-sky-200 mx-1" />
            </div>
          )}

          {/* Float / text-wrap */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500">التفاف النص:</span>
            {([['none', 'لا التفاف'], ['right', 'يمين ↩'], ['left', '↪ يسار']] as const).map(([f, label]) => (
              <button key={f} type="button" onClick={() => setImageFloat(f)}
                className={cn('px-2 py-0.5 rounded text-xs border transition-colors',
                  currentFloat === f ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-sky-200" />

          {/* Manual pixel width */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500">العرض:</span>
            <input
              type="number"
              min={60}
              max={2000}
              placeholder="px"
              value={manualWidth}
              onChange={(e) => setManualWidth(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyManualWidth() } }}
              className="w-16 px-1.5 py-0.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:border-sky-400"
            />
            <button type="button" onClick={applyManualWidth}
              className="px-2 py-0.5 rounded text-xs bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              تطبيق
            </button>
            <button type="button" onClick={() => { setManualWidth(''); setImageWidth('') }}
              className="px-2 py-0.5 rounded text-xs bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              افتراضي
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
