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
