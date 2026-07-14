import Image from "next/image";

interface ProkipLogoProps {
  size?: number;
  className?: string;
}

export default function ProkipLogo({ size = 36, className = "" }: ProkipLogoProps) {
  return (
    <Image
      src="/prokip-logo.png"
      alt="Prokip"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}

export function ProkipLogoIcon({ size = 20, className = "" }: ProkipLogoProps) {
  return (
    <Image
      src="/prokip-logo.png"
      alt="Prokip"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
