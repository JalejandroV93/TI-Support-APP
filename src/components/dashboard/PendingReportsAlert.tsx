"use client"

import { useSupportReportStore } from "@/store/supportReportStore"
import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PendingReportsAlert = () => {
  const { reports, fetchReports } = useSupportReportStore()

  useEffect(() => {
    fetchReports(1, 1000)
  }, [fetchReports])

  const pendingReports = reports ? reports.filter((report) => !report.fueSolucionado) : []

  if (pendingReports.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay reportes pendientes.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <span className="font-medium">
          Tienes {pendingReports.length} reporte{pendingReports.length !== 1 && "s"} pendiente
          {pendingReports.length !== 1 && "s"}
        </span>
      </div>
      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-4">
          {pendingReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{report.numeroReporte}</Badge>
                <span className="text-sm truncate">{report.descripcion}</span>
              </div>
              <Link href={`/v1/reports/support/${report.id}/viewdetail`} passHref>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default PendingReportsAlert

