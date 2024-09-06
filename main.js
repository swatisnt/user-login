document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const showMessageAndRedirect = (message, redirectUrl) => {
    alert(message);
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 5000);
  };

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const response = await fetch('/register', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
      const result = await response.json();
      if (result.success) {
        showMessageAndRedirect(result.message, result.redirect);
      } else {
        alert(result.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const response = await fetch('/login', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
      const result = await response.json();
      if (result.success) {
        showMessageAndRedirect(result.message, result.redirect);
      } else {
        showMessageAndRedirect(result.message, '/login.html');
      }
    });
  }
});
