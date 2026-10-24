// Parser multipart/form-data minimal: satu atau lebih bagian, mendukung file.
const SIGNATURES = [
  { ext: 'png', test: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', test: (b) => b.length > 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')) },
  { ext: 'webp', test: (b) => b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]

export const detectImageExt = (buffer) => SIGNATURES.find((s) => s.test(buffer))?.ext ?? null

export function parseMultipart(buffer, contentType) {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '')
  if (!boundary) return null
  const delimiter = Buffer.from(`--${boundary[1] ?? boundary[2]}`)
  const parts = {}
  let pos = buffer.indexOf(delimiter)
  while (pos !== -1) {
    const start = pos + delimiter.length
    if (buffer.subarray(start, start + 2).toString() === '--') break
    const next = buffer.indexOf(delimiter, start)
    if (next === -1) break
    const part = buffer.subarray(start + 2, next - 2) // buang CRLF di awal & akhir
    const split = part.indexOf('\r\n\r\n')
    if (split !== -1) {
      const head = part.subarray(0, split).toString('utf8')
      const name = /name="([^"]*)"/i.exec(head)?.[1]
      if (name) parts[name] = { filename: /filename="([^"]*)"/i.exec(head)?.[1], data: part.subarray(split + 4) }
    }
    pos = next
  }
  return parts
}
