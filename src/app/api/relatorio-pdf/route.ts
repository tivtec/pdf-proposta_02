import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import chromium from '@sparticuz/chromium'
import path from 'node:path'
import fs from 'node:fs'
import puppeteerCore from 'puppeteer-core'
export const runtime = 'nodejs'

async function launchBrowser() {
  const isVercel = Boolean(process.env.VERCEL)
  if (isVercel) {
    const autoPath: string = await (chromium as any).executablePath()
    const fallbackPath = path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium', 'bin', 'chromium')
    const usePath = fs.existsSync(autoPath) ? autoPath : fallbackPath
    return puppeteerCore.launch({
      args: (chromium as any).args,
      executablePath: usePath,
      headless: true,
    })
  }
  const puppeteer = (await import('puppeteer')).default
  return puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
}

export async function GET(req: NextRequest) {
  const host = headers().get('host') || 'localhost:3000'
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  const protocol = isLocal ? 'http' : 'https'
  const query = req.nextUrl.searchParams.toString()
  const targetUrl = `${protocol}://${host}/relatorio${query ? `?${query}` : ''}`

  try {
    const browser = await launchBrowser()
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(30000)
    await page.emulateMediaType('screen')
    await page.goto(targetUrl, { waitUntil: 'load' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    const ab = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength)
    return new Response(ab as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'PDF generation failed'
    return new Response(JSON.stringify({ error: msg, url: targetUrl }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }
}