document.addEventListener('DOMContentLoaded', function() {
  const deleteBtn = document.getElementById('delete-client-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      Swal.fire({
        title: 'Weet je zeker dat je deze klant wilt verwijderen?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ja, verwijderen',
        cancelButtonText: 'Annuleren',
        confirmButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          document.getElementById('delete-client-form').submit();
        }
      });
    });
  }
});