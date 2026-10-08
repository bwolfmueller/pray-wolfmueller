// Makes the PNG app icons (for phones' home screens) from src/icons/icon.svg.
// Usage: node scripts/make-icons.mjs
import sharp from "sharp";

const svg = "src/icons/icon.svg";
await sharp(svg).resize(192).png().toFile("src/icons/icon-192.png");
await sharp(svg).resize(512).png().toFile("src/icons/icon-512.png");
await sharp(svg).resize(180).flatten({ background: "#9b2318" }).png().toFile("src/icons/apple-touch-icon.png");

// "Maskable" icons get cropped into circles or squircles, so leave a wide margin.
const inner = await sharp(svg).resize(360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#9b2318" } })
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile("src/icons/icon-maskable-512.png");
console.log("Icons written to src/icons/");
