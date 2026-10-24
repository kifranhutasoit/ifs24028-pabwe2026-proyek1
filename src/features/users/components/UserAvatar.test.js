import { render } from '@testing-library/vue'
import UserAvatar from './UserAvatar.vue'

describe('UserAvatar', () => {
  it('shows the resolved photo', () => {
    const { container } = render(UserAvatar, { props: { name: 'sari', photo: 'img/p.png', size: 'lg' } })
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://open-api.delcom.org/img/p.png')
  })
  it('falls back to the initial', () => {
    const { container } = render(UserAvatar, { props: { name: 'sari' } })
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('S')
  })
})
