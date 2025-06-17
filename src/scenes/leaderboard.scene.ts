import { getLeaderBoard } from "../queries/userQueries";
import { createLeaderboard, loadLeaderboardUI } from "./leaderboardSceneUtils/leaderboardUI";

export default class LeaderboardScene extends Phaser.Scene {
  userId!: string;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  async init(data: { userId: string, }) {
    this.userId = data.userId;
  }

  preload() {
    // Preload UI
    loadLeaderboardUI(this);
  }

  async create() {
    /**
 *  Query the db to get the number of players:
 *    profile pic
 *    name
 *    games finished
 *    total wins
 *    council wins
 *    elves wins
 *  */
    this.add.image(396, 14, 'gameBackground').setOrigin(0, 0).setScale(1.07, 1.2);

    const leaderboardData = await getLeaderBoard();

    if (leaderboardData) createLeaderboard(this, leaderboardData);

    console.log('Leaderboard', leaderboardData);
  }
}
