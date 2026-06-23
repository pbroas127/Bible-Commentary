import { useState } from 'react'
import CommentaryAPI from './services/commentary-api'
import CommentaryDisplay from './components/CommentaryDisplay'
import SearchBar from './components/SearchBar'
import './App.css'

export default function App() {
  const [book, setBook] = useState('galatians')
  const [chapter, setChapter] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)

  const handleSearch = async (searchBook: string, searchChapter: number) => {
    setLoading(true)
    setError(null)
    setHtml(null)

    try {
      setBook(searchBook)
      setChapter(searchChapter)

      const commentary = await CommentaryAPI.getCommentary(searchBook, searchChapter)
      const renderedHtml = await CommentaryAPI.renderCommentary(commentary)
      setHtml(renderedHtml)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load commentary'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📖 Bible Commentary Study</h1>
        <p>Deep dive into Scripture with structured commentary</p>
      </header>

      <SearchBar onSearch={handleSearch} initialBook={book} initialChapter={chapter} />

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="loading-box">
          <p>Loading commentary for {book.toUpperCase()} {chapter}...</p>
          <div className="spinner"></div>
        </div>
      )}

      {html && <CommentaryDisplay html={html} book={book} chapter={chapter} />}

      {!html && !loading && !error && (
        <div className="welcome">
          <p>Select a book and chapter to begin your study</p>
        </div>
      )}
    </div>
  )
}
