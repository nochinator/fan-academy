import { IGame } from "../interfaces/gameInterface";

export async function loginQuery(username: string, password: string) {
  try {
    const response = await fetch('http://localhost:3003/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password
      }),
      credentials: 'include'
    });
    if (response.ok) {
      console.log('Successful login! :)');
      const data = await response.json();
      console.log(data);
      return data.user;
    }
  } catch(error) {
    console.log('Error login in: ', error);
  }
}

export async function signUpQuery(email: string, username: string, password: string) {
  try {
    const response = await fetch('http://localhost:3003/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password
      }),
      credentials: 'include'
    });
    if (response.ok) {
      console.log('Successful sign in! :)');
      const data = await response.json();
      console.log(data.user);
      return data;
    }
  } catch (error) {
    console.log('Error signing in: ', error);
  }
}

/**
 * Used on MainMenuScene's onCreate() to check if the player is authenticated
 * @returns
 */
export async function authCheck(): Promise<string | undefined> {
  console.log('Checking Authentication Status...');
  const result = await fetch('http://localhost:3003/auth-check', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (result.status != 200) {
    console.log('User not authenticated...');
    return undefined;
  }

  const userId = await result.json();

  console.log('User authenticated...', userId);
  return userId;
};

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