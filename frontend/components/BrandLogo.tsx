import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  href = "/",
  size = "md",
  className = "",
  showTagline = false,
}: BrandLogoProps) {
  const heights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-start group select-none ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src="/nannex-horizontal.png"
          alt="nannex"
          width={240}
          height={60}
          className={`${heights} w-auto object-contain shrink-0 group-hover:scale-[1.02] transition-transform duration-300`}
          priority
        />
      </div>
      {showTagline && (
        <span className="text-[10px] tracking-wider text-slate-400 font-medium pl-1 mt-0.5">
          Chat / Meet / Connect
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
