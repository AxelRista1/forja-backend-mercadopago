document.addEventListener('DOMContentLoaded', () => {

  const API_URL = "https://forja-backend-mercadopago.onrender.com";

  const botones = document.querySelectorAll('.btn-rutina');
  const modal = document.getElementById('modal-compra');
  const cerrar = document.querySelector('.cerrar-modal');

  const titulo = document.getElementById('modal-titulo');
  const descripcion = document.getElementById('modal-descripcion');
  const btnPagar = document.getElementById('btn-pagar');

  botones.forEach(btn => {
    btn.addEventListener('click', () => {

      const opcion = btn.closest('.opcion-rutina');
      const nombreRutina = opcion.querySelector('h3').textContent;

      titulo.textContent = nombreRutina;
      descripcion.textContent = 'Rutina personalizada de FORJA TRAINING';
      modal.style.display = 'flex';
    });
  });

  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnPagar.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_URL}/crear-preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rutina: titulo.textContent })
      });

      const data = await res.json();
      window.location.href = data.init_point;

    } catch (err) {
      console.error(err);
      alert("Error al iniciar el pago");
    }
  });

});