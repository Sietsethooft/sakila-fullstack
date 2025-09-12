document.addEventListener('DOMContentLoaded', function() {
    // Error delete alert
    if (window.clientError) {
        Swal.fire({
            icon: "error",
            title: "Movie cannot be deleted",
            text: window.clientError
        });
    }

    // Success add alert
    if (window.clientSuccess == 1) {
        Swal.fire({
            title: 'Movie added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success edit alert
    if (window.clientSuccess == 2) {
        Swal.fire({
            title: 'Movie updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success delete alert
    if (window.clientSuccess == 3) {
        Swal.fire({
            title: 'Movie deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
});