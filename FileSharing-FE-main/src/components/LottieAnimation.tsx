
import React from "react";
import Lottie from "lottie-react";

interface LottieAnimationProps {
  animationPath: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const LottieAnimation = ({
  animationPath,
  className = "",
  loop = true,
  autoplay = true,
}: LottieAnimationProps) => {
  return (
    <div className={className} style={{ background: "transparent" }}>
      <Lottie
        animationData={animationPath}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
          clearCanvas: false,
        }}
      />
    </div>
  );
};

export default LottieAnimation;
