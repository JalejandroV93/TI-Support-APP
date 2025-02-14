import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Clipboard,
  User,
  Calendar,
  LaptopMinimalCheck,
  Tablet,
} from "lucide-react";

export function SkeletonSideBar({ isOpen = true }: { isOpen?: boolean }) {
  const groups = [
    { groupLabel: true, items: 3 },
    { groupLabel: true, items: 4 },
    { groupLabel: false, items: 2 },
  ];

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className=" h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {groups.map((group, groupIndex) => (
            <li
              key={groupIndex}
              className={cn("w-full", group.groupLabel ? "pt-5" : "")}
            >
              {group.groupLabel && (
                <Skeleton
                  className={cn(
                    "h-4 mb-2",
                    isOpen ? "w-[200px]" : "w-10 mx-auto"
                  )}
                />
              )}
              {Array.from({ length: group.items }).map((_, itemIndex) => (
                <div key={itemIndex} className="w-full mb-1">
                  <Skeleton
                    className={cn(
                      "h-10 w-full",
                      isOpen ? "flex items-center" : ""
                    )}
                  >
                    {isOpen && (
                      <>
                        <div className="h-5 w-5 mr-4 rounded bg-muted" />
                        <div className="h-4 w-[150px] rounded bg-muted" />
                      </>
                    )}
                  </Skeleton>
                </div>
              ))}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <Skeleton className="w-full h-10 mt-5" />
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}

export function SkeletonTable() {
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-[250px]" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableHead key={`header-${index}`}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 p-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  );
}

export function MaintenanceReportSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-muted-foreground" />
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Skeleton className="h-4 w-2/3" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <LaptopMinimalCheck className="w-4 h-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-1/3 ml-6" />
                <Skeleton className="h-4 w-1/3 ml-6" />
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function NetworkReportSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-muted-foreground" />
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Skeleton className="h-4 w-2/3" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MobileClassroomsReportSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-muted-foreground" />
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Skeleton className="h-4 w-2/3" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-1/3 ml-6" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SupportReportSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-muted-foreground" />
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Skeleton className="h-4 w-2/3" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AreasLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full col-span-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-40" />
    </div>
  );
}


export function UnifiedReportTableSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-5 w-[80px]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[120px]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[150px]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[100px]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[100px]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-full" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}