//@author EK
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const rows = await api('/worktime');
        const tbody = document.querySelector('#time-table tbody');

        rows.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.plannedTime}</td>
        <td>${entry.actualTime}</td>
        <td>${entry.difference}</td>
      `;
            tbody.appendChild(row);
        });

        // Admin-Link anzeigen, wenn Rolle bekannt
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            document.getElementById('admin-link').classList.remove('hidden');
        }
    } catch (e) {
        alert('Fehler beim Laden der Arbeitszeiten');
        console.error(e);
    }
});
