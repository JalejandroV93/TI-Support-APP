import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <div className="flex flex-row text-xs md:text-sm leading-loose text-muted-foreground text-left">
          © {currentYear}{" "} 
          <Link href="https://liceotallersanmiguel.edu.co">
            <p className="ml-2 text-accent-foreground"> LTSM</p>
          </Link>
          . All rights reserved.
        </div>
      </div>
    </div>
  );
}
