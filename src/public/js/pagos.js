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