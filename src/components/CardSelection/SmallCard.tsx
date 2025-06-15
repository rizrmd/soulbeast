import { Container, ContainerProperties, Image, Text } from "@react-three/uikit";
import { DataLoader } from "../../engine/DataLoader";
import { MaskedImage } from "../../lib/masked-image";
import { useLocal } from "../../lib/use-local";
import { Character } from "../../types";
import { animate } from "../../lib/animate";

const getCardData = (
  cardName: string
): (Character & { image: string }) | undefined => {
  const characters = DataLoader.loadCharacters();
  const found = characters.find((char) => char.name === cardName) as any;

  if (!found) {
    return {
      image: `/img/battle/ornament.webp`,
      name: "???",
      title: "",
      composition: {},
    };
  } else {
    const imageName = cardName.toLowerCase().replace(/\s+/g, "-");
    found.image = `/img/cards/${imageName}.webp`;
  }

  return found as any;
};

export const SmallCard = (
  props: { cardName: string } & ContainerProperties
) => {
  const { cardName } = props;
  const local = useLocal({
    card: undefined as ReturnType<typeof getCardData>,
    width: 0,
    height: 0,
    ready: false,
    sizesub: null as any,
  });

  if (local.card?.name !== cardName) {
    local.card = getCardData(cardName);
  }

  const card = local.card;
  const svgMask = `<svg viewBox="0 0 ${local.width} ${local.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect 
  width="${local.width}" height="${local.height}"
  rx="${local.width / ((local.width / local.height) * 7)}" ry="${local.height / 7}" fill="url(#linear)"/>
<defs>
<linearGradient id="linear" x1="0" y1="0" x2="0" y2="${local.height}" gradientUnits="userSpaceOnUse">
<stop offset="0.35" stop-color="black"/>
<stop offset="0.9" stop-color="black" stop-opacity="0" />
</linearGradient>
</defs>
</svg>
`;
  const _props: any = { ...props };
  delete _props.cardName;

  return (
    <Container
      alignItems={"stretch"}
      flexGrow={1}
      width="100%"
      {..._props}
      ref={(ref) => {
        if (!local.sizesub) {
          local.sizesub = ref?.size.subscribe((size) => {
            if (size) {
              local.width = size[0];
              local.height = size[1];
              if (local.width && local.height) {
                local.sizesub?.();
                local.ready = true;
                local.render();
              }
            }
          });
        }
      }}
    >
      {card && local.ready && (
        <>
          <Container
            backgroundColor={"black"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
          >

            <MaskedImage
              src={card.image}
              width={"100%"}
              height={"100%"}
              imgFit="cover"
              maskFit="fill"
              imageSmoothing="high"
              maskText={svgMask}
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
              marginBottom={card.title ? 0 : 14}
            >
              {card.name}
            </Text>
            {card.title && (
              <Text
                fontFamily={"Texturina"}
                color="white"
                fontSize={13}
                textAlign={"center"}
              >
                {card.title}
              </Text>
            )}
          </Container>
        </>
      )}
    </Container>
  );
};
