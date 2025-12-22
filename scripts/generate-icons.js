const fs = require('fs');
const path = require('path');

// Créer un PNG simple avec Canvas (si disponible) ou utiliser sharp
async function generateIcon(size, outputPath) {
  try {
    const sharp = require('sharp');

    // Créer un SVG simple avec le logo
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#6366f1"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
        <text x="${size/2}" y="${size/2 + 20}" font-size="${size/4}" text-anchor="middle" fill="#6366f1" font-family="Arial, sans-serif" font-weight="bold">MW</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Created ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error creating ${outputPath}:`, error.message);
    throw error;
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');

  try {
    await generateIcon(192, path.join(publicDir, 'icon-192.png'));
    await generateIcon(512, path.join(publicDir, 'icon-512.png'));
    console.log('✅ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate icons:', error);
    process.exit(1);
  }
}

main();
