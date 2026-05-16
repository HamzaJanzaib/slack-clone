import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = process.cwd()
const svgPath = path.join(root, "public", "icons", "icon.svg")
const outDir = path.join(root, "public", "icons")

const sizes = [192, 512]

await mkdir(outDir, { recursive: true })
const svg = await readFile(svgPath)

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}x${size}.png`))
}

console.log("Generated PWA icons:", sizes.map((s) => `${s}x${s}`).join(", "))
