import React, { useEffect, useState } from "react";
import LottieAnimation from "./LottieAnimation";

const ImageShowcaseSection = () => {
  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    fetch("/lovable-uploads/searchfiles.json")
      .then((response) => response.json())
      .then((data) => setLottieData(data))
      .catch((error) =>
        console.error("Error loading Lottie animation:", error)
      );
  }, []);

  return (
    <section className="w-full pt-0 pb-8 sm:pb-12 bg-white" id="showcase">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
            Secure File Sharing Made Simple
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Our platform combines enterprise-grade security with an intuitive
            interface, making encrypted file sharing accessible to everyone.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 p-8 sm:p-16 flex items-center justify-center">
            <div className="w-full max-w-md">
              {lottieData ? (
                <LottieAnimation
                  animationPath={lottieData}
                  className="w-full h-auto"
                  loop={true}
                  autoplay={true}
                />
              ) : (
                <svg viewBox="0 0 500 500" className="w-full h-auto">
                  <circle
                    cx="250"
                    cy="250"
                    r="200"
                    fill="#8B5CF6"
                    opacity="0.1"
                  />
                  <circle
                    cx="250"
                    cy="250"
                    r="150"
                    fill="#8B5CF6"
                    opacity="0.2"
                  />
                  <path
                    d="M250 150 L250 350 M150 250 L350 250"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle cx="250" cy="250" r="40" fill="#8B5CF6" />
                  <path
                    d="M220 220 L280 280 M280 220 L220 280"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="bg-white p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">
              Enterprise-Grade Encryption
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">
              Built with AES-256-CBC encryption and admin approval workflows,
              our platform ensures your sensitive files remain protected at
              every step. From upload to download, complete audit trails provide
              transparency and compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcaseSection;
