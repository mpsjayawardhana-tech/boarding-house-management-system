const fs = require('fs');

function checkJSXBraces(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let openDivs = 0;
  let openBraces = 0;
  
  lines.forEach((line, index) => {
    const divOpens = (line.match(/<div/g) || []).length;
    const divCloses = (line.match(/<\/div>/g) || []).length;
    openDivs += divOpens - divCloses;
    
    const braceOpens = (line.match(/\{/g) || []).length;
    const braceCloses = (line.match(/\}/g) || []).length;
    openBraces += braceOpens - braceCloses;
    
    if (openDivs < 0) {
      console.log(`Line ${index + 1}: Unmatched </div>`);
      openDivs = 0;
    }
  });
  
  console.log(`Final open divs: ${openDivs}`);
  console.log(`Final open braces: ${openBraces}`);
}

checkJSXBraces('app/finance/page.tsx');
