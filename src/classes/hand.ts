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
    this.hand = this.hand.filter((unit) => unit.unitId != unitToRemove.unitId);
    // return this.hand; // REVIEW: should we return the array or the unit removed? or nothing at all?
  }
}
