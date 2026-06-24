import React from "react";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: () => JSX.Element;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-trust-my-pdf",
    title: "Welcome to Trust My PDF",
    date: "June 24, 2026",
    readTime: "2 min read",
    excerpt: "Why we built the ultimate, lightning-fast PDF utility suite and what it means for your document workflow.",
    content: () => (
      <div className="space-y-6">
        <p>
          Welcome to <strong>Trust My PDF</strong>! We are incredibly excited to launch a brand new utility suite designed from the ground up to solve the most frustrating document management problems.
        </p>
        <h3 className="text-xl font-bold text-neutral-900 mt-8 mb-4">Why another PDF tool?</h3>
        <p>
          We realized that while there are many PDF tools on the internet, most of them are heavily cluttered with ads, painfully slow, or extremely expensive. We wanted to build something that was blindingly fast, respected your privacy, and offered a beautifully clean interface.
        </p>
        <p>
          With our extensive 12-tool workspace, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Merge & Split:</strong> Reorganize massive documents instantly.</li>
          <li><strong>Compress:</strong> Shrink file sizes dramatically without losing visual quality.</li>
          <li><strong>Protect & Unlock:</strong> Secure your sensitive data or remove annoying legacy passwords.</li>
          <li><strong>Edit & Sign:</strong> Make native modifications directly in the browser.</li>
        </ul>
        <h3 className="text-xl font-bold text-neutral-900 mt-8 mb-4">What's Next?</h3>
        <p>
          We'll be using this blog to share in-depth guides, step-by-step tutorials (like how to remove passwords from bank statements), and updates on new features. Stay tuned!
        </p>
      </div>
    ),
  },
  {
    slug: "how-to-merge-pdf-files-for-free",
    title: "How to Merge PDF Files for Free Without Uploading to the Cloud",
    date: "June 25, 2026",
    readTime: "3 min read",
    excerpt: "Learn how to securely combine multiple PDF documents into a single file directly in your browser.",
    content: () => (
      <div className="space-y-6">
        <p>
          Whether you are combining tax documents, compiling a portfolio, or organizing school notes, merging PDF files is one of the most common document tasks. However, almost every free PDF merger online has a massive hidden catch: <strong>they require you to upload your sensitive files to their cloud servers.</strong>
        </p>
        <p>
          If you are working with bank statements, legal contracts, or personal records, uploading them to a random third-party server is a massive security risk.
        </p>

        <h3 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">The Solution: Client-Side Merging</h3>
        <p>
          This is exactly why we built the <strong>Trust My PDF Merger</strong>. Instead of sending your files to our servers, our tool downloads the merging engine directly into your browser. This means your files <strong>never leave your computer</strong>. It is 100% private, completely free, and works instantly even if you disconnect from the internet after loading the page.
        </p>

        <h3 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">How to Merge Your PDFs in 3 Steps</h3>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Select Your Files:</strong> Open our <a href="/" className="font-bold underline">Merge PDF tool</a> and drag-and-drop all the PDF files you want to combine into the workspace.
          </li>
          <li>
            <strong>Reorder the Pages:</strong> You will see a visual preview of every single page. You can drag the files around to change their order, or even delete specific pages you don't need in the final document.
          </li>
          <li>
            <strong>Click Merge:</strong> Hit the "Merge" button. Because the processing happens locally on your machine, it takes milliseconds. Your new, combined PDF will instantly download to your device.
          </li>
        </ol>

        <h3 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">No Limits, No Watermarks</h3>
        <p>
          Unlike other free tools that lock you out after 2 files or stamp a giant watermark on your document, Trust My PDF provides a completely clean experience. Go ahead and try it out yourself!
        </p>
      </div>
    ),
  }
];
