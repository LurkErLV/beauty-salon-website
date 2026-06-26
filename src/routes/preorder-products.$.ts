import { createFileRoute } from '@tanstack/react-router'
import { readFile, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

export const Route = createFileRoute('/preorder-products/$')({
  server: {
    handlers: {
      GET: async ({ request }) => serveProductImage(request),
      HEAD: async ({ request }) => serveProductImage(request, true),
    },
  },
})

async function serveProductImage(request: Request, headOnly = false) {
  const filename = getSafeFilename(request)

  if (!filename) {
    return new Response('Not found', { status: 404 })
  }

  for (const dir of getProductImageDirs()) {
    const filePath = join(dir, filename)

    try {
      const fileStat = await stat(filePath)

      if (!fileStat.isFile()) {
        continue
      }

      const headers = new Headers({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(fileStat.size),
        'Content-Type': getContentType(filename),
      })

      if (headOnly) {
        return new Response(null, { headers })
      }

      return new Response(await readFile(filePath), { headers })
    } catch {
      continue
    }
  }

  return new Response('Not found', { status: 404 })
}

function getSafeFilename(request: Request) {
  const pathname = new URL(request.url).pathname
  const prefix = '/preorder-products/'

  if (!pathname.startsWith(prefix)) {
    return ''
  }

  const rawFilename = decodeURIComponent(pathname.slice(prefix.length))
  const filename = basename(rawFilename)

  if (filename !== rawFilename || !/^[\w.-]+$/.test(filename)) {
    return ''
  }

  return filename
}

function getProductImageDirs() {
  const cwd = process.cwd()

  return [
    join(cwd, 'public', 'preorder-products'),
    join(cwd, '.output', 'public', 'preorder-products'),
  ]
}

function getContentType(filename: string) {
  switch (extname(filename).toLowerCase()) {
    case '.avif':
      return 'image/avif'
    case '.gif':
      return 'image/gif'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.svg':
      return 'image/svg+xml'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}
