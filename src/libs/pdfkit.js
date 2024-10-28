import PDFDocument from 'pdfkit-table';

export function buildPDF(dataCallback,endCallback){
    const doc = new PDFDocument();
    doc.on('data', dataCallback)
    doc.on('end', endCallback)
    doc.text('PDF de prueba Gabi re puto')
    doc.end();
}

