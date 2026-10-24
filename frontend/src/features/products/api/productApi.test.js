import * as api from './productApi.js'
import { requestJson } from '../../../helpers/apiHelper.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ requestJson: vi.fn() }))

describe('productApi', () => {
  beforeEach(() => requestJson.mockClear())

  it('builds the list url with and without filters', () => {
    api.getProducts()
    api.getProducts({ is_me: true, is_closed: false })
    expect(requestJson.mock.calls[0][0]).toBe('/products')
    expect(requestJson.mock.calls[1][0]).toBe('/products?is_me=1&is_closed=0')
  })

  it('calls every other endpoint', () => {
    api.getProduct(1); api.addProduct({ a: 1 }); api.changeProduct(1, { a: 2 }); api.changeCover(1, new File(['x'], 'c.png'))
    api.deleteProduct(1); api.deleteProducts(); api.addBid(1, { bid: 5 }); api.deleteBid(1)
    expect(requestJson.mock.calls.map((c) => [c[0], c[1]?.method])).toEqual([
      ['/products/1', undefined], ['/products', 'POST'], ['/products/1', 'PUT'], ['/products/1/cover', 'POST'],
      ['/products/1', 'DELETE'], ['/products', 'DELETE'], ['/products/1/bids', 'POST'], ['/products/1/bids', 'DELETE'],
    ])
    expect(requestJson.mock.calls[3][1].body).toBeInstanceOf(FormData)
  })
})
