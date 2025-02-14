"use client"

import { useEffect } from "react"
import { useTechnicianRankingStore } from "@/store/technicianRankingStore"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const TechnicianRanking = () => {
  const { rankingData, loading, error, fetchRanking } = useTechnicianRankingStore()

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  if (loading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!rankingData || rankingData.length === 0) {
    return <div className="text-muted-foreground">No hay datos disponibles.</div>
  }

  const maxValue = Math.max(...rankingData.map((tech) => tech.value))

  return (
    <div className="space-y-4">
      {rankingData.map((tech) => (
        <div key={tech.name} className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${tech.name}`} alt={tech.name} />
            <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{tech.name}</p>
              <span className="text-sm text-muted-foreground">{tech.value} reportes</span>
            </div>
            <Progress value={(tech.value / maxValue) * 100} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TechnicianRanking

