//@author EK
document.getElementById('time-entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        date: document.getElementById('date').value,
        startTime: document.getElementById('start').value,
        endTime: document.getElementById('end').value,
        breakMinutes: parseInt(document.getElementById('break').value || '0')
    };

    try {
        await api('/worktime', 'POST', payload);
        const feedback = document.getElementById('feedback');
        feedback.textContent = 'Eintrag gespeichert';
        feedback.classList.remove('hidden');
        e.target.reset();
    } catch (err) {
        alert('Fehler beim Speichern: ' + err.message);
    }
});
