// ============================================
// usePrint - 打印功能 Composables
// Company OA ERP - Core Business Module
// ============================================

/**
 * 打印/导出 PDF 通用 Composable
 * 基于 window.print() + @media print CSS
 */
export function usePrint() {
  function doPrint() {
    window.print()
  }

  /**
   * 以 iframe 方式静默打印指定 HTML 内容（高级用法）
   */
  function printContent(html: string, title = '打印') {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow!.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head><title>${title}</title></head>
        <body>${html}</body>
      </html>
    `)
    doc.close()

    iframe.contentWindow!.focus()
    iframe.contentWindow!.print()

    // 打印完成后移除 iframe
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }

  return { doPrint, printContent }
}
