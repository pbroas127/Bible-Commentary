interface CommentaryDisplayProps {
  html: string
  book: string
  chapter: number
}

export default function CommentaryDisplay({ html }: CommentaryDisplayProps) {
  return (
    <div className="commentary-container">
      <div
        className="commentary-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
