const ExcelJS = require('exceljs');

exports.generateExcelReport = async (transactions, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transacciones');

    worksheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Monto', key: 'monto', width: 15 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Descripción', key: 'descripcion', width: 30 },
        { header: 'Método Pago', key: 'metodoPago', width: 15 }
    ];

    transactions.forEach(t => {
        worksheet.addRow({
            fecha: t.fecha.toISOString().split('T')[0],
            tipo: t.tipo,
            monto: t.monto,
            categoria: t.categoria,
            descripcion: t.descripcion,
            metodoPago: t.metodoPago
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'reporte.xlsx');

    await workbook.xlsx.write(res);
    res.end();
};

exports.generateExcel = async (transactions) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transacciones');

    worksheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Monto', key: 'monto', width: 15 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Descripción', key: 'descripcion', width: 30 },
        { header: 'Método Pago', key: 'metodoPago', width: 15 }
    ];

    transactions.forEach(t => {
        worksheet.addRow({
            fecha: t.fecha ? new Date(t.fecha).toISOString().split('T')[0] : '',
            tipo: t.tipo,
            monto: t.monto,
            categoria: t.categoria,
            descripcion: t.descripcion,
            metodoPago: t.viaje?.metodoPago || ''
        });
    });

    return await workbook.xlsx.writeBuffer();
};
