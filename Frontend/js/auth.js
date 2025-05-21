//@author EK
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const res = await api('/user/login', 'POST', { userName: username, password });
                localStorage.setItem('token', res.token);
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
