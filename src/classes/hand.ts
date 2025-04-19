import { IHero, IItem } from "../interfaces/gameInterface";

export class Hand {
  hand: (IHero | IItem)[];
  constructor(handData: (IHero | IItem)[]) {
    this.hand = handData;
  }

  getHand() {
    return this.hand;
  }

  addToHand() {
    // TODO: how to get the empty spots in the array?
  }

  removeFromHand(unitToRemove: IHero | IItem): void {
    const index = this.hand.findIndex(unit => unit.unitId === unitToRemove.unitId);
    if (index !== -1) this.hand.splice(index, 1);// can't use filter because creating a new array breaks the reference with factionData
    // return this.hand; // REVIEW: should we return the array or the unit removed? or nothing at all?
  }
}
