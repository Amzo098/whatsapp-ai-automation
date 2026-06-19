import "./index.css";
import { Composition } from "remotion";
import { Main45s } from "./Main45s";
import { MainChoixDesPlats } from "./MainChoixDesPlats";
import { MainTestimonial } from "./MainTestimonial";
import { MainCoulisses } from "./MainCoulisses";
import { MainPatisserie } from "./MainPatisserie";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vidéo promo 39s */}
      <Composition
        id="RestaurantOccidental"
        component={Main45s}
        durationInFrames={1167}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Vidéo engagement "Quel plat ?" 18.5s */}
      <Composition
        id="ChoixDesPlats"
        component={MainChoixDesPlats}
        durationInFrames={555}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Vidéo témoignage AIDA "Chez nous, c'est du vrai" 22s */}
      <Composition
        id="TemoignageClients"
        component={MainTestimonial}
        durationInFrames={662}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Vidéo "Dans les coulisses" — format ASMR pâtisserie 15s */}
      <Composition
        id="DansLesCoulisses"
        component={MainCoulisses}
        durationInFrames={456}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Vidéo "Le Coin Pâtisserie" — ligne produit gâteaux cœur 14.3s */}
      <Composition
        id="LeCoinPatisserie"
        component={MainPatisserie}
        durationInFrames={429}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
