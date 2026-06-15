import "./index.css";
import { Composition } from "remotion";
import { Main45s } from "./Main45s";
import { MainChoixDesPlats } from "./MainChoixDesPlats";

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
    </>
  );
};
