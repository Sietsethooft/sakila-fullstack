document.addEventListener('DOMContentLoaded', function() {
  const deleteBtn = document.getElementById('delete-client-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      Swal.fire({
        title: 'Are you sure you want to delete this client?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          document.getElementById('delete-client-form').submit();
        }
      });
    });
  }
});