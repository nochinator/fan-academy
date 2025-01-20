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
    if (response.ok) { console.log('Successful login! :)'); return response;}
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
