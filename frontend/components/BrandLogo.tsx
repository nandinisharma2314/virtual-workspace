import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showTagline?: boolean;
  variant?: "horizontal" | "icon" | "wordmark" | "full";
  priority?: boolean;
}

export default function BrandLogo({
  href = "/",
  size = "md",
  className = "",
  showTagline = false,
  variant = "horizontal",
  priority = true,
}: BrandLogoProps) {
  const heights = {
    xs: "h-5",
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-12",
    "2xl": "h-16",
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
    <div className={`inline-flex flex-col items-start group/brand select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        <Image
          src={imageSrc}
          alt="nannex — Chat / Meet / Connect"
          width={280}
          height={70}
          className={`${heights} w-auto object-contain shrink-0 group-hover/brand:scale-[1.02] transition-transform duration-300 drop-shadow-sm`}
          priority={priority}
        />
      </div>
      {showTagline && variant !== "full" && (
        <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase pl-1 mt-1">
          Chat · Meet · Connect
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

