#!/usr/bin/env zx
import "zx/globals"

const compiledCode = "connectToPhotonic.js"
const compiledCodeRename = "index.js"
const requiredFiles = ["node_modules"]
const output = "connectToPhotonic.zip"

await $`rm -rf dist`
await $`pnpm tsc`
await $`cp dist/${compiledCode} ./${compiledCodeRename} && zip -r9 dist/${output} ${compiledCodeRename} ${requiredFiles}; rm ${compiledCodeRename}`

echo(
  JSON.stringify({
    path: `dist/${output}`,
  }),
)
