interface VisicLogoProps {
  size?: number;
  className?: string;
}

export default function VisicLogo({ size = 36, className = "" }: VisicLogoProps) {
  return (
    <span
      className={`font-bold tracking-tight select-none ${className}`}
      style={{ fontSize: size * 0.7, lineHeight: 1 }}
    >
      Afrostore
    </span>
  );
}

export function VisicLogoIcon({ size = 20, className = "" }: VisicLogoProps) {
  return (
    <span
      className={`font-bold tracking-tight select-none ${className}`}
      style={{ fontSize: size * 0.7, lineHeight: 1 }}
    >
      Afrostore
    </span>
  );
}
