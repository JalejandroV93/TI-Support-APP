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
  subtitle?: string;
  details: ReportCardDetail[];
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "warning" | "success";
  viewDetailHref: string;
  children?: React.ReactNode; // For custom content (like status change)
  className?: string;
}


const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(
    ({ title, date, subtitle, details, badgeText, badgeVariant = "default", viewDetailHref, children, className }, ref) => {
    const id = useId();  // Unique ID for accessibility

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
            {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            {format(new Date(date), "PPP", { locale: es })}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {subtitle && (
            <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
            )}
            <div className="flex flex-col gap-2 text-sm">
            {details.map((detail, index) => (
                <p key={`${id}-detail-${index}`} className="flex items-center gap-2">
                <span className="font-medium">{detail.label}:</span>
                {/* Handle long text with truncation */}
                <span className="break-words">{detail.value}</span>
                </p>
            ))}
            </div>
            {children}  {/* Render any custom children */}
        </CardContent>
        <CardFooter className="flex">
            <Link className="w-full" href={viewDetailHref}>
            <Button
                size="sm"
                variant="secondary"
                className="bg-red-700 text-white hover:bg-zinc-900 w-full"
            >
                <Eye className="w-4 h-4 mr-1" /> Ver
            </Button>
            </Link>
        </CardFooter>
        </Card>
    );
    }
);

ReportCard.displayName = "ReportCard";

export default ReportCard;