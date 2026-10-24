import { useInput } from './useInput.js'

describe('useInput', () => {
  it('defaults to empty string, updates and resets', () => {
    const { value, onInput, reset } = useInput()
    expect(value.value).toBe('')
    onInput({ target: { value: 'hi' } })
    expect(value.value).toBe('hi')
    reset()
    expect(value.value).toBe('')
  })

  it('uses given initial value', () => {
    expect(useInput('x').value.value).toBe('x')
  })
})
