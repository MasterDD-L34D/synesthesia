// public/js/admin-dashboard.js
//
// Fase 12 — Modulo per la dashboard admin. Popola il modale "Modifica Challenge"
// con i dati della riga cliccata. Sostituisce lo <script> inline nella view.

class AdminDashboard {
    constructor() {
        this.editChallengeModal = document.getElementById('editChallengeModal');
        if (!this.editChallengeModal) return;

        this.editChallengeModal.addEventListener('show.bs.modal', (event) =>
            this.handleEditModalShow(event)
        );
    }

    handleEditModalShow(event) {
        const button = event.relatedTarget;
        if (!button) return;

        const id = button.getAttribute('data-id');
        const title = button.getAttribute('data-title');
        const description = button.getAttribute('data-description');
        const startDate = button.getAttribute('data-startdate');
        const endDate = button.getAttribute('data-enddate');
        const isActive = button.getAttribute('data-isactive') === '1';

        const modal = this.editChallengeModal;
        modal.querySelector('.modal-title').textContent = `Modifica Challenge #${id}`;
        modal.querySelector('#editChallengeForm').action = `/admin/challenges/${id}`;
        modal.querySelector('#editChallengeTitle').value = title;
        modal.querySelector('#editChallengeDescription').value = description;
        modal.querySelector('#editStartDate').value = startDate;
        modal.querySelector('#editEndDate').value = endDate;
        modal.querySelector('#editIsActive').checked = isActive;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
