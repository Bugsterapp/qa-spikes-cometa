import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
// This worker is required to render PDFs in the browser
// We use CDN to avoid ESM module resolution issues in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
