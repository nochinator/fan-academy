export async function loginQuery(username: string, password: string, loginForm: Phaser.GameObjects.DOMElement) {
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
      loginForm.setVisible(false);
      return response;}
  } catch(error) {
    console.log('Error login in: ', error);
  }
}

export async function signUpQuery( email: string, username: string, password: string) {
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
    if (response.ok) { console.log('Successful sign in! :)'); return response;}
  } catch (error) {
    console.log('Error signing in: ', error);
  }
}

/**
 * Used on MainMenuScene's onCreate() to check if the player is authenticated
 * @returns promise boolean
 */
export async function authCheck(): Promise<boolean> {
  console.log('Checking Authentication Status...');
  const result = await fetch('http://localhost:3003/auth-check', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (result.status != 200) {
    console.log('User not authenticated...');
    return false;
  }

  console.log('User authenticated...');
  return true;
};