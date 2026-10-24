import { render, screen } from '@testing-library/vue'
import MarkdownViewer from './MarkdownViewer.vue'

it('renders bold, italic, paragraphs and lists without raw HTML', () => {
  render(MarkdownViewer, { props: { source: '**tebal** biasa *miring* <b>x</b>\n- satu\n- dua' } })
  expect(screen.getByText('tebal').tagName).toBe('STRONG')
  expect(screen.getByText('miring').tagName).toBe('EM')
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(document.querySelector('b')).toBeNull()
})
