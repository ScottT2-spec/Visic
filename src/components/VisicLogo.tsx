import Image from "next/image";

interface VisicLogoProps {
  size?: number;
  className?: string;
}

export default function VisicLogo({ size = 36, className = "" }: VisicLogoProps) {
  return (
    <Image
      src="/visic-logo.png"
      alt="Visic"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}

export function VisicLogoIcon({ size = 20, className = "" }: VisicLogoProps) {
  return (
    <Image
      src="/visic-logo.png"
      alt="Visic"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
