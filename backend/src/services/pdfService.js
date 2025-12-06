const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const logger = require('../utils/logger');

// Generar reporte PDF de transacciones
exports.generateTransactionsReport = async (user, transactions, periodo, filtros = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4',
                info: {
                    Title: `Reporte de Transacciones - ${user.nombre}`,
                    Author: 'Finanzas Conductor',
                    Subject: 'Reporte financiero',
                    Keywords: 'finanzas, conductor, reporte, transacciones',
                    Creator: 'Finanzas Conductor App',
                    CreationDate: new Date()
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Logo (si existe)
            try {
                const logoPath = path.join(__dirname, '../assets/logo.png');
                doc.image(logoPath, 50, 45, { width: 50 });
            } catch (error) {
                // Si no hay logo, continuar sin él
            }

            // Título
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('Finanzas Conductor', 110, 50)
                .fontSize(12)
                .font('Helvetica')
                .text('Reporte de Transacciones', 110, 70);

            // Información del usuario
            doc.fontSize(10)
                .text(`Usuario: ${user.nombre}`, 50, 110)
                .text(`Email: ${user.email}`, 50, 125)
                .text(`Período: ${periodo}`, 50, 140)
                .text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, 155);

            // Línea separadora
            doc.moveTo(50, 175)
                .lineTo(550, 175)
                .stroke();

            // Resumen
            let yPos = 190;

            const ingresos = transactions.filter(t => t.tipo === 'ingreso')
                .reduce((sum, t) => sum + t.monto, 0);
            const gastos = transactions.filter(t => t.tipo === 'gasto')
                .reduce((sum, t) => sum + t.monto, 0);
            const ganancias = ingresos - gastos;
            const totalTransacciones = transactions.length;

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('Resumen', 50, yPos);

            yPos += 25;

            doc.fontSize(11)
                .font('Helvetica')
                .text(`Total Ingresos: $${ingresos.toFixed(2)}`, 70, yPos)
                .text(`Total Gastos: $${gastos.toFixed(2)}`, 70, yPos + 15)
                .text(`Ganancias Netas: $${ganancias.toFixed(2)}`, 70, yPos + 30)
                .text(`Total Transacciones: ${totalTransacciones}`, 70, yPos + 45);

            yPos += 70;

            // Tabla de transacciones
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('Detalle de Transacciones', 50, yPos);

            yPos += 25;

            // Encabezados de tabla
            const tableTop = yPos;
            const col1 = 50; // Fecha
            const col2 = 110; // Descripción
            const col3 = 300; // Categoría
            const col4 = 380; // Tipo
            const col5 = 430; // Monto

            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('Fecha', col1, tableTop)
                .text('Descripción', col2, tableTop)
                .text('Categoría', col3, tableTop)
                .text('Tipo', col4, tableTop)
                .text('Monto', col5, tableTop);

            yPos += 20;

            // Línea de encabezado
            doc.moveTo(50, yPos - 5)
                .lineTo(550, yPos - 5)
                .stroke();

            // Filas de transacciones
            doc.fontSize(9).font('Helvetica');

            let row = 0;
            transactions.forEach((transaction, index) => {
                if (yPos > 750) { // Nueva página si se llega al final
                    doc.addPage();
                    yPos = 50;

                    // Reimprimir encabezados
                    doc.fontSize(10).font('Helvetica-Bold')
                        .text('Fecha', col1, yPos)
                        .text('Descripción', col2, yPos)
                        .text('Categoría', col3, yPos)
                        .text('Tipo', col4, yPos)
                        .text('Monto', col5, yPos);

                    yPos += 20;
                    doc.moveTo(50, yPos - 5).lineTo(550, yPos - 5).stroke();
                }

                const fecha = moment(transaction.fecha).format('DD/MM/YY');
                const descripcion = transaction.descripcion.length > 30
                    ? transaction.descripcion.substring(0, 27) + '...'
                    : transaction.descripcion;

                doc.text(fecha, col1, yPos)
                    .text(descripcion, col2, yPos)
                    .text(transaction.categoria, col3, yPos)
                    .text(transaction.tipo === 'ingreso' ? 'Ingreso' : 'Gasto', col4, yPos)
                    .text(`$${transaction.monto.toFixed(2)}`, col5, yPos);

                // Colores para ingresos/gastos
                if (transaction.tipo === 'ingreso') {
                    doc.fillColor('#2ECC71');
                } else {
                    doc.fillColor('#E74C3C');
                }

                doc.text(transaction.tipo === 'ingreso' ? '▲' : '▼', col5 + 50, yPos);
                doc.fillColor('#000000');

                yPos += 15;
                row++;
            });

            // Pie de página
            const totalPages = doc.bufferedPageRange().count;

            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);

                // Número de página
                doc.fontSize(8)
                    .text(`Página ${i + 1} de ${totalPages}`, 500, 800);

                // Firma
                doc.text('Finanzas Conductor - Reporte generado automáticamente', 50, 800);
            }

            doc.end();

        } catch (error) {
            logger.error('Error generando PDF:', error);
            reject(error);
        }
    });
};

// Generar reporte de estadísticas
exports.generateStatsReport = async (user, stats, periodo) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Título
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('Reporte de Estadísticas', 50, 50);

            // Información
            doc.fontSize(12)
                .font('Helvetica')
                .text(`Usuario: ${user.nombre}`, 50, 90)
                .text(`Período: ${periodo}`, 50, 105)
                .text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, 120);

            let yPos = 150;

            // Resumen general
            doc.fontSize(14).font('Helvetica-Bold').text('Resumen General', 50, yPos);
            yPos += 30;

            doc.fontSize(11).font('Helvetica')
                .text(`Total Ingresos: $${stats.totales.totalIngresos?.toFixed(2) || '0.00'}`, 70, yPos);
            yPos += 15;
            doc.text(`Total Gastos: $${stats.totales.totalGastos?.toFixed(2) || '0.00'}`, 70, yPos);
            yPos += 15;
            doc.text(`Ganancias Netas: $${stats.totales.totalGanancias?.toFixed(2) || '0.00'}`, 70, yPos);
            yPos += 15;
            doc.text(`Total Viajes: ${stats.totales.totalViajes || 0}`, 70, yPos);
            yPos += 15;
            doc.text(`Total Transacciones: ${stats.totales.totalTransacciones || 0}`, 70, yPos);

            yPos += 40;

            // Distribución por categoría
            if (stats.porCategoria.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Distribución por Categoría', 50, yPos);
                yPos += 25;

                stats.porCategoria.forEach(item => {
                    if (yPos > 750) {
                        doc.addPage();
                        yPos = 50;
                    }

                    const tipo = item._id.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
                    doc.fontSize(10).font('Helvetica')
                        .text(`${tipo} - ${item._id.categoria}: $${item.total.toFixed(2)} (${item.count} transacciones)`, 70, yPos);

                    yPos += 15;
                });

                yPos += 20;
            }

            // Gráfico de barras simple (texto)
            if (stats.porDia.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Tendencia Diaria', 50, yPos);
                yPos += 25;

                // Mostrar solo últimos 7 días
                const ultimos7Dias = stats.porDia.slice(0, 7).reverse();

                ultimos7Dias.forEach(dia => {
                    if (yPos > 750) {
                        doc.addPage();
                        yPos = 50;
                    }

                    doc.fontSize(9).font('Helvetica')
                        .text(`${dia._id}:`, 70, yPos);

                    // Barras simples
                    const maxVal = Math.max(...ultimos7Dias.map(d => Math.max(d.ingresos, d.gastos)));
                    const barWidth = 200;

                    if (dia.ingresos > 0) {
                        const barLength = (dia.ingresos / maxVal) * barWidth;
                        doc.fillColor('#2ECC71')
                            .rect(150, yPos - 3, barLength, 8)
                            .fill();
                        doc.fillColor('#000000')
                            .text(` $${dia.ingresos.toFixed(2)}`, 150 + barLength + 5, yPos);
                    }

                    yPos += 12;

                    if (dia.gastos > 0) {
                        const barLength = (dia.gastos / maxVal) * barWidth;
                        doc.fillColor('#E74C3C')
                            .rect(150, yPos - 3, barLength, 8)
                            .fill();
                        doc.fillColor('#000000')
                            .text(` $${dia.gastos.toFixed(2)}`, 150 + barLength + 5, yPos);
                    }

                    yPos += 20;
                });
            }

            // Insights
            yPos += 30;
            doc.fontSize(14).font('Helvetica-Bold').text('Análisis y Recomendaciones', 50, yPos);
            yPos += 25;

            const insights = [
                `• Tu mejor día fue con $${stats.totales.mejorDia?.monto || 0} en ingresos`,
                `• La categoría de mayor gasto es ${stats.totales.categoriaMayorGasto?.categoria || 'N/A'} con $${stats.totales.categoriaMayorGasto?.monto || 0}`,
                `• Promedio diario de ganancias: $${((stats.totales.totalIngresos - stats.totales.totalGastos) / 30).toFixed(2)}`,
                `• Eficiencia: ${(((stats.totales.totalIngresos - stats.totales.totalGastos) / stats.totales.totalGastos) * 100).toFixed(1)}%`
            ];

            insights.forEach(insight => {
                if (yPos > 750) {
                    doc.addPage();
                    yPos = 50;
                }

                doc.fontSize(10).font('Helvetica').text(insight, 70, yPos);
                yPos += 15;
            });

            doc.end();

        } catch (error) {
            logger.error('Error generando reporte de estadísticas:', error);
            reject(error);
        }
    });
};

// Guardar PDF en disco
exports.savePDF = async (pdfData, filename) => {
    try {
        const reportsDir = path.join(__dirname, '../reports');

        // Crear directorio si no existe
        await fs.mkdir(reportsDir, { recursive: true });

        const filePath = path.join(reportsDir, filename);
        await fs.writeFile(filePath, pdfData);

        return filePath;
    } catch (error) {
        logger.error('Error guardando PDF:', error);
        throw error;
    }
};
