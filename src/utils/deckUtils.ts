import { Hero } from "../classes/hero";
import { Item } from "../classes/item";

// Fisher-Yates shuffle algorithm
export function shuffleArray(array: (Hero | Item)[]): (Hero | Item)[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  array.forEach((unit, index) => {
    if (index < 6) {
      unit.boardPosition = 45 + index; // First 6 units get positions 45 to 50 on the board (the player's hand)
    } else {
      unit.boardPosition = 51; // Remaining units get 51 (deck, hidden)
    }
  });

  return array;
}

export function isHero(hero: Hero | Item): hero is Hero {
  return hero.class === "hero";
}

export function isItem(item: Hero | Item): item is Item {
  return item.class === "item";
}

export function isInHand(boardPosition: number): boolean {
  return boardPosition > 44 && boardPosition < 51;
}