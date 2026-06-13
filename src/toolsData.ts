/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolDefinition } from "./types";

export const TOOLS: ToolDefinition[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF documents into a single professional file instantly.",
    iconName: "FileStack",
    steps: [
      { title: "Upload Files", desc: "Select and drag multiple PDF files into our workspace dropzone." },
      { title: "Arrange Order", desc: "Drag and drop to rearrange files in the exact sequence you want them." },
      { title: "Download Merged PDF", desc: "Click compile and download your combined document instantly with no quality loss." }
    ],
    faqs: [
      { q: "Is there a limit on how many files I can merge?", a: "No, you can combine multiple files seamlessly for standard production layouts." },
      { q: "Does merging PDFs compromise document security?", a: "No. Your documents are processed directly to maintain formatting and security standard controls." },
      { q: "Will the merged file retain original table formatting and links?", a: "Yes, pdf-lib merges the files at the binary level, preserving all links, formatting, fonts, and annotations." }
    ],
    seoText: "Combine multiple files into one PDF seamlessly with our modern Merge PDF tool. Specially designed for students, legal professionals, and remote managers who value speed. Optimized for rapid workflow execution."
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Extract specific individual pages or split sections from your PDF file within seconds.",
    iconName: "Scissors",
    steps: [
      { title: "Upload PDF", desc: "Choose the target document you need to extract pages from." },
      { title: "Specify Pages", desc: "Input page numbers/ranges (e.g., 1-3, 5) or click on pages to extract." },
      { title: "Export Sections", desc: "Download the instantly created new PDF containing only your selected pages." }
    ],
    faqs: [
      { q: "How do I specify which pages to extract?", a: "You can enter standard ranges like '1-3, 5' or select pages visually. The engine will instantly parse and extract those." },
      { q: "Is split PDF quality as high as the original?", a: "Yes. It extracts original layout schemas without re-compressing individual objects, maintaining pristine professional quality." },
      { q: "Does the utility platform store a copy of my split files?", a: "Absolutely not. The splitting is processed on demand securely to maintain standard isolation." }
    ],
    seoText: "Extract pages from your PDF files with high-precision splitting. Ideal for sending single reports, distributing specific chapters of ebooks, or extracting customized layouts for simple sharing."
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Convert sequences of JPG, JPEG, and PNG images into a clean single PDF file.",
    iconName: "ImageInline",
    steps: [
      { title: "Upload Gallery", desc: "Select or drop image sequence files (JPG/PNG) into the staging box." },
      { title: "Arrange and Format", desc: "Verify image order and orientations before compilation." },
      { title: "Convert & Save", desc: "Run image placement rendering and download the bundled PDF." }
    ],
    faqs: [
      { q: "Can I combine different image formats?", a: "Yes, you can upload a mix of JPG, JPEG, and PNG files together to bundle into a single consolidated PDF." },
      { q: "Are my images compressed during PDF generation?", a: "The tool embeds the original images as PDF pages matching their native size and resolution to avoid rendering artifacts." },
      { q: "Does the PDF generation happen on the remote server?", a: "No. It uses your browser's optimized HTML5 canvas to load and process images, assuring standard swift outputs." }
    ],
    seoText: "Convert JPG and PNG images into a PDF quickly on any device. Excellent for compilation of photographic receipts, receipts tracking, physical document scans, and project presentation pages."
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Render and extract PDF pages into high-precision individual JPG images.",
    iconName: "FileImage",
    steps: [
      { title: "Upload Document", desc: "Drop your PDF file into the browser workspace." },
      { title: "Set Resolution", desc: "Choose optimal resolution for individual pages extraction." },
      { title: "Save Image Package", desc: "Initiate local canvas rendering and download a zip or list of image files." }
    ],
    faqs: [
      { q: "How are the images exported?", a: "Each PDF page is converted into a high-quality JPEG and offered for direct download inline in your browser." },
      { q: "What is the maximum file size supported?", a: "Standard file size limits up to 150MB are supported for swift execution." },
      { q: "Does this require any installation or registration?", a: "No. This tool is completely online and processes everything without complex installs." }
    ],
    seoText: "Convert PDF pages to JPG images in seconds. Render each vector layout flat into individual graphics, which are perfect for social shares, web content embedding, or offline graphic editing."
  },
  {
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    description: "Visually select, search, and remove unneeded pages from any PDF document.",
    iconName: "Trash2",
    steps: [
      { title: "Drop PDF", desc: "Select and preview your document structure cleanly in the canvas." },
      { title: "Toggle Pages", desc: "Click on pages you wish to delete to mark them for removal." },
      { title: "Apply & Export", desc: "Regenerate the filtered document and download the cleaned version." }
    ],
    faqs: [
      { q: "Can I undo selecting pages for deletion?", a: "Yes! Simply click the page thumbnail again to unmark it before exporting." },
      { q: "How many pages can I delete at once?", a: "As many as you want, provided you leave at least one page so a valid PDF can still be saved." },
      { q: "Does deleting pages reduce file size?", a: "Yes, the file size will shrink proportionally to the removed pages and their associated visual elements." }
    ],
    seoText: "Quickly delete pages from PDF files with our convenient interactive preview panel. Clean up draft comments, hide internal documents before sharing, or cull redundant blank indices instantly."
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF Pages",
    description: "Orient individual pages or the entire document by 90, 180, or 270 degrees.",
    iconName: "Undo",
    steps: [
      { title: "Add Pages", desc: "Load the skewed PDF documents into the workspace." },
      { title: "Rotate Controls", desc: "Click the rotate action buttons to spin individual pages or all pages at once." },
      { title: "Save Setup", desc: "Apply rotation attributes locally and secure the perfect visual orientation." }
    ],
    faqs: [
      { q: "Can I rotate only horizontal landscape pages?", a: "Yes. You can rotate individual page thumbnails selectively or process the entire document at once." },
      { q: "Will the rotation change the original quality?", a: "No. The orientation metadata angle itself is updated at root binary layers without rasterizing contents." },
      { q: "Can I rotate pages multiple times?", a: "Yes. Each rotation click shifts the page 90 degrees clockwise. You can repeat to reach 180, 270, or 360 degrees." }
    ],
    seoText: "Straighten up scanned documents, sideways templates, and mismatched orientation receipts in your browser with our smart metadata transformation tool. Perfect alignment, zero delay."
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Optimize and compress PDF document size with smart scaling presets.",
    iconName: "Minimize2",
    steps: [
      { title: "Select PDF", desc: "Select high-disk-space PDFs to undergo optimization." },
      { title: "Choose Preset", desc: "Choose from extreme compression (low quality) or balanced compression (high quality)." },
      { title: "Optimized File", desc: "Witness instant disk-savings report and download the optimized smaller file." }
    ],
    faqs: [
      { q: "How does compression work locally?", a: "The optimizer targets unnecessary metadata streams, redundant fonts, and embeds smart asset structures to shrink sizes." },
      { q: "Will my images inside the PDF retain legibility?", a: "Yes, our balanced compression preset preserves text contrast and image outlines so they remain highly readable." },
      { q: "Are files uploaded to servers for processing?", a: "No, compression is carried out automatically using optimized rendering presets." }
    ],
    seoText: "Shrink high-density file footprints instantly using smart compression algorithms. Perfect for email attachments, online forms uploads, and archive indexing."
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    description: "Secure and encrypt your PDF document using custom passwords.",
    iconName: "Shield",
    steps: [
      { title: "Load Document", desc: "Select the document you wish to safeguard." },
      { title: "Specify Password", desc: "Enter a robust string password to lock your file." },
      { title: "Generate Secure PDF", desc: "Download the fully encrypted password-locked standard file format." }
    ],
    faqs: [
      { q: "What standard of encryption is used?", a: "The browser library configures native PDF Standard Encryption parameters so standard readers (Chrome, Adobe) prompt for the password." },
      { q: "Are passwords transmitted over the network?", a: "No. The secure encryption properties apply directly onto your file." },
      { q: "Can you recover my password if I lose it?", a: "Since we do not store passkeys, we cannot recover passwords. Please store them carefully!" }
    ],
    seoText: "Apply solid custom password encryption properties onto your PDF reports directly from your browser. Ideal for legal, corporate, and official financial statements."
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF / Remove Password",
    description: "Remove passwords, restriction blocks, and encryption protections from PDF files permanently.",
    iconName: "Lock",
    steps: [
      { title: "Select Protected PDF", desc: "Select the password-secured PDF file you wish to unlock." },
      { title: "Input Password", desc: "Provide the active password to authorize decoding of the document." },
      { title: "Download Decrypted", desc: "Export and save a cleanly decrypted PDF version with no locks." }
    ],
    faqs: [
      { q: "Can I unlock a PDF if I do not know the password?", a: "To respect privacy and security guidelines, you must enter the password once so our local decryptor can securely strip the security elements." },
      { q: "Is the unlocked file fully unencrypted?", a: "Yes. Once processed, all security restrictions are stripped. Anyone can open, view, or print the PDF without any password prompts." },
      { q: "Does PDF Easy keep my password?", a: "No. The password is only used in your local browser memory space to decrypt the file, and is never logged, kept, or transmitted." }
    ],
    seoText: "Decrypt and strip restrictive passwords or access blocks from your PDF documents instantly. Perfect for unlocking statements and records for easy sharing."
  }
];
