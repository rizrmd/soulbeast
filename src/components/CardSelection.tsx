import { Canvas } from "@react-three/fiber";
import {
  Container,
  DefaultProperties,
  FontFamilyProvider,
  Fullscreen,
  Image,
} from "@react-three/uikit";
import { Suspense } from "react";
import { easings } from "react-spring";
import { useSnapshot } from "valtio";
import { animate } from "../lib/animate";
import { MaskedImage } from "../lib/masked-image";
import { useLocal } from "../lib/use-local";
import { gameStore } from "../store/gameStore";
import { SmallCard } from "./CardSelection/SmallCard";

const Cards = () => {
  const store = useSnapshot(gameStore);
  const local = useLocal({ init: false, ready: false, selection: 0 }, () => {
    local.init = true;
    local.render();
    setTimeout(() => {
      local.ready = true;
      local.render();
    }, 2500);
  });

  return (
    <Container
      flexDirection={"column"}
      flexWrap={"wrap"}
      alignItems={"stretch"}
      flexGrow={1}
    >
      <animate.Container
        flexDirection={"row"}
        gap={10}
        padding={10}
        height={"25%"}
        borderBottomWidth={!local.init ? 0 : 1}
        borderColor="#fcd569"
        springConfig={{ duration: 3000 }}
        borderOpacity={0.6}
      >
        {store.player2Cards.map((cardName, i) => {
          return (
            <Container key={`${cardName}-${i}`}>
              <animate.DefaultProperties
                opacity={local.init ? 1 : 0}
                backgroundOpacity={local.init ? 0 : 1}
                springConfig={{
                  duration: 1000,
                  delay: (i + 1) * 300,
                  from: { opacity: 0 },
                }}
              >
                <SmallCard cardName={cardName} />
              </animate.DefaultProperties>
            </Container>
          );
        })}
      </animate.Container>
      <Container alignItems={"center"} justifyContent={"center"}>
        <animate.Image
          src="/img/battle/vs.webp"
          positionType={"absolute"}
          zIndexOffset={1000}
          opacity={local.init ? 1 : 0}
          pointerEvents={"none"}
          springConfig={{
            duration: 1000,
            delay: 1800,
            easing: easings.easeInOutElastic,
          }}
          marginTop={-40}
          width={local.init ? "20%" : "0%"}
        />
        <MaskedImage
          width="100%"
          height={20}
          marginTop={-10}
          positionType={"absolute"}
          maskText={`<svg width="400" height="20" viewBox="0 0 400 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="20" fill="url(#paint0_linear_64_2)"/>
<defs>
<linearGradient id="paint0_linear_64_2" x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.504808" stop-opacity="0"/>
<stop offset="1"/>
</linearGradient>
</defs>
</svg>
`}
        />
      </Container>
      <Container
        gap={10}
        padding={10}
        paddingTop={20}
        height="15%"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {[0, 1].map((i) => {
          const cardName = store.player1Cards[i] || "";
          return (
            <Container
              key={i}
              flexDirection={"column"}
              alignItems={"center"}
              flexGrow={1}
              onClick={(e) => {
                e.stopPropagation();
                local.selection = i;
                local.render();
              }}
            >
              <animate.DefaultProperties
                opacity={local.init ? 1 : 0}
                backgroundOpacity={local.init ? 0 : 1}
                springConfig={{ duration: 1000, delay: 600 + (i + 1) * 400 }}
              >
                <animate.Image
                  src="/img/battle/select.webp"
                  height={60}
                  pointerEvents={"none"}
                  marginTop={local.selection === i ? -30 : -70}
                  opacity={local.selection === i ? 1 : 0}
                  transformRotateZ={180}
                  positionRight={20}
                  positionLeft={20}
                  positionType={"absolute"}
                  springConfig={{ from: { opacity: 0, marginTop: -70 } }}
                  zIndexOffset={10}
                  visibility={local.ready ? "visible" : "hidden"}
                />
                <SmallCard
                  cardName={cardName}
                  overflow={"hidden"}
                  height="100%"
                />

                <animate.Image
                  src="/img/battle/select.webp"
                  height={60}
                  pointerEvents={"none"}
                  positionBottom={0}
                  marginBottom={local.selection === i ? -45 : -70}
                  opacity={local.selection === i ? 1 : 0}
                  positionRight={20}
                  positionLeft={20}
                  springConfig={{ from: { opacity: 0, marginBottom: -70 } }}
                  positionType={"absolute"}
                  zIndexOffset={10}
                  visibility={local.ready ? "visible" : "hidden"}
                />
              </animate.DefaultProperties>
            </Container>
          );
        })}
      </Container>
    </Container>
  );
};

const CardSelection = () => {
  return (
    <Canvas
      style={{
        position: "absolute",
        inset: "0",
      }}
      gl={{
        localClippingEnabled: true,
      }}
      onContextMenu={(e) => e.preventDefault()}
      frameloop="demand"
    >
      <Suspense fallback={null}>
        <FontFamilyProvider
          NewRocker={{
            medium: "/fonts/newrocker.json",
          }}
          Texturina={{
            medium: "/fonts/texturina.json",
          }}
        >
          <Fullscreen flexDirection="row">
            <Cards />
          </Fullscreen>
        </FontFamilyProvider>
      </Suspense>
    </Canvas>
  );
};

export default CardSelection;
