import PDFDocument from 'pdfkit';

export function buildPDF(pago, dataCallback, endCallback) {
    const doc = new PDFDocument();

    // Escuchar eventos para enviar los datos PDF en trozos
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // // Añadir contenido al PDF (modifica esta parte según lo que quieras incluir)
    // doc.fontSize(18).text('Recibo de Pago', { align: 'center' });
    // doc.moveDown();
    // doc.fontSize(12).text(`Número de Pago: ${pago.numeropago}`);
    // doc.text(`Nombre del Cliente: ${pago.nombrecliente}`);
    // doc.text(`Monto: $${pago.monto}`);
    // doc.text(`Medio de Pago: ${pago.mediodepago}`);
    // doc.text(`Fecha de Pago: ${pago.fecha}`);
    // doc.text(`Servicio: ${pago.servicio}`);
    // doc.text(`Profesional: ${pago.profesional}`);

        // === Agregar imagen en el encabezado ===
        doc.image('./src/public/assets/logo header.jpg', { fit: [100, 100], align: 'center', valign: 'top' });
        doc.moveDown(1);

        // === Título centrado ===
        doc.fontSize(20).text('Recibo de Pago', { align: 'center' });
        doc.moveDown(2);  
    
        const tableData = [
            ['Número de Pago', pago.numeropago],
            ['Nombre del Cliente', pago.nombrecliente],
            ['Monto', `$${pago.monto}`],
            ['Medio de Pago', pago.mediodepago],
            ['Fecha de Pago', pago.fecha],
            ['Servicio', pago.servicio],
            ['Profesional', pago.profesional],
        ];
    
        tableData.forEach(([label, value], index) => {
            doc.font('Helvetica-Bold').text(label + ':', { continued: true }).font('Helvetica').text(` ${value}`);
            doc.moveDown(0.8);
            if (index < tableData.length - 1) {
                doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

                doc.moveDown(0.8);
            }
        });

    // Finalizar el PDF
    doc.end();
}
