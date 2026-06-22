const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'index.html',
  'server.ts',
  'src/App.tsx',
  'src/main.tsx',
  'src/toolsData.ts',
  'src/components/tools/ToolWorkspace.tsx',
  'src/components/payment/PaywallModal.tsx',
  'src/components/admin/AdminPage.tsx',
  'src/components/admin/AdminCRMPage.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'render.yaml',
  'vercel.json',
  'package.json'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace "PDFEasy" with "PDF Eazy"
    content = content.replace(/PDFEasy/g, 'PDF Eazy');
    // Replace "pdfeasy.in" with "pdfeazy.in"
    content = content.replace(/pdfeasy\.in/g, 'pdfeazy.in');
    // Replace "PDF Easy" with "PDF Eazy"
    content = content.replace(/PDF Easy/gi, 'PDF Eazy');
    
    // Some instances like "pdf-easy" or "pdfeasy-"?
    // Let's just fix the main display ones.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
});
