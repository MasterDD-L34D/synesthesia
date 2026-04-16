// public/js/image-zoom.js
//
// Batch D 4.4 — Lightbox zoom per immagini delle opere.
// Click su immagine entry-detail → overlay fullscreen.
// Long-press (300ms) su card thumbnail → overlay temporaneo (rilascio chiude).
// Tap/click sull'overlay → chiude.
// Escape → chiude.
// Nessuna dipendenza esterna.

class ImageZoom {
    constructor() {
        this.overlay = null;
        this.longPressTimer = null;
        this.isLongPress = false;
        this.init();
    }

    init() {
        // Entry detail: click su immagine principale → lightbox
        const detailImg = document.querySelector('.entry-detail-image');
        if (detailImg) {
            detailImg.classList.add('zoom-cursor');
            detailImg.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(detailImg.src, detailImg.alt);
            });
        }

        // Card thumbnails: long-press → lightbox temporaneo
        document.querySelectorAll('.entry-card-img-top').forEach((img) => {
            img.addEventListener('pointerdown', (e) => this.startLongPress(e, img));
            img.addEventListener('pointerup', () => this.cancelLongPress());
            img.addEventListener('pointerleave', () => this.cancelLongPress());
            img.addEventListener('pointercancel', () => this.cancelLongPress());
        });

        // Escape chiude
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay) this.close();
        });
    }

    startLongPress(e, img) {
        this.isLongPress = false;
        this.longPressTimer = setTimeout(() => {
            this.isLongPress = true;
            e.preventDefault();
            this.open(img.src, img.alt);
        }, 300);
    }

    cancelLongPress() {
        clearTimeout(this.longPressTimer);
        if (this.isLongPress && this.overlay) {
            this.close();
            this.isLongPress = false;
        }
    }

    open(src, alt) {
        if (this.overlay) this.close();

        this.overlay = document.createElement('div');
        this.overlay.className = 'image-zoom-overlay';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-label', alt || 'Zoom immagine');

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt || '';
        img.className = 'image-zoom-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-zoom-close';
        closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        closeBtn.setAttribute('aria-label', 'Chiudi');

        this.overlay.appendChild(img);
        this.overlay.appendChild(closeBtn);
        document.body.appendChild(this.overlay);

        // Prevent scroll
        document.body.classList.add('zoom-active');

        // Click overlay o bottone → chiudi
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target === closeBtn || closeBtn.contains(e.target)) {
                this.close();
            }
        });

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.add('image-zoom-visible');
        });
    }

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('image-zoom-visible');
        document.body.classList.remove('zoom-active');
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
        }, 200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageZoom();
});
