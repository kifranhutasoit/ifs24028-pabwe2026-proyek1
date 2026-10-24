import { render, screen, fireEvent } from '@testing-library/vue'
import MarkdownEditor from './MarkdownEditor.vue'

it('emits typed text and toolbar snippets and previews them', async () => {
  const { emitted } = render(MarkdownEditor, { props: { id: 'd', label: 'Deskripsi', modelValue: 'a' } })
  await fireEvent.update(screen.getByLabelText('Deskripsi'), 'xyz')
  expect(emitted()['update:modelValue'].at(-1)).toEqual(['xyz'])
  for (const name of ['Tebal', 'Miring', 'Daftar']) await fireEvent.click(screen.getByRole('button', { name }))
  expect(emitted()['update:modelValue'].slice(-3).map((e) => e[0])).toEqual(['a**teks tebal**', 'a*teks miring*', 'a\n- butir'])
  expect(screen.getByRole('region', { name: 'Pratinjau' })).toHaveTextContent('a')
})
