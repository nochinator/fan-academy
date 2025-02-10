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

  if (result.status != 200) {
    console.log('Error fetching the game list...'); // TODO: throw errors
    return [];
  }

  console.log('Game list fetched...');
  console.log('Game list', JSON.stringify(games));
  return games;
}