import { Canvas } from "@react-three/fiber";
import { Container, FontFamilyProvider, Fullscreen } from "@react-three/uikit";
import { Suspense } from "react";
import { easings } from "react-spring";
import { useSnapshot } from "valtio";
import { animate } from "../lib/animate";
import { MaskedImage } from "../lib/masked-image";
import { useLocal } from "../lib/use-local";
import { gameStore } from "../store/gameStore";
import { getCardData, SmallCard } from "./CardSelection/SmallCard";

const cardDelay = 300;
const Content = () => {
  const store = useSnapshot(gameStore);
  const local = useLocal(
    { init: false, ready: false, selection: 0, card: { height: 0 } },
    () => {
      local.init = true;
      local.render();
      setTimeout(() => {
        local.ready = true;
        local.render();
      }, 7 * cardDelay);
    }
  );

  return (
    <>
      <animate.Container
        flexDirection={"row"}
        gap={10}
        padding={10}
        height={"20%"}
        borderBottomWidth={!local.init ? 0 : 1}
        borderColor="#fcd569"
        borderOpacity={0.6}
        springConfig={{ duration: 2000 }}
      >
        {store.player2Cards.map((cardName, i) => {
          return (
            <animate.DefaultProperties
              key={i}
              opacity={local.init ? 1 : 0}
              springConfig={{
                duration: 1000,
                delay: (i + 1) * cardDelay,
              }}
            >
              <SmallCard key={i} cardName={cardName} />
            </animate.DefaultProperties>
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
            easing: easings.easeInOutElastic,
            delay: 5 * cardDelay,
          }}
          marginTop={-40}
          width={local.init ? "15%" : "0%"}
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
        paddingTop={30}
        height="20%"
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
                if (store.player1Cards[i]) {
                  gameStore.player1Cards[i] = "";
                }
                local.render();
              }}
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
                zIndexOffset={10}
                visibility={local.init ? "visible" : "hidden"}
                springConfig={{
                  delay: !local.ready ? 2300 : 0,
                  from: { opacity: 0, marginTop: -70 },
                }}
              />
              <animate.Image
                src="/img/battle/select.webp"
                height={60}
                pointerEvents={"none"}
                positionBottom={0}
                marginBottom={local.selection === i ? -30 : -70}
                opacity={local.selection === i ? 1 : 0}
                positionRight={20}
                positionLeft={20}
                positionType={"absolute"}
                zIndexOffset={10}
                visibility={local.init ? "visible" : "hidden"}
                springConfig={{
                  delay: !local.ready ? 2300 : 0,
                  from: { opacity: 0, marginBottom: -45 },
                }}
              />

              <animate.DefaultProperties
                key={i}
                opacity={local.init ? 1 : 0}
                springConfig={{
                  duration: 1000,
                  delay: cardDelay * 2 + (i + 1) * cardDelay,
                }}
              >
                <SmallCard cardName={cardName} height="100%" />
              </animate.DefaultProperties>
            </Container>
          );
        })}
      </Container>

      <animate.Container
        height={300}
        overflow={"scroll"}
        gap={10}
        ref={(ref) => {
          const size = ref?.size.peek();

          if (size && !local.card.height) {
            local.card.height = size[1] - 30;
            local.render();
          }
        }}
        flexDirection={"row"}
        paddingX={10}
        paddingTop={10}
        scrollbarBorderRadius={6}
        scrollbarColor={local.ready ? "white" : "black"}
      >
        {local.card.height &&
          store.availableCards.map((cardName, i) => {
            const card = getCardData(cardName);

            const isSelected = store.player1Cards.includes(cardName);
            if (!card) return null;
            const w = (736 / 1104) * local.card.height;
            return (
              <Container
                key={i}
                height={local.card.height}
                minWidth={w}
                width={w}
                maxWidth={w}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    gameStore.player1Cards = gameStore.player1Cards.filter(
                      (c) => c !== cardName
                    );
                    local.selection = gameStore.player1Cards.length;
                    return;
                  }

                  if (store.player1Cards[local.selection] === "") {
                    gameStore.player1Cards[local.selection] = cardName;
                    return;
                  }
                  if (store.player1Cards.length >= 2) {
                    gameStore.player1Cards.pop();
                    local.selection = 1;
                    gameStore.player1Cards.push(cardName);
                  } else {
                    gameStore.player1Cards.push(cardName);
                    local.selection = gameStore.player1Cards.length;
                  }
                }}
              >
                <animate.Image
                  src={card.image}
                  borderRadius={20}
                  opacity={isSelected ? 0.7 : 1}
                />
                <animate.Image
                  src="/img/battle/border.webp"
                  positionType={"absolute"}
                  width="100%"
                  height="100%"
                  opacity={isSelected ? 1 : 0}
                />
                <animate.Text
                  fontFamily="NewRocker"
                  fontSize={24}
                  positionType={"absolute"}
                  color="#fcd569"
                  width={"100%"}
                  textAlign={"center"}
                  positionTop={"45%"}
                  opacity={isSelected ? 1 : 0}
                  springConfig={{
                    delay: 0 * cardDelay,
                    duration: 1000,
                  }}
                >
                  Selected
                </animate.Text>
              </Container>
            );
          })}
      </animate.Container>
    </>
  );
};

const CardSelection = () => {
  return (
    <Canvas
      style={{ position: "absolute", inset: "0", touchAction: "none" }}
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
          <Fullscreen flexDirection={"column"} alignItems={"stretch"}>
            <Content />
          </Fullscreen>
        </FontFamilyProvider>
      </Suspense>
    </Canvas>
  );
};

export default CardSelection;
