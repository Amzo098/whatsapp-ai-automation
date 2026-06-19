import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, continueRender, delayRender } from "remotion";
import { loadPoppins } from "./fonts";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { VideoScene } from "./components/VideoScene";
import { PatisserieCTA } from "./components/PatisserieCTA";
import { BrandBug } from "./components/BrandBug";

const T = 12;

// "Dans les coulisses" — format ASMR, peu de texte, on laisse parler le geste.
// Net total: 150 + 180 + 150 - 2×12 = 456 frames = 15.2s
export const MainCoulisses: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadPoppins().then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => {
          const totalFrames = 456;
          if (f < 24) return (f / 24) * 0.55;
          if (f > totalFrames - 50) return Math.max(0, ((totalFrames - f) / 50) * 0.55);
          return 0.55;
        }}
      />

      <TransitionSeries>
        {/* 1 — Décoration à la poche, geste précis */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <VideoScene src="coulisses_decoration.mp4" caption="Fait à la main, chaque jour" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 2 — Finition soignée */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <VideoScene src="coulisses_finition.mp4" caption="Une touche de soin sur chaque création" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 3 — CTA pâtisserie */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <PatisserieCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence durationInFrames={306}>
        <BrandBug />
      </Sequence>
    </AbsoluteFill>
  );
};
