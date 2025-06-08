import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium" }) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return "h-5 w-5";
      case "medium":
        return "h-8 w-8";
      case "large":
        return "h-12 w-12";
      default:
        return "h-8 w-8";
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${getSize()} border-t-2 border-b-2 border-indigo-500`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
