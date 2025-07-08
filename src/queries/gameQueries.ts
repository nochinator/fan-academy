import { EFaction } from "../enums/gameEnums";
import { IGame } from "../interfaces/gameInterface";

export async function getGameList(userId: string): Promise<IGame[] | []> {
  console.log('Fetching game list...');
  const jwt = localStorage.getItem('jwt');
  const url = `${import.meta.env.VITE_BE_URL}games/playing?userId=${encodeURIComponent(userId)}`;
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    }
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
  const jwt = localStorage.getItem('jwt');

  console.log('Sending challenge to player... ');
  const url = `${import.meta.env.VITE_BE_URL}games/newGame?userId=${encodeURIComponent(userId)}&faction=${encodeURIComponent(faction)}&opponentId=${encodeURIComponent(opponentId)}`;
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}` 
    }
  });

  const data = await result.json();

  if (result.status !== 200) {
    console.error('Error sending challenge...'); // TODO: throw errors
    return null;
  }

  console.log('Challenge sent', data);
  return data;
}