import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
  variant?: "horizontal" | "icon" | "wordmark" | "full";
}

export default function BrandLogo({
  href = "/",
  size = "md",
  className = "",
  showTagline = false,
  variant = "horizontal",
}: BrandLogoProps) {
  const heights = {
    sm: "h-5",
    md: "h-7",
    lg: "h-9",
    xl: "h-11",
  }[size];

  const imageSrc =
    variant === "icon"
      ? "/nannex-icon.png"
      : variant === "wordmark"
      ? "/nannex-wordmark.png"
      : variant === "full"
      ? "/nannex-full.png"
      : "/nannex-horizontal.png";

  const content = (
    <div className={`inline-flex flex-col items-start group select-none ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src={imageSrc}
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
