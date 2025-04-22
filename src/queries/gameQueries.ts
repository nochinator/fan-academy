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
  console.log('Game list', JSON.stringify(games));
  return games;
}

// Delete a game searching for players
export async function deleteGame(userId: string | undefined, gameId: string | undefined): Promise<IGame | null> {
  if (!userId || !gameId) {
    console.log('Error deleting game, missing userId | gameId');
    return null;
  }
  console.log('Deleting game...');
  const url = `http://localhost:3003/games/delete?userId=${encodeURIComponent(userId)}&gameId=${encodeURIComponent(gameId)}`;
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await result.json();
  console.log('Deleted game data', data);

  if (result.status !== 200) {
    console.log('Error deleting  game...'); // TODO: throw errors
    return null;
  }

  console.log('Game deleted...');
  return data;
}