export function parseInline(line) {
  return line
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => {
      const bold = /^\*\*([^*]+)\*\*$/.exec(part)
      if (bold) return { text: bold[1], bold: true }
      const italic = /^\*([^*]+)\*$/.exec(part)
      if (italic) return { text: italic[1], italic: true }
      return { text: part }
    })
}

export function parseMarkdown(source = '') {
  const blocks = []
  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const item = /^[-*] (.+)$/.exec(line)
    const last = blocks.at(-1)
    if (!item) blocks.push({ type: 'p', items: [parseInline(line)] })
    else if (last?.type === 'ul') last.items.push(parseInline(item[1]))
    else blocks.push({ type: 'ul', items: [parseInline(item[1])] })
  }
  return blocks
}
