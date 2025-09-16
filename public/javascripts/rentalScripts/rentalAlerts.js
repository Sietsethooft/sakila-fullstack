document.addEventListener('DOMContentLoaded', function() {
    // Success add alert
    if (window.rentalSuccess == 1) {
        Swal.fire({
            title: 'Rental added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success close alert
    if (window.rentalSuccess == 3) {
        Swal.fire({
            title: 'Rental closed successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
});