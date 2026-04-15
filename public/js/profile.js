// public/js/profile.js
//
// Fase 12 — Applica le width dinamiche alle progress-bar del profilo
// leggendo l'attributo data-width. Evita dichiarazioni style inline nella view
// (spec esame: "Non utilizzare dichiarazioni CSS/JS in line").

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-width]').forEach((el) => {
        const pct = parseFloat(el.dataset.width);
        if (Number.isFinite(pct)) {
            el.style.width = `${pct}%`;
        }
    });
});
