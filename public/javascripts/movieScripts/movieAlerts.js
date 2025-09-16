document.addEventListener('DOMContentLoaded', function() {
    // Error delete alert
    if (window.movieError) {
        Swal.fire({
            icon: "error",
            title: "Movie cannot be deleted",
            text: window.movieError
        });
    }

    // Success add alert
    if (window.movieSuccess == 1) {
        Swal.fire({
            title: 'Movie added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success edit alert
    if (window.movieSuccess == 2) {
        Swal.fire({
            title: 'Movie updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    // Success delete alert
    if (window.movieSuccess == 3) {
        Swal.fire({
            title: 'Movie deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
});