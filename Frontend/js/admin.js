//@author EK
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();

    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = {
            userName: document.getElementById('new-username').value,
            password: document.getElementById('new-password').value,
            role: document.getElementById('new-role').value
        };

        try {
            await api('/user/register', 'POST', user);
            document.getElementById('admin-feedback').textContent = 'Benutzer erstellt';
            document.getElementById('admin-feedback').classList.remove('hidden');
            e.target.reset();
            await loadUsers();
        } catch (err) {
            alert('Fehler beim Erstellen: ' + err.message);
        }
    });
});

async function loadUsers() {
    try {
        const data = await api('/user');
        const list = document.getElementById('user-list');
        list.innerHTML = '';

        data.users.forEach(u => {
            const li = document.createElement('li');
            li.textContent = `${u.userName} (ID: ${u.id})`;
            list.appendChild(li);
        });
    } catch (e) {
        console.error('Fehler beim Laden der Benutzerliste:', e);
    }
}
