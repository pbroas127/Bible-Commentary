import { useState } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  onSearch: (book: string, chapter: number) => void
  initialBook?: string
  initialChapter?: number
}

const BOOKS = [
  'galatians',
  'romans',
  'corinthians',
  'ephesians',
  'philippians',
  'colossians',
  'thessalonians',
  'timothy',
  'titus',
  'philemon',
  'hebrews',
  'james',
  'peter',
  'john',
  'jude',
  'revelation',
  'matthew',
  'mark',
  'luke',
  'acts',
]

export default function SearchBar({
  onSearch,
  initialBook = 'galatians',
  initialChapter = 1,
}: SearchBarProps) {
  const [book, setBook] = useState(initialBook)
  const [chapter, setChapter] = useState(initialChapter)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(book, Math.max(1, Math.min(150, chapter)))
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-group">
        <label htmlFor="book-select">Book:</label>
        <select
          id="book-select"
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="book-select"
        >
          {BOOKS.map((b) => (
            <option key={b} value={b}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="search-group">
        <label htmlFor="chapter-input">Chapter:</label>
        <input
          id="chapter-input"
          type="number"
          min="1"
          max="150"
          value={chapter}
          onChange={(e) => setChapter(parseInt(e.target.value) || 1)}
          className="chapter-input"
        />
      </div>

      <button type="submit" className="search-button">
        Study
      </button>
    </form>
  )
}
