const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const indexFile = path.join(distDir, "index.html");
const notFoundFile = path.join(distDir, "404.html");

if (!fs.existsSync(distDir)) {
  console.error("dist directory not found, run build first");
  process.exit(1);
}

try {
  fs.copyFileSync(indexFile, notFoundFile);
  console.log("Copied index.html to 404.html");
} catch (err) {
  console.error("Failed to copy index.html to 404.html:", err);
  process.exit(1);
}
