document.addEventListener('DOMContentLoaded', function() {
    // Error delete alert
    if (window.clientError) {
        Swal.fire({
        icon: "error",
        title: "Klant kan niet worden verwijderd",
        text: window.clientError
        });
    }

    // Success add alert
    if (window.clientSuccess == 1) {
        Swal.fire({
        title: 'Klant succesvol toegevoegd!',
        icon: 'success',
        confirmButtonText: 'OK'
        });
    }

    // Success edit alert
    if (window.clientSuccess == 2) {
        Swal.fire({
            title: 'Klant succesvol bijgewerkt!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success delete alert
    if (window.clientSuccess == 3) {
        Swal.fire({
            title: 'Klant succesvol verwijderd!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
});