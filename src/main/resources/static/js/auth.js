//@author EK
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const res = await api('/auth/login', 'POST', { email: email, password: password });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('isAdmin', res.user.role === 'ADMIN');
                window.location.href = 'dashboard.html';
            } catch (err) {
                document.getElementById('error-msg').textContent = err.message;
                document.getElementById('error-msg').classList.remove('hidden');
            }
        });
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
