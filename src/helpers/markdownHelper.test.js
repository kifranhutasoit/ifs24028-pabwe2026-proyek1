import { parseInline, parseMarkdown } from './markdownHelper.js'

describe('markdownHelper', () => {
  it('parses bold, italic and plain text', () => {
    expect(parseInline('a **b** *c*')).toEqual([
      { text: 'a ' }, { text: 'b', bold: true }, { text: ' ' }, { text: 'c', italic: true },
    ])
  })

  it('returns no blocks for empty input', () => {
    expect(parseMarkdown()).toEqual([])
  })

  it('starts a list when it is the first block', () => {
    expect(parseMarkdown('- a')).toEqual([{ type: 'ul', items: [[{ text: 'a' }]] }])
  })

  it('groups list items, skips blank lines and keeps paragraphs', () => {
    const blocks = parseMarkdown('intro\n- a\n- b\n\nakhir')
    expect(blocks.map((b) => b.type)).toEqual(['p', 'ul', 'p'])
    expect(blocks[1].items).toHaveLength(2)
  })
})
