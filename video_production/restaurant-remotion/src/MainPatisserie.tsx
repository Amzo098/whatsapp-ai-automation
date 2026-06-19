import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, continueRender, delayRender } from "remotion";
import { loadPoppins } from "./fonts";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { VideoScene } from "./components/VideoScene";
import { CoinPatisserieCTA } from "./components/CoinPatisserieCTA";
import { BrandBug } from "./components/BrandBug";

const T = 12;

// "Le Coin Pâtisserie" — faire connaître la ligne de gâteaux cœur (peu de gens savent qu'on en fait).
// Hook ("Le saviez-vous ?") → reveal produit → CTA découverte.
// Net total: 135 + 138 + 180 - 2×12 = 429 frames = 14.3s
export const MainPatisserie: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadPoppins().then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => {
          const totalFrames = 429;
          if (f < 24) return (f / 24) * 0.55;
          if (f > totalFrames - 50) return Math.max(0, ((totalFrames - f) / 50) * 0.55);
          return 0.55;
        }}
      />

      <TransitionSeries>
        {/* 1 — Hook : on prépare avec soin... */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <VideoScene src="coulisses_decoration.mp4" caption="Le saviez-vous ?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 2 — Reveal produit : gâteaux cœur */}
        <TransitionSeries.Sequence durationInFrames={138}>
          <VideoScene src="patisserie_reveal.mp4" caption="On fait aussi des gâteaux cœur" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 3 — CTA découverte */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <CoinPatisserieCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence durationInFrames={249}>
        <BrandBug />
      </Sequence>
    </AbsoluteFill>
  );
};
