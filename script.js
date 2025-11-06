const form = document.getElementById('signupForm');
const successBox = document.getElementById('success');

function showError(input, message) {
  const container = input.closest('.field');
  const err = container.querySelector('.error');
  err.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  const container = input.closest('.field');
  const err = container.querySelector('.error');
  err.textContent = '';
  input.removeAttribute('aria-invalid');
}

function validate() {
  let valid = true;
  const name = form.name;
  const email = form.email;
  const password = form.password;

  clearError(name);
  clearError(email);
  clearError(password);

  if (!name.value || name.value.trim().length < 2) {
    showError(name, 'Informe um nome válido (mín. 2 caracteres)');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    showError(email, 'Informe um email válido');
    valid = false;
  }

  if (!password.value || password.value.length < 6) {
    showError(password, 'Senha mínima de 6 caracteres');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  successBox.hidden = true;
  if (!validate()) return;

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value,
  };

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      form.reset();
      successBox.hidden = false;
    } else {
      const data = await res.json();
      // tenta mostrar o erro no campo apropriado
      if (data && data.error) {
        if (/email/i.test(data.error)) showError(form.email, data.error);
        else if (/nome/i.test(data.error)) showError(form.name, data.error);
        else showError(form.password, data.error);
      }
    }
  } catch (err) {
    showError(form.password, 'Erro de conexão. Tente novamente.');
  }
});
