import type { FinancialReport } from '~/types/stock'

export const useExcelExport = () => {
  async function exportToExcel(
    reports: FinancialReport[],
    stockName: string,
    isFinancial: boolean,
  ) {
    if (!import.meta.client) return

    const XLSX = await import('xlsx')

    const headers = isFinancial
      ? ['年度', '季度', '營業利益率 (%)', '淨利率 (%)', 'EPS (元)']
      : ['年度', '季度', '毛利率 (%)', '營業利益率 (%)', '淨利率 (%)', 'EPS (元)']

    const rows = reports.map(r => {
      const period = r.is_full_year ? '全年' : `Q${r.quarter}`
      if (isFinancial) {
        return [r.year, period, r.operating_margin, r.net_margin, r.eps]
      }
      return [r.year, period, r.gross_margin, r.operating_margin, r.net_margin, r.eps]
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '財報數據')

    XLSX.writeFile(wb, `${stockName}_財報趨勢.xlsx`)
  }

  return { exportToExcel }
}
