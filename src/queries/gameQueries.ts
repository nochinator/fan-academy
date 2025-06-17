import { EFaction } from "../enums/gameEnums";
import { IGame } from "../interfaces/gameInterface";

export async function getGameList(userId: string): Promise<IGame[] | []> {
  console.log('Fetching game list...');
  const url = `http://localhost:3003/games/playing?userId=${encodeURIComponent(userId)}`;
  const result = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const games = await result.json();

  if (result.status !== 200) {
    console.log('Error fetching the game list...'); // TODO: throw errors
    return [];
  }

  console.log('Game list fetched...');
  return games;
}

// Challenge a player to a game
export async function newGameChallenge(userId: string, faction: EFaction, opponentId: string): Promise<any> {
  console.log('Sending challenge to player... ');
  const url = `http://localhost:3003/games/newGame?userId=${encodeURIComponent(userId)}&faction=${encodeURIComponent(faction)}&opponentId=${encodeURIComponent(opponentId)}`;
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await result.json();

  if (result.status !== 200) {
    console.error('Error sending challenge...'); // TODO: throw errors
    return null;
  }

  console.log('Challenge sent', data);
  return data;
}