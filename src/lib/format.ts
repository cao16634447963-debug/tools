/** 金额千分位格式化：12345.6 -> "12,345.60" */
export const formatMoney = (v: number | string | null | undefined) =>
  Number(v || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
