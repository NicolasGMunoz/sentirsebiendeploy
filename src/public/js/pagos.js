function updatePaymentOptions() {
    const paymentOptions = document.getElementById("paymentOptions");
    paymentOptions.innerHTML = ""; // Limpiar opciones

    
    const cardType = document.getElementById("cardType").value;
    
    if (cardType === "Crédito") {
        const option1 = document.createElement("option");
        option1.value = "1";
        option1.textContent = "1 cuota";
        paymentOptions.appendChild(option1);

        const option3 = document.createElement("option");
        option3.value = "3";
        option3.textContent = "3 cuotas";
        paymentOptions.appendChild(option3);
    } else if (cardType === "Débito") {
        const option1 = document.createElement("option");
        option1.value = "1";
        option1.textContent = "1 cuota";
        paymentOptions.appendChild(option1);
    }
}

document.getElementById('pagoForm').addEventListener('submit', async function (e) {
    e.preventDefault(); 
    const mediopago = document.getElementById('cardType').value;
    const numeropago = document.getElementById('numeropago').value;
    try {
        const response = await fetch(`/pago/${numeropago}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mediodepago: mediopago }) 
        });

        const data = await response.json();

        if (data.success) {
            alert('Pago realizado con éxito');
            window.location.href = '/turnos';  // Redirigir después del éxito
        } else {
            alert(data.message);  // Mostrar el mensaje de error
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al intentar pagar.');
    }
});