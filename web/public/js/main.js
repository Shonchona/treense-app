const handleLogin = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  
    if (response.ok) window.location.href = 'dashboard.html';
    else alert('Login failed');
  };
  
  const handleSignup = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (response.ok) window.location.href = 'login.html';
    else alert('Signup failed');
  };
  
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });
  
  document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSignup();
  });
  