import React from "react";
import { Heart } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

        {/* Icons */}
        <div className="relative flex items-center justify-center">
          <div className="relative">
            <Heart className={`${iconSizeClasses[size]} text-white fill-white`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2.5 h-2.5" : size === "lg" ? "w-4 h-4" : "w-5 h-5"} bg-purple-600 rounded-full`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1
            className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent`}
          >
            Co-Parents
          </h1>
          {size !== "sm" && (
            <p className="text-xs text-purple-500 -mt-1 font-medium">Familles recomposées</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
