import { Container, ContainerRef, Text } from "@react-three/uikit";
import { DataLoader } from "../../engine/DataLoader";
import { MaskedImage } from "../../lib/masked-image";
import { useLocal } from "../../lib/use-local";
import { Character } from "../../types";
import { useRef } from "react";

const getCardData = (cardName: string) => {
  const characters = DataLoader.loadCharacters();
  const found = characters.find((char) => char.name === cardName) as any;

  const imageName = cardName.toLowerCase().replace(/\s+/g, "-");
  found.image = `/img/cards/${imageName}.jpeg`;

  return found as (Character & { image: string }) | undefined;
};

export const SmallCard = ({
  cardName,
  height,
}: {
  cardName: string;
  height?: number;
}) => {
  const local = useLocal({
    card: undefined as ReturnType<typeof getCardData>,
    width: 0,
    height: 0,
    ready: false,
  });

  if (local.card?.name !== cardName) {
    local.card = getCardData(cardName);
  }

  const card = local.card;

  let svgHeight = 1000;
  if (local.height > 0) {
    svgHeight = (local.height / local.width) * 1000;
  }

  return (
    <Container
      alignItems={"stretch"}
      flexGrow={1}
      ref={(ref) => {
        if (!local.height) {
          const unsub = ref?.size.subscribe((size) => {
            if (size?.[1] || 0 > 0) {
              local.width = size?.[0] || 0;
              local.height = size?.[1] || 0;

              setTimeout(() => {
                unsub?.();
              });
              local.render();
            }
          });
        }
      }}
    >
      {card ? (
        <>
          <Container height={"100%"}>
            <MaskedImage
              src={card.image}
              width={"100%"}
              imgCoverPosition="top-center"
              svgMask={`<svg width="1000" height="${svgHeight}" viewBox="0 0 1000 ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="1000" height="${svgHeight}" rx="90" fill="url(#paint0_linear_58_2)"/>
<defs>
<linearGradient id="paint0_linear_58_2" x1="115" y1="0" x2="115" y2="${svgHeight}" gradientUnits="userSpaceOnUse">
<stop offset="0.381764" stop-color="white"/>
<stop offset="0.908654" stop-color="white" stop-opacity="0" />
</linearGradient>
</defs>
</svg>
`}
            />
          </Container>
          <Container
            positionType={"absolute"}
            positionBottom={0}
            positionRight={0}
            positionLeft={0}
            flexDirection={"column"}
          >
            <Text
              fontFamily={"NewRocker"}
              color="white"
              fontSize={20}
              textAlign={"center"}
            >
              {card.name}
            </Text>
            <Text
              fontFamily={"Texturina"}
              color="white"
              fontSize={13}
              textAlign={"center"}
            >
              {card.title}
            </Text>
          </Container>
        </>
      ) : (
        <></>
      )}
    </Container>
  );
};
