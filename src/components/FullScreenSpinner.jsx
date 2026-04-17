import React from "react";

function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      
      <div className="flex flex-col items-center gap-5">
        
        {/* Spinner with glow + smoother spin */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-gray-700 border-t-white animate-spin [animation-duration:0.8s] shadow-[0_0_12px_rgba(255,255,255,0.25)]"></div>
        
        {/* Loading Text */}
        <p className="text-gray-300 text-sm sm:text-base tracking-wide font-medium">
          Loading...
        </p>

      </div>
    </div>
  );
}

export default FullScreenSpinner;