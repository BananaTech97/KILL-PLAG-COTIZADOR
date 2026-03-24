const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// Find the base64 string
const match = code.match(/const logoBase64 = "data:image\/png;base64,[^"]+";/);
if (match) {
  // Remove the old one including the comment before it
  code = code.replace(/    \/\/ 6\. Agregamos logo\n    const logoBase64 = "data:image\/png;base64,[^"]+";/, '');
  
  // Insert at the top of CotizadorExpress
  code = code.replace('const CotizadorExpress = () => {', 'const CotizadorExpress = () => {\n  ' + match[0]);
  
  // Replace the image src
  code = code.replace(/src="\/c:\/Users\/thoma\/OneDrive\/Desktop\/KILL PLAG Cotizaciones\/public\/logo png 1\.png"/, 'src={logoBase64}');
  code = code.replace(/src="\/logo png 1\.png"/, 'src={logoBase64}'); // in case it was already replaced

  fs.writeFileSync('src/App.jsx', code);
  console.log('Fixed src/App.jsx scope');
} else {
  console.log('Could not find base64 string');
}
