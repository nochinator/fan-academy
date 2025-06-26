import { Profile } from "../classes/profile";
import { IUserPreferences, IUserStats } from "../interfaces/userInterface";
import { getProfile } from "../queries/userQueries";
import { loadProfileUI } from "./profileSceneUtils/loadProfileUI";

export default class ProfileScene extends Phaser.Scene {
  userId!: string;
  profile: Profile | undefined;

  userData: {
    _id: string;
    username: string;
    email: string;
    picture: string;
    preferences: IUserPreferences;
    stats: IUserStats
  } | null | undefined;

  constructor() {
    super({ key: 'ProfileScene' });
  }

  async init(data: { userId: string, }) {
    this.userId = data.userId;
  }

  async preload() {
    await loadProfileUI(this);
  }

  async create() {
    // User data query
    this.userData = await getProfile();
    console.log('USERDATA', this.userData);

    this.profile = new Profile(this);
    // TODO: throw error if no user data
  }
}