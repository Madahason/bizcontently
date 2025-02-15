const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateImages() {
  const publicDir = path.join(process.cwd(), "public");
  const logoPath = path.join(publicDir, "logo.png");

  // Generate favicon.ico (32x32)
  await sharp(logoPath)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("png")
    .toFile(path.join(publicDir, "favicon.ico"));

  console.log("✅ Generated favicon successfully!");
}

generateImages().catch(console.error);
