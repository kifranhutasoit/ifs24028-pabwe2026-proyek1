import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/productApi.js'

async function run(flag, call) {
  const res = await call()
  flag.value = Boolean(res.success)
  return res
}

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const product = ref(null)
  const isProductAdd = ref(false)
  const isProductChange = ref(false)
  const isProductDelete = ref(false)
  const isBidAdd = ref(false)
  const isBidDelete = ref(false)

  async function loadProducts(filters) {
    const res = await api.getProducts(filters)
    if (res.success) products.value = res.data.products
    return res
  }
  async function loadProduct(id) {
    const res = await api.getProduct(id)
    if (res.success) product.value = res.data.product
    return res
  }
  const addProduct = (body) => run(isProductAdd, () => api.addProduct(body))
  const changeProduct = (id, body) => run(isProductChange, () => api.changeProduct(id, body))
  const changeCover = (id, file) => run(isProductChange, () => api.changeCover(id, file))
  const removeProduct = (id) => run(isProductDelete, () => api.deleteProduct(id))
  const removeBid = (id) => run(isBidDelete, () => api.deleteBid(id))
  const placeBid = (id, body) => run(isBidAdd, () => api.addBid(id, body))

  return {
    products, product, isProductAdd, isProductChange, isProductDelete, isBidAdd, isBidDelete,
    loadProducts, loadProduct, addProduct, changeProduct, changeCover, removeProduct, placeBid, removeBid,
  }
})
