// Converts the Slack-markdown report text emitted by the n8n AI agent into safe HTML.
// Handles: *bold*, _italic_, hyphen bullet lists, and paragraph breaks.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(line) {
  let s = escapeHtml(line)
  // Bold: *text* (avoid matching * surrounded by spaces)
  s = s.replace(/\*([^*\n]+?)\*/g, '<strong>$1</strong>')
  // Italic: _text_
  s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>')
  return s
}

export function slackMarkdownToHtml(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let inList = false
  let buffer = []

  function flushParagraph() {
    if (buffer.length) {
      out.push('<p>' + buffer.join(' ') + '</p>')
      buffer = []
    }
  }
  function closeList() {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      closeList()
      continue
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      flushParagraph()
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push('<li>' + inlineFormat(line.slice(2).trim()) + '</li>')
    } else {
      closeList()
      buffer.push(inlineFormat(line))
    }
  }
  flushParagraph()
  closeList()
  return out.join('\n')
}
