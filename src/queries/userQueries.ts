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

    const data = await response.json();

    if (response.ok) {
      console.log('Successful login! :)');
      console.log(data);
      return {
        success: true,
        user: data.user
      };
    } else {
      console.log('Server responded with an error:', data.message || 'Unknown error');
      return {
        success: false,
        error: data.message || 'Unknown error'
      };
    }
  } catch(error) {
    console.log('Error login in: ', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
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

    const data = await response.json();

    if (response.ok) {
      console.log('Successful sign up! :)');
      return {
        success: true,
        user: data.user
      };
    } else {
      console.log('Server responded with an error:', data.message || 'Unknown error');
      return {
        success: false,
        error: data.message || 'Unknown error'
      };
    }
  } catch (error) {
    console.log('Network error signing up:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
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