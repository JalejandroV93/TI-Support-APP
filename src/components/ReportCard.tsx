// src/components/ReportCard.tsx
"use client"
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clipboard, Calendar, Eye } from "lucide-react";
import { Button } from "./ui/button";
import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface ReportCardDetail {
  label: string;
  value: React.ReactNode;
}

interface ReportCardProps {
  title: string;
  date: string;
  details: ReportCardDetail[];
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "warning" | "success";
  viewDetailHref: string;
  statusChange?: React.ReactNode; // Add this prop for custom status change UI
  className?: string;
  children?: React.ReactNode;
}

// Utility function for badge text formatting
const formatBadgeText = (text: string) => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(
  ({ title, date, details, badgeText, badgeVariant = "default", viewDetailHref, statusChange, className }, ref) => {  //Added statusChange
    const id = useId();

    return (
      <Card
        ref={ref}
        className={cn("transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg", className)}
      >
        <CardHeader>
          <CardTitle className="flex flex-row justify-between gap-2">
            <div className="flex flex-row gap-2 align-middle">
              <Clipboard className="w-5 h-5" />
              {title}
            </div>
            {/* Apply formatting and line-clamp to badge */}
            {badgeText && (
              <Badge variant={badgeVariant} className="line-clamp-1">
                {formatBadgeText(badgeText)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            {format(new Date(date), "PPP", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            {details.map((detail, index) => (
              <p key={`${id}-detail-${index}`} className="flex items-center gap-2">
                <span className="font-medium">{detail.label}:</span>
                <span className="break-words line-clamp-1">{detail.value}</span>
              </p>
            ))}
          </div>
          {/* Add any custom content (like the status changer) here */}
          {statusChange}
        </CardContent>
        <CardFooter className="flex items-center justify-between">  {/* Added justify-between */}
          <Link className="w-full" href={viewDetailHref}>
            <Button
              size="sm"
              variant="secondary"
              className="bg-red-700 text-white hover:bg-zinc-900 w-full"
            >
              <Eye className="w-4 h-4 mr-1" /> Ver
            </Button>
          </Link>
          {statusChange} {/* Render status change UI here */}
        </CardFooter>
      </Card>
    );
  }
);

ReportCard.displayName = "ReportCard";

export default ReportCard;