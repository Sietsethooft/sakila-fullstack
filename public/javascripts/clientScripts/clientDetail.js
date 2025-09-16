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

document.addEventListener('click', function (e) {
    const btn = e.target.closest('.return-rental');
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No rental ID found on the row.'
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure you want to close this rental?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, close',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const form = document.getElementById('close-rental-form');
        form.action = `/rentalManagement/${id}/close`;
        form.submit();
      }
    });
  });