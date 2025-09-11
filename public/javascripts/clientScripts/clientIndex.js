document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.client-row').forEach(row => {
        row.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.location.href = `/clientManagement/${id}`;
        });
    });

    const addBtn = document.getElementById('add-client-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '/clientManagement/create';
        });
    }
});