// PDF text extraction using pdf.js loaded from CDN (avoids Vite worker bundling issues)

let pdfjsLibCache = null

function loadPdfJs() {
  if (pdfjsLibCache) return Promise.resolve(pdfjsLibCache)

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window['pdfjs-dist/build/pdf']) {
      pdfjsLibCache = window['pdfjs-dist/build/pdf']
      return resolve(pdfjsLibCache)
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      const lib = window.pdfjsLib
      if (!lib) return reject(new Error('pdfjsLib not found on window'))
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      pdfjsLibCache = lib
      resolve(lib)
    }
    script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'))
    document.head.appendChild(script)
  })
}

export async function extractTextFromPDF(file) {
  const pdfjsLib = await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
    fullText += pageText + '\n\n'
  }

  return fullText.trim()
}
