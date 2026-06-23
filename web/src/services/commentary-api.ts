import { ChapterCommentary, generateCommentaryHTML } from '@bible-commentary/skill'

class CommentaryAPI {
  private apiUrl: string

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7071'
  }

  /**
   * Fetch commentary JSON from API
   */
  async getCommentary(book: string, chapter: number): Promise<ChapterCommentary> {
    const response = await fetch(
      `${this.apiUrl}/api/commentary/${book}/${chapter}`
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch commentary: ${response.status} ${response.statusText}`
      )
    }

    const data: ChapterCommentary = await response.json()
    return data
  }

  /**
   * Render commentary JSON to HTML using client-side library
   */
  async renderCommentary(commentary: ChapterCommentary): Promise<string> {
    try {
      const html = generateCommentaryHTML(commentary)
      return html
    } catch (error) {
      throw new Error(
        `Failed to render commentary: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Combined: fetch + render
   */
  async loadCommentary(
    book: string,
    chapter: number
  ): Promise<string> {
    const commentary = await this.getCommentary(book, chapter)
    const html = await this.renderCommentary(commentary)
    return html
  }
}

export default new CommentaryAPI()
