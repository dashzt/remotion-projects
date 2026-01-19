import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface WaveProps {
  amplitude: number;
  wavelength: number;
  opacity: number;
  color: string;
  shapeOffset: number; // Horizontal position shift
  timeOffset: number; // When the "bobbing" starts (0 to 1)
}

const Wave: React.FC<WaveProps> = ({
  amplitude,
  wavelength,
  opacity,
  color,
  shapeOffset,
  timeOffset,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Perfect loop progress (0 to 1)
  const progress = frame / durationInFrames;

  // Apply the timeOffset to de-sync the waves
  // We use % 1 to keep the value between 0 and 1 for the sine wave
  const loopedProgress = (progress + timeOffset) % 1;
  const timePhase = Math.PI * 2 * loopedProgress;

  const generatePath = () => {
    const points = [];
    // Step of 0.5 for high-quality SVG rendering in video
    for (let x = 0; x <= 100; x += 0.5) {
      /**
       * To get a single peak, we ensure the wavelength is 100.
       * Standing wave: Shape * Movement
       */
      const shape = Math.sin((x / wavelength) * Math.PI * 2 + shapeOffset);
      const movement = Math.sin(timePhase);

      const y = 50 + shape * movement * amplitude;
      points.push(`${x},${y}`);
    }
    return `M 0,50 L ${points.join(" ")} L 100,100 L 0,100 Z`;
  };

  return (
    <path
      d={generatePath()}
      fill={color}
      opacity={opacity}
      style={{ mixBlendMode: "screen" }} // Optional: makes overlapping waves look better
    />
  );
};

export const AnimatedWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-900">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <filter id="noise">
              {/* Creates a subtle grain/dither effect */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.05" />{" "}
                {/* Adjust slope for noise intensity */}
              </feComponentTransfer>
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        
        {/* Back wave: Slowest, smallest amplitude */}
        <Wave
          amplitude={4}
          wavelength={100}
          opacity={0.2}
          shapeOffset={0}
          timeOffset={0} // Starts at 0
          color="url(#waveGradient)"
        />

        {/* Mid wave: Medium amplitude, shifted horizontally and in time */}
        <Wave
          amplitude={8}
          wavelength={100}
          opacity={0.4}
          shapeOffset={Math.PI / 2}
          timeOffset={0.33} // Offset by 1/3 of the loop
          color="url(#waveGradient)"
        />

        {/* Front wave: Biggest amplitude, shifted further */}
        <Wave
          amplitude={12}
          wavelength={100}
          opacity={0.6}
          shapeOffset={Math.PI}
          timeOffset={0.66} // Offset by 2/3 of the loop
          color="url(#waveGradient)"
        />
      </svg>
    </div>
  );
};
