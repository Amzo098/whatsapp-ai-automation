import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, staticFile, continueRender, delayRender } from "remotion";
import { loadPoppins } from "./fonts";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleCard } from "./components/TitleCard";
import { InfoCard } from "./components/InfoCard";
import { CTACard } from "./components/CTACard";
import { VideoScene } from "./components/VideoScene";
import { DUR } from "./brand";

const T = DUR.transition;

export const Main45s: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadPoppins().then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill>
      {/* Background music */}
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => {
          // Fade in over 1s, fade out over last 2s (total ~39s = ~1167 frames)
          const totalFrames = 1167;
          if (f < 30) return f / 30 * 0.75;
          if (f > totalFrames - 60) return Math.max(0, (totalFrames - f) / 60 * 0.75);
          return 0.75;
        }}
      />

      <TransitionSeries>
        {/* 1 - Titre animé */}
        <TransitionSeries.Sequence durationInFrames={DUR.titleCard}>
          <TitleCard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 2 - Façade extérieure */}
        <TransitionSeries.Sequence durationInFrames={DUR.video}>
          <VideoScene src="facade.mp4" caption="Bienvenue !" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 3 - Nos spécialités */}
        <TransitionSeries.Sequence durationInFrames={DUR.serviceCard}>
          <InfoCard
            title="Nos Spécialités"
            subtitle="Cuisine africaine & internationale"
            lines={[
              "Poisson grillé · Poulet braisé",
              "Brochettes · Riz sauce",
              "Plats du jour à prix doux",
            ]}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 4 - Poisson grillé */}
        <TransitionSeries.Sequence durationInFrames={DUR.video}>
          <VideoScene src="poisson.mp4" caption="Poisson grillé maison" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 5 - Traiteur */}
        <TransitionSeries.Sequence durationInFrames={DUR.traiteurCard}>
          <InfoCard
            title="Aussi Traiteur"
            subtitle="Événements sur mesure"
            lines={[
              "Mariages · Cérémonies",
              "Anniversaires · Entreprises",
            ]}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 6 - Terrasse service */}
        <TransitionSeries.Sequence durationInFrames={DUR.video}>
          <VideoScene src="terrasse.mp4" caption="Service à votre table" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 7 - Pourquoi nous */}
        <TransitionSeries.Sequence durationInFrames={DUR.whyCard}>
          <InfoCard
            title="Pourquoi Nous ?"
            lines={[
              "✔  Ingrédients frais chaque jour",
              "✔  Service rapide & chaleureux",
              "✔  Cadre propre & climatisé",
              "✔  Prix accessibles à tous",
            ]}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 8 - Salle intérieure */}
        <TransitionSeries.Sequence durationInFrames={DUR.videoShort}>
          <VideoScene src="salle.mp4" caption="Salle climatisée" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 9 - Client satisfait */}
        <TransitionSeries.Sequence durationInFrames={DUR.videoShort}>
          <VideoScene src="pouce.mp4" caption="Clients satisfaits 👍" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 10 - CTA */}
        <TransitionSeries.Sequence durationInFrames={DUR.ctaCard}>
          <CTACard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
