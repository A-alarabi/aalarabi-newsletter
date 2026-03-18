interface NewsletterContentProps {
  content: string
}

export default function NewsletterContent({ content }: NewsletterContentProps) {
  return (
    <article
      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#1a1a2e] prose-a:text-[#e63946] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
