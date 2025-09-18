document.addEventListener('DOMContentLoaded', function() {
    // Error delete alert
    if (window.clientError) {
        Swal.fire({
            icon: "error",
            title: "Client cannot be deleted",
            text: window.clientError
        });
    }

    // Success add alert
    if (window.clientSuccess == 1) {
        Swal.fire({
            title: 'Client added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success edit alert
    if (window.clientSuccess == 2) {
        Swal.fire({
            title: 'Client updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success delete alert
    if (window.clientSuccess == 3) {
        Swal.fire({
            title: 'Client deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success close rental alert
    if (window.clientSuccess == 4) {
        Swal.fire({
            title: 'Rental closed successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success add rental alert
    if (window.clientSuccess == 5) {
        Swal.fire({
            title: 'Rental added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
});