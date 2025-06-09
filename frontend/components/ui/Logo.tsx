import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { width: 120, height: 43 },
  md: { width: 160, height: 58 },
  lg: { width: 200, height: 72 },
  xl: { width: 320, height: 115 }
};

export default function Logo({ 
  size = 'md', 
  href = '/',
  className = '' 
}: LogoProps) {
  const dimensions = sizeMap[size];
  
  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/ChargeCars portal svg dark mode (1).svg"
        alt="ChargeCars Portal"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="h-auto w-auto"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <a className="inline-block transition-opacity hover:opacity-80" title="ChargeCars Portal - Dashboard">
          {logoElement}
        </a>
      </Link>
    );
  }

  return logoElement;
} 