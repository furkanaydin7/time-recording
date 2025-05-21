//@author EK
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH');
}

function minutesToHHMM(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
