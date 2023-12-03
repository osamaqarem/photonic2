#!/usr/bin/env zx
import "zx/globals"

const compiledCode = "connectToPhotonic.js"
const requiredFiles = ["node_modules", "package.json"]
const output = "connectToPhotonic.zip"

await $`yarn tsc`
await $`cp dist/${compiledCode} ./${compiledCode} && zip -r9 dist/${output} ${compiledCode} ${requiredFiles}; rm ${compiledCode}`

echo(
  JSON.stringify({
    path: `dist/${output}`,
  }),
)
