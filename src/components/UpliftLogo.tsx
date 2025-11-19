import { Link } from "react-router-dom";

interface UpliftLogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const UpliftLogo = ({ to = "/", className = "", size = "md", showText = true }: UpliftLogoProps) => {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-lg" },
    md: { icon: "h-8 w-8", text: "text-2xl" },
    lg: { icon: "h-12 w-12", text: "text-4xl" }
  };

  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px currentColor); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 8px currentColor); }
        }
        @keyframes slow-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .logo-rays {
          animation: slow-rotate 20s linear infinite;
          transform-origin: 50px 50px;
        }
        .logo-sun {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Logo Icon - Rising sun with upward arrow */}
      <svg
        className={sizes[size].icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sun rays with rotation animation */}
        <g className="logo-rays">
          <path
            d="M50 20L50 5M35 25L25 15M65 25L75 15M50 80L50 95M35 75L25 85M65 75L75 85"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary"
          />
        </g>
        
        {/* Rising sun circle with pulse animation */}
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="currentColor"
          className="text-primary logo-sun"
        />
        
        {/* Upward arrow integrated in the center */}
        <path
          d="M50 42V58M50 42L44 48M50 42L56 48"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Arc below representing horizon/community */}
        <path
          d="M20 60Q35 55 50 55Q65 55 80 60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-secondary"
        />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`font-display font-bold ${sizes[size].text} bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
          Uplift
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="hover:opacity-80 transition-opacity">
        {logo}
      </Link>
    );
  }

  return logo;
};

export default UpliftLogo;
