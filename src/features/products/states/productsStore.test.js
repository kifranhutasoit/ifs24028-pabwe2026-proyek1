import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from './productsStore.js'
import * as api from '../api/productApi.js'

vi.mock('../api/productApi.js')

describe('productsStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('loads list and detail, ignoring failures', async () => {
    const s = useProductsStore()
    api.getProducts.mockResolvedValueOnce({ success: true, data: { products: [1] } }).mockResolvedValueOnce({ success: false })
    await s.loadProducts({}); await s.loadProducts({})
    expect(s.products).toEqual([1])
    api.getProduct.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: { product: { id: 2 } } })
    await s.loadProduct(2)
    expect(s.product).toBeNull()
    await s.loadProduct(2)
    expect(s.product).toEqual({ id: 2 })
  })

  it('tracks mutation flags', async () => {
    const s = useProductsStore()
    api.addProduct.mockResolvedValue({ success: true })
    api.changeProduct.mockResolvedValue({ success: true })
    api.changeCover.mockResolvedValue({ success: true })
    api.deleteProduct.mockResolvedValue({ success: false })
    api.addBid.mockResolvedValue({ success: true })
    api.deleteBid.mockResolvedValue({ success: true })
    await s.addProduct({}); await s.changeProduct(1, {}); await s.changeCover(1, {}); await s.removeProduct(1); await s.placeBid(1, {}); await s.removeBid(1)
    expect([s.isProductAdd, s.isProductChange, s.isProductDelete, s.isBidAdd, s.isBidDelete]).toEqual([true, true, false, true, true])
  })
})
