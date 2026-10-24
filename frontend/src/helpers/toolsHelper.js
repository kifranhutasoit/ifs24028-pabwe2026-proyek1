import Swal from 'sweetalert2'

const API_ORIGIN = 'https://open-api.delcom.org'

export const showSuccessDialog = (msg) => Swal.fire({ icon: 'success', title: 'Berhasil', text: msg })
export const showErrorDialog = (msg) => Swal.fire({ icon: 'error', title: 'Gagal', text: msg })
export const showConfirmDialog = async (msg) => {
  const result = await Swal.fire({
    icon: 'question', title: 'Konfirmasi', text: msg,
    showCancelButton: true, confirmButtonText: 'Ya', cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}

export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(amount).replaceAll('\u00a0', ' ')

export const formatDate = (dateString) =>
  new Date(dateString.replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export const toApiTimestamp = (value) => `${value.replace('T', ' ')}:00`
export const toInputTimestamp = (value) => value.slice(0, 16).replace(' ', 'T')

export const photoUrl = (photo) => {
  if (!photo) return ''
  if (/^https?:\/\//.test(photo)) return photo
  return `${API_ORIGIN}/${photo}`
}

export const isClosedAt = (value) => new Date(value.replace(' ', 'T')) <= new Date()