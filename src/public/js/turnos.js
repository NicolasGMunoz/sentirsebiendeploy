document.getElementById('turnos').addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que el formulario se envíe por defecto

    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const servicioID = document.getElementById('servicio').value;
    const precio = document.getElementById('precio').value;
    const profesional = document.getElementById('profesional').value;
    const nombre = document.getElementById('nombre').value;
    
    const servicio = document.getElementById('servicio').options[document.getElementById('servicio').selectedIndex].innerText.trim();

    const [year, month, day] = fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;
    const fechayhora = `${fechaFormateada} ${hora}`;
    const obtenerFechaLimite = () => {
        const fechaActual = new Date();
        fechaActual.setDate(fechaActual.getDate() + 2);
        const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');  // Añadir ceros a la izquierda si es necesario
    const day = String(fechaActual.getDate()).padStart(2, '0');
    const hours = String(fechaActual.getHours()).padStart(2, '0');
    const minutes = String(fechaActual.getMinutes()).padStart(2, '0');

    // Formatear la fecha en DD/MM/YYYY HH:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    try {
        const response = await fetch('/turnos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fechayhora,servicio,servicioID, profesional, nombre,precio,fechalimite: obtenerFechaLimite()})
        });

        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al intentar solicitar el turno.');
    }
});
