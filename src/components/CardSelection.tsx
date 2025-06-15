import { Canvas } from "@react-three/fiber";
import {
  Container,
  FontFamilyProvider,
  Fullscreen,
  Image,
} from "@react-three/uikit";
import { useSnapshot } from "valtio";
import { gameStore } from "../store/gameStore";
import { SmallCard } from "./CardSelection/SmallCard";
import { animate } from "../lib/animate";
import { useLocal } from "../lib/use-local";
import { easings } from "react-spring";

const Cards = () => {
  const store = useSnapshot(gameStore);
  const local = useLocal({ ready: false }, () => {
    local.ready = true;
    local.render();
  });

  return (
    <Container
      flexDirection={"column"}
      flexWrap={"wrap"}
      alignItems={"stretch"}
      flexGrow={1}
    >
      <Container flexDirection={"row"} gap={10} padding={10} height={"25%"}>
        {store.player2Cards.map((cardName, i) => {
          return (
            <Container key={i}>
              <SmallCard cardName={cardName} height={200} />
            </Container>
          );
        })}
      </Container>
      <Container alignItems={"center"} justifyContent={"center"}>
        <animate.Image
          src="/img/battle/vs.webp"
          positionType={"absolute"}
          zIndexOffset={1000}
          opacity={local.ready ? 1 : 0}
          springConfig={{
            duration: 1000,
            easing: easings.easeInOutElastic,
            delay: 1000
          }}
          marginTop={-40}
          width={local.ready ? "20%" : "15%"}
        />
      </Container>
      <Container
        flexGrow={1}
        zIndexOffset={500}
        gap={10}
        padding={10}
        alignItems={"flex-end"}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* {store.availableCards.map((cardName, i) => {
          if (i > 1) return null;
          return (
            <Container key={i} height={100}>
              <SmallCard cardName={cardName} />{" "}
            </Container>
          );
        })} */}
      </Container>
    </Container>
  );
};

const CardSelection = () => {
  return (
    <Canvas
      style={{ position: "absolute", inset: "0", touchAction: "none" }}
      gl={{ localClippingEnabled: true }}
      onContextMenu={(e) => e.preventDefault()}
    >
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
    </Canvas>
  );

  // return (
  //   <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 items-center py-8">
  //     <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-8">
  //       <div className="flex items-center justify-between mb-4">
  //         <h2 className="text-2xl font-bold text-white">Select Your Cards</h2>
  //         <button
  //           className="text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-700 transition"
  //           onClick={gameActions.goToMenu}
  //         >
  //            Back to Menu
  //         </button>
  //       </div>
  //       {state.error && (
  //         <div className="bg-red-700 text-white px-4 py-2 rounded mb-4">
  //           {state.error}
  //         </div>
  //       )}
  //       <div className="grid grid-cols-2 gap-8">
  //         <div>
  //           <h3 className="text-lg font-semibold text-indigo-300 mb-2">
  //             Player 1 ({state.player1Cards.length}/1)
  //           </h3>
  //           <div className="flex gap-2">
  //             {state.player1Cards.map((cardName, index) => (
  //               <div
  //                 key={index}
  //                 className="bg-gray-800 rounded-lg p-2 flex flex-col items-center shadow"
  //               >
  //                 <img
  //                   src={getCardImage(cardName)}
  //                   alt={cardName}
  //                   className="w-20 h-28 object-cover rounded mb-1"
  //                   onError={(e) => {
  //                     (e.target as HTMLImageElement).src =
  //                       "/img/cards/placeholder.jpg";
  //                   }}
  //                 />
  //                 <span className="text-xs text-white mb-1">{cardName}</span>
  //                 <button
  //                   className="text-xs text-red-400 hover:text-red-600"
  //                   onClick={() => gameActions.removeFromPlayer1(cardName)}
  //                 >
  //                   ×
  //                 </button>
  //               </div>
  //             ))}
  //             {Array.from({ length: 1 - state.player1Cards.length }).map(
  //               (_, index) => (
  //                 <div
  //                   key={`empty-${index}`}
  //                   className="w-20 h-28 flex items-center justify-center border-2 border-dashed border-gray-700 rounded text-gray-600"
  //                 >
  //                   <span>+</span>
  //                 </div>
  //               )
  //             )}
  //           </div>
  //         </div>
  //         <div>
  //           <h3 className="text-lg font-semibold text-pink-300 mb-2">
  //             Player 2 ({state.player2Cards.length}/1)
  //           </h3>
  //           <div className="flex gap-2">
  //             {state.player2Cards.map((cardName, index) => (
  //               <div
  //                 key={index}
  //                 className="bg-gray-800 rounded-lg p-2 flex flex-col items-center shadow"
  //               >
  //                 <img
  //                   src={getCardImage(cardName)}
  //                   alt={cardName}
  //                   className="w-20 h-28 object-cover rounded mb-1"
  //                   onError={(e) => {
  //                     (e.target as HTMLImageElement).src =
  //                       "/img/cards/placeholder.jpg";
  //                   }}
  //                 />
  //                 <span className="text-xs text-white mb-1">{cardName}</span>
  //                 <button
  //                   className="text-xs text-red-400 hover:text-red-600"
  //                   onClick={() => gameActions.removeFromPlayer2(cardName)}
  //                 >
  //                   ×
  //                 </button>
  //               </div>
  //             ))}
  //             {Array.from({ length: 1 - state.player2Cards.length }).map(
  //               (_, index) => (
  //                 <div
  //                   key={`empty-${index}`}
  //                   className="w-20 h-28 flex items-center justify-center border-2 border-dashed border-gray-700 rounded text-gray-600"
  //                 >
  //                   <span>+</span>
  //                 </div>
  //               )
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex flex-col items-center gap-2 mt-4">
  //         <span className="text-2xl text-gray-400 font-bold">VS</span>
  //         <button
  //           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded transition disabled:bg-gray-700 disabled:text-gray-400"
  //           onClick={gameActions.startBattle}
  //           disabled={!canStartBattle}
  //         >
  //           Start Battle!
  //         </button>
  //       </div>
  //       <div>
  //         <h3 className="text-lg font-semibold text-white mb-2">
  //           Available Cards
  //         </h3>
  //         <div className="grid grid-cols-4 gap-4">
  //           {state.availableCards.map((cardName) => {
  //             const cardData = getCardData(cardName);
  //             const isSelected = state.selectedCard === cardName;
  //             return (
  //               <button
  //                 key={cardName}
  //                 className={`bg-gray-800 rounded-lg p-2 flex flex-col items-center shadow cursor-pointer transition border-2 ${
  //                   isSelected ? "border-indigo-400" : "border-transparent"
  //                 }`}
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   state.player1Cards.forEach((e) =>
  //                     gameActions.removeFromPlayer1(e)
  //                   );
  //                   gameActions.addToPlayer1(cardName);
  //                 }}
  //               >
  //                 <img
  //                   src={getCardImage(cardName)}
  //                   alt={cardName}
  //                   className="w-20 h-28 object-cover rounded mb-1"
  //                   onError={(e) => {
  //                     (e.target as HTMLImageElement).src =
  //                       "/img/cards/placeholder.jpg";
  //                   }}
  //                 />
  //                 <div className="text-xs text-white font-semibold mb-1">
  //                   {cardName}
  //                 </div>
  //                 <p className="text-xs text-gray-400 mb-1">
  //                   {cardData?.title}
  //                 </p>
  //                 {cardData?.composition && (
  //                   <div className="flex gap-1 mb-1">
  //                     {Object.entries(cardData.composition).map(
  //                       ([element, value]) => (
  //                         <div
  //                           key={element}
  //                           className="flex items-center gap-1"
  //                         >
  //                           <img
  //                             src={getElementIcon(element)}
  //                             alt={element}
  //                             className="w-4 h-4"
  //                           />
  //                           <span className="text-xs text-gray-300">
  //                             {value}%
  //                           </span>
  //                         </div>
  //                       )
  //                     )}
  //                   </div>
  //                 )}
  //               </button>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default CardSelection;
