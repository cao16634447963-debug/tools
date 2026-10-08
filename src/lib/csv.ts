/** 将表格数据导出为 CSV 文件（带 BOM，Excel 可直接打开） */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) => {
  // 含逗号/引号/换行的字段需要加引号转义
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? '')
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
