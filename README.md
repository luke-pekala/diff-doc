# DiffDoc — Visual Document Diff Viewer

A visual diff tool for comparing two document versions. Drag & drop PDFs, paste text, or load TXT/MD files. See additions highlighted green, deletions in red, with synchronized scrolling and export.

## Features

- **Drag & Drop PDF** — extracts text client-side using pdf.js (no server upload)
- **TXT / MD support** — drop plain text files too
- **Side-by-side view** — synchronized scrolling between panes
- **Inline view** — single pane with both changes merged
- **Diff statistics** — insertions, deletions, similarity %, changed segments
- **HTML export** — download a standalone diff report
- **Client-side only** — nothing leaves the browser

## Tech Stack

- React 18 + Vite
- `diff-match-patch` (Google) — semantic diff algorithm
- `pdfjs-dist` (Mozilla) — PDF text extraction

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & Deploy (Vercel)

```bash
npm run build
```

In Vercel:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** Vite

## Project Structure

```
src/
  components/
    DropZone.jsx        # Input pane with drag-and-drop + PDF loading
    DropZone.module.css
    DiffStats.jsx       # Statistics bar (insertions, deletions, similarity)
    DiffStats.module.css
    InlineView.jsx      # Single-pane inline diff view
    InlineView.module.css
    SideBySide.jsx      # Two-pane view with synchronized scrolling
    SideBySide.module.css
  utils/
    diffEngine.js       # diff-match-patch wrapper + stats + HTML export
    pdfExtract.js       # pdf.js text extraction
  App.jsx               # Main application state and layout
  App.module.css
  index.css             # Global styles + CSS variables
  main.jsx
```

## Notes on PDF Extraction

Works with text-based PDFs (exported from Word, Google Docs, etc.). Scanned PDFs (image-only) will return no text — OCR is not included in this version.

## Portfolio Entry

**DiffDoc | React · diff-match-patch · pdf.js**  
"Visual document diff viewer with inline and side-by-side modes. Features PDF drag-and-drop, synchronized scrolling, change statistics, and HTML export. Demonstrates library integration, useRef, scroll event handling, and the File API in React."
