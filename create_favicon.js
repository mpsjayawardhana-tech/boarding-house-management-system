const { Jimp } = require('jimp');

async function createFavicon() {
  try {
    // Load the logo
    const logo = await Jimp.read('./public/pcglogo.png');
    
    // Invert the logo to make it white (assuming it's originally black on transparent)
    logo.invert();
    
    // Determine target size for icon (e.g. 512x512)
    const iconSize = 512;
    
    // Scale logo down so it fits nicely with some padding
    logo.scaleToFit(400, 400);
    
    // Create a new black image
    const bg = new Jimp(iconSize, iconSize, 0x000000FF);
    
    // Calculate position to center the logo
    const x = (iconSize - logo.bitmap.width) / 2;
    const y = (iconSize - logo.bitmap.height) / 2;
    
    // Composite
    bg.composite(logo, x, y);
    
    // Save to app/icon.png
    await bg.writeAsync('./app/icon.png');
    console.log("Favicon created successfully at app/icon.png");
    
  } catch (error) {
    console.error("Error creating favicon:", error);
  }
}

createFavicon();
