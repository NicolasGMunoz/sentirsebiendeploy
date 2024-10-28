import PDFDocument from 'pdfkit';

export function buildPDF(pago, dataCallback, endCallback) {
    const doc = new PDFDocument();

    // Escuchar eventos para enviar los datos PDF en trozos
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // Añadir contenido al PDF (modifica esta parte según lo que quieras incluir)
    doc.fontSize(18).text('Recibo de Pago', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número de Pago: ${pago.numeropago}`);
    doc.text(`Nombre del Cliente: ${pago.nombrecliente}`);
    doc.text(`Monto: $${pago.monto}`);
    doc.text(`Medio de Pago: ${pago.mediodepago}`);
    doc.text(`Fecha de Pago: ${pago.fecha}`);
    doc.text(`Servicio: ${pago.servicio}`);
    doc.text(`Profesional: ${pago.profesional}`);

    // Finalizar el PDF
    doc.end();
}
