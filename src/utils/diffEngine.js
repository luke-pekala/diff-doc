import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

// Returns array of [operation, text] tuples
// operation: -1 = delete, 0 = equal, 1 = insert
export function computeDiff(original, revised) {
  const diffs = dmp.diff_main(original, revised)
  dmp.diff_cleanupSemantic(diffs)
  return diffs
}

// Render inline diff as array of annotated segments
export function renderInlineDiff(diffs) {
  return diffs.map(([op, text]) => ({
    op,
    text,
    type: op === 1 ? 'ins' : op === -1 ? 'del' : 'eq'
  }))
}

// Render left pane (original): show deletions, hide insertions
// Each changed segment carries its global index from the full diff
export function renderLeftPane(diffs) {
  const result = []
  let changeIndex = 0
  for (const [op, text] of diffs) {
    if (op === 1) { changeIndex++; continue } // insertion: skip in left pane but still count
    if (op === -1) {
      result.push({ op, text, type: 'del', changeIndex: changeIndex++ })
    } else {
      result.push({ op, text, type: 'eq' })
    }
  }
  return result
}

// Render right pane (revised): show insertions, hide deletions
// Each changed segment carries its global index from the full diff
export function renderRightPane(diffs) {
  const result = []
  let changeIndex = 0
  for (const [op, text] of diffs) {
    if (op === -1) { changeIndex++; continue } // deletion: skip in right pane but still count
    if (op === 1) {
      result.push({ op, text, type: 'ins', changeIndex: changeIndex++ })
    } else {
      result.push({ op, text, type: 'eq' })
    }
  }
  return result
}

// Calculate diff statistics
export function computeStats(diffs) {
  let insertedChars = 0
  let deletedChars = 0
  let insertedLines = 0
  let deletedLines = 0

  for (const [op, text] of diffs) {
    if (op === 1) {
      insertedChars += text.length
      insertedLines += (text.match(/\n/g) || []).length + (text.length > 0 ? 1 : 0)
    } else if (op === -1) {
      deletedChars += text.length
      deletedLines += (text.match(/\n/g) || []).length + (text.length > 0 ? 1 : 0)
    }
  }

  const totalOriginal = diffs
    .filter(([op]) => op !== 1)
    .reduce((sum, [, text]) => sum + text.length, 0)

  const totalRevised = diffs
    .filter(([op]) => op !== -1)
    .reduce((sum, [, text]) => sum + text.length, 0)

  const equalChars = diffs
    .filter(([op]) => op === 0)
    .reduce((sum, [, text]) => sum + text.length, 0)

  const maxLen = Math.max(totalOriginal, totalRevised)
  const similarity = maxLen === 0 ? 100 : Math.round((equalChars / maxLen) * 100)

  return {
    insertedChars,
    deletedChars,
    insertedLines,
    deletedLines,
    similarity,
    changedSegments: diffs.filter(([op]) => op !== 0).length
  }
}

// Export diff as standalone HTML
export function exportDiffHTML(diffs, leftLabel, rightLabel) {
  const inlineSegments = renderInlineDiff(diffs)
  const stats = computeStats(diffs)

  const segmentHTML = inlineSegments.map(({ type, text }) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    if (type === 'ins') return `<span class="ins">${escaped}</span>`
    if (type === 'del') return `<span class="del">${escaped}</span>`
    return escaped
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>DiffDoc Export</title>
<style>
  body { background: #0c0d0f; color: #e2e8f0; font-family: 'Courier New', monospace; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-family: sans-serif; font-size: 28px; margin-bottom: 8px; color: #e8b84b; }
  .meta { color: #5a6070; font-size: 12px; margin-bottom: 24px; }
  .stats { display: flex; gap: 24px; margin-bottom: 32px; padding: 16px; background: #1a1d23; border-radius: 4px; }
  .stat { display: flex; flex-direction: column; gap: 4px; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #5a6070; }
  .stat-val { font-size: 20px; font-weight: bold; }
  .diff-body { white-space: pre-wrap; line-height: 1.8; font-size: 13px; background: #131518; padding: 24px; border-radius: 4px; }
  .ins { background: #1a3a2a; color: #4ade80; text-decoration: underline; }
  .del { background: #3a1a1a; color: #f87171; text-decoration: line-through; }
</style>
</head>
<body>
<h1>DiffDoc — Diff Report</h1>
<div class="meta">Comparing: <strong>${leftLabel}</strong> → <strong>${rightLabel}</strong> · Generated ${new Date().toLocaleString()}</div>
<div class="stats">
  <div class="stat"><span class="stat-label">Insertions</span><span class="stat-val" style="color:#4ade80">+${stats.insertedChars}</span></div>
  <div class="stat"><span class="stat-label">Deletions</span><span class="stat-val" style="color:#f87171">-${stats.deletedChars}</span></div>
  <div class="stat"><span class="stat-label">Similarity</span><span class="stat-val" style="color:#e8b84b">${stats.similarity}%</span></div>
  <div class="stat"><span class="stat-label">Changed Segments</span><span class="stat-val" style="color:#9aa3b2">${stats.changedSegments}</span></div>
</div>
<div class="diff-body">${segmentHTML}</div>
</body>
</html>`
}
