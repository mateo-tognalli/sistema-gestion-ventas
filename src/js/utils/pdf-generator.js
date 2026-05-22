const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
// ipcRenderer está disponible globalmente desde db-helper.js

class PDFGenerator {
    static async generarComprobante(venta, detalles) {
        // 0 = Guardar PDF, 1 = Imprimir, 2 = Cancelar
        const choice = await window.ipcRenderer.invoke('show-comprobante-options');
        if (choice === 2) return null;

        const fileName = `Comprobante_${venta.id_venta}_${Date.now()}.pdf`;
        let filePath;
        let isTemp = false;

        if (choice === 0) {
            const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
                title: 'Guardar comprobante',
                defaultPath: fileName,
                filters: [{ name: 'PDF', extensions: ['pdf'] }]
            });
            if (dialogResult.canceled || !dialogResult.filePath) return null;
            filePath = dialogResult.filePath;
        } else {
            // Imprimir: guardar PDF temporal en Descargas
            const downloadsPath = await window.ipcRenderer.invoke('get-downloads-path');
            filePath = path.join(downloadsPath, `tmp_${fileName}`);
            isTemp = true;
        }

        await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A6', margin: 30 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            PDFGenerator._fillPDFContent(doc, venta, detalles); // _fillPDFContent llama doc.end() internamente
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        if (isTemp) {
            await window.ipcRenderer.invoke('print-pdf', filePath);
            return 'printed';
        }

        return filePath;
    }

    // Guarda el comprobante PDF en la ruta indicada sin mostrar ningún diálogo.
    // Usado por operaciones-view para guardar/imprimir tras confirmar la venta.
    static _savePDFToPath(venta, detalles, filePath) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A6', margin: 30 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            PDFGenerator._fillPDFContent(doc, venta, detalles); // _fillPDFContent llama doc.end() internamente
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }

    static _fillPDFContent(doc, venta, detalles) {
        // Header
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('LUISINA VESTIDOS', { align: 'center' })
           .fontSize(10)
           .font('Helvetica')
           .text('Comprobante de Venta', { align: 'center' })
           .moveDown();

        doc.moveTo(30, doc.y).lineTo(267, doc.y).stroke().moveDown();

        // Información de la venta
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text(`N° de Venta: ${venta.id_venta}`)
           .moveDown(0.1)
           .font('Helvetica')
           .text(`Fecha: ${formatDate(venta.fecha_venta)}`)
           .moveDown(0.1)
           .text(`Atendido por: ${venta.usuario_venta}`)
           .moveDown(0.1);

        if (venta.nombre_cliente) {
            doc.font('Helvetica-Bold').text('Cliente: ', { continued: true })
               .font('Helvetica').text(venta.nombre_cliente);
        }
        doc.moveDown();

        // Tabla de productos
        doc.font('Helvetica-Bold').text('DETALLE DE PRODUCTOS').moveDown(0.5);
        doc.moveTo(30, doc.y).lineTo(267, doc.y).stroke().moveDown(0.5);

        detalles.forEach(detalle => {
            const yPos = doc.y;
            doc.font('Helvetica').fontSize(8)
               .text(`${detalle.nombre_vestido}`, 30, yPos, { width: 150 })
               .text(`Cant:${detalle.cantidad}`, 180, yPos, { width: 80, align: 'right' });
            doc.fontSize(7).fillColor('#666666')
               .text(`Código: ${detalle.codigo_vestido}`, 30, doc.y)
               .fillColor('#000000').fontSize(8)
               .text(`${formatCurrency(detalle.subtotal)}`, 180, doc.y - 10, { width: 80, align: 'right' })
               .moveDown(0.5);
        });

        doc.moveTo(30, doc.y).lineTo(267, doc.y).stroke().moveDown(0.5);

        // Total y forma de pago
        if (venta.descuento > 0) {
            const subtotalOriginal = detalles.reduce((sum, d) => sum + parseFloat(d.subtotal || 0), 0);
            const montoDescuento = subtotalOriginal - parseFloat(venta.total);
            doc.fontSize(9).font('Helvetica')
               .text('Subtotal: ', 30, doc.y, { continued: true })
               .text(formatCurrency(subtotalOriginal))
               .moveDown(0.2);
            doc.fontSize(9).font('Helvetica')
               .text(`Descuento (${parseInt(venta.descuento)}%): `, 30, doc.y, { continued: true })
               .text(`-${formatCurrency(montoDescuento)}`)
               .moveDown(0.2);
        }
        doc.fontSize(10).font('Helvetica-Bold')
           .text('TOTAL: ', 30, doc.y, { continued: true })
           .text(formatCurrency(venta.total))
           .moveDown(0.3);
        doc.fontSize(9).font('Helvetica')
           .text('Forma de pago: ', 30, doc.y, { continued: true })
           .text(venta.forma_pago)
           .moveDown(0.3);

        doc.fontSize(8).text('¡Gracias por su compra!', 30, doc.y);
        doc.end();
    }

    static async generarReporte(titulo, datos, columnas, tipo = 'general', periodo = '', extraData = null) {
        const fileName = `Reporte_${tipo}_${Date.now()}.pdf`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: `Guardar ${titulo}`,
            defaultPath: fileName,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Header
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('LUISINA VESTIDOS', { align: 'center' })
                   .fontSize(14)
                   .text(titulo, { align: 'center' })
                   .fontSize(10)
                   .font('Helvetica');
                if (periodo) doc.text(`Período: ${periodo}`, { align: 'center' });
                doc.text(`Fecha de generación: ${formatDate(new Date())}`, { align: 'center' })
                   .moveDown(1.5);

                // Resumen opcional (extraData)
                if (extraData) {
                    Object.entries(extraData).forEach(([k, v]) => {
                        doc.font('Helvetica-Bold').fontSize(9).text(`${k}: `, { continued: true })
                           .font('Helvetica').text(String(v));
                    });
                    doc.moveDown(1);
                }

                // Contenido del reporte
                if (Array.isArray(datos) && datos.length > 0) {
                    let y = doc.y;
                    const colWidth = (doc.page.width - 100) / columnas.length;

                    doc.font('Helvetica-Bold').fontSize(10);
                    columnas.forEach((col, i) => {
                        doc.text(col.label, 50 + (i * colWidth), y, { width: colWidth, align: 'left' });
                    });
                    y += 20;
                    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
                    y += 10;

                    doc.font('Helvetica').fontSize(9);
                    datos.forEach(row => {
                        columnas.forEach((col, i) => {
                            const value = row[col.field] !== undefined ? row[col.field].toString() : '';
                            doc.text(value, 50 + (i * colWidth), y, { width: colWidth, align: 'left' });
                        });
                        y += 25;
                        if (y > doc.page.height - 100) {
                            doc.addPage();
                            y = 50;
                        }
                    });
                } else {
                    doc.text('No hay datos para mostrar', { align: 'center' });
                }

                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    static async generarReporteTodo(datos) {
        const fileName = `Reportes_Completos_${Date.now()}.pdf`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar reportes completos',
            defaultPath: fileName,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                const leftMargin = 50;
                const rightMargin = 50;
                const pageContentWidth = doc.page.width - leftMargin - rightMargin;

                // === ENCABEZADO ===
                doc.fontSize(22).font('Helvetica-Bold').text('LUISINA VESTIDOS', { align: 'center' })
                   .fontSize(16).text('Reportes Completos', { align: 'center' })
                   .fontSize(10).font('Helvetica').text(`Período: ${datos.periodo}`, { align: 'center' })
                   .text(`Generado: ${formatDate(new Date())}`, { align: 'center' })
                   .moveDown(1.5);

                const drawSectionTitle = (titulo) => {
                    if (doc.y > doc.page.height - 150) doc.addPage();
                    doc.fontSize(13).font('Helvetica-Bold').text(titulo, leftMargin).moveDown(0.3);
                    doc.moveTo(leftMargin, doc.y).lineTo(doc.page.width - rightMargin, doc.y).stroke().moveDown(0.5);
                };

                const drawTable = (columnas, filas) => {
                    const colWidth = pageContentWidth / columnas.length;
                    let y = doc.y;
                    doc.font('Helvetica-Bold').fontSize(9);
                    columnas.forEach((col, i) => {
                        doc.text(col.label, leftMargin + i * colWidth, y, { width: colWidth, align: 'left' });
                    });
                    y += 16;
                    doc.moveTo(leftMargin, y).lineTo(doc.page.width - rightMargin, y).stroke();
                    y += 6;
                    doc.font('Helvetica').fontSize(8);
                    filas.forEach(fila => {
                        if (y > doc.page.height - 80) {
                            doc.addPage();
                            y = 50;
                        }
                        columnas.forEach((col, i) => {
                            const val = fila[col.field] !== undefined ? String(fila[col.field]) : '';
                            doc.text(val, leftMargin + i * colWidth, y, { width: colWidth - 4, align: 'left' });
                        });
                        y += 20;
                    });
                    doc.text('', leftMargin, y + 4);
                    doc.moveDown(1);
                };

                const sinDatos = () => {
                    doc.fontSize(9).font('Helvetica').text('Sin datos en el período seleccionado').moveDown(1);
                };

                // === SECCIÓN 1: Ingresos por Período ===
                drawSectionTitle('Ingresos por Período');
                if (datos.resumenIngresos) {
                    const r = datos.resumenIngresos;
                    [
                        ['Total de Ventas', String(r.total_ventas)],
                        ['Ingresos Totales', r.total_ingresos],
                        ['Promedio por Venta', r.promedio_venta],
                        ['Venta Mínima', r.venta_minima],
                        ['Venta Máxima', r.venta_maxima]
                    ].forEach(([label, valor]) => {
                        doc.font('Helvetica-Bold').fontSize(9).text(label + ': ', leftMargin, doc.y, { continued: true })
                           .font('Helvetica').text(valor);
                    });
                    doc.moveDown(0.8);
                    doc.font('Helvetica-Bold').fontSize(10).text('Detalle diario:', leftMargin).moveDown(0.3);
                }
                if (datos.ingresos.length > 0) {
                    drawTable(
                        [{ label: 'Fecha', field: 'fecha' }, { label: 'Ventas', field: 'cantidad_ventas' }, { label: 'Ingresos', field: 'total_ingresos' }],
                        datos.ingresos
                    );
                } else { sinDatos(); }

                // === SECCIÓN 2: Top 10 Vestidos ===
                drawSectionTitle('Top 10 Vestidos Más Vendidos');
                if (datos.vestidos.length > 0) {
                    drawTable(
                        [{ label: 'Código', field: 'codigo' }, { label: 'Nombre', field: 'nombre' }, { label: 'Categoría', field: 'categoria_nombre' }, { label: 'Vendidos', field: 'total_vendido' }, { label: 'Ingresos', field: 'total_ingresos' }],
                        datos.vestidos
                    );
                } else { sinDatos(); }

                // === SECCIÓN 3: Top 10 Clientes ===
                drawSectionTitle('Top 10 Clientes');
                if (datos.clientes.length > 0) {
                    drawTable(
                        [{ label: 'Cliente', field: 'nombre' }, { label: 'Compras', field: 'total_compras' }, { label: 'Total Gastado', field: 'total_gastado' }],
                        datos.clientes
                    );
                } else { sinDatos(); }

                // === SECCIÓN 4: Top 10 Vendedores ===
                drawSectionTitle('Top 10 Vendedores');
                if (datos.vendedores.length > 0) {
                    drawTable(
                        [{ label: 'Vendedor', field: 'usuario_venta' }, { label: 'Ventas', field: 'total_ventas' }, { label: 'Ingresos', field: 'total_ingresos' }],
                        datos.vendedores
                    );
                } else { sinDatos(); }

                // === SECCIÓN 5: Ventas por Forma de Pago ===
                drawSectionTitle('Ventas por Forma de Pago');
                if (datos.formaPago.length > 0) {
                    drawTable(
                        [{ label: 'Forma de Pago', field: 'forma_pago' }, { label: 'Cantidad', field: 'cantidad_ventas' }, { label: 'Total Ingresos', field: 'total_ingresos' }, { label: 'Porcentaje', field: 'porcentaje' }],
                        datos.formaPago
                    );
                } else { sinDatos(); }

                // === SECCIÓN 6: Gráficos (3 por página) ===
                if (datos.graficos.length > 0) {
                    doc.addPage();
                    const imgW = pageContentWidth;
                    const imgH = 230;
                    const titleH = 18;
                    const spacer = 14;
                    const slotH = titleH + imgH + spacer;
                    const slotsPerPage = 3;

                    datos.graficos.forEach((grafico, i) => {
                        if (i > 0 && i % slotsPerPage === 0) doc.addPage();
                        const slot = i % slotsPerPage;
                        const yTitle = 50 + slot * slotH;
                        const yImg = yTitle + titleH;
                        doc.fontSize(11).font('Helvetica-Bold')
                           .text(grafico.titulo, leftMargin, yTitle, { width: imgW, align: 'center' });
                        const base64 = grafico.dataUrl.replace(/^data:image\/png;base64,/, '');
                        const buf = Buffer.from(base64, 'base64');
                        doc.image(buf, leftMargin, yImg, { fit: [imgW, imgH], align: 'center' });
                    });
                }

                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async generarGraficosReporte(imagenes, periodo = '') {
        const fileName = `Graficos_${Date.now()}.pdf`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar gráficos',
            defaultPath: fileName,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                doc.fontSize(20).font('Helvetica-Bold').text('LUISINA VESTIDOS', { align: 'center' })
                   .fontSize(14).text('Reportes - Gráficos', { align: 'center' })
                   .fontSize(10).font('Helvetica');
                if (periodo) doc.text(`Período: ${periodo}`, { align: 'center' });
                doc.text(`Generado: ${formatDate(new Date())}`, { align: 'center' })
                   .moveDown(2);

                const maxW = doc.page.width - 100;

                imagenes.forEach((img, i) => {
                    if (i > 0) doc.addPage();
                    doc.fontSize(14).font('Helvetica-Bold').text(img.titulo, { align: 'center' }).moveDown(0.5);
                    const base64 = img.dataUrl.replace(/^data:image\/png;base64,/, '');
                    const buf = Buffer.from(base64, 'base64');
                    doc.image(buf, 50, doc.y, { fit: [maxW, 380], align: 'center' });
                });

                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async pedirFormato() {
        const result = await window.ipcRenderer.invoke('show-export-format-dialog');
        return result; // 0=PDF, 1=Excel, 2=Cancelar
    }

    static async generarExcel(titulo, datos, columnas, tipo, extraData = null, periodo = '') {
        const fileName = `Reporte_${tipo}_${Date.now()}.xlsx`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: `Guardar ${titulo} como Excel`,
            defaultPath: fileName,
            filters: [{ name: 'Excel', extensions: ['xlsx'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LUISINA VESTIDOS';
        workbook.created = new Date();

        const bordeThin = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        // Hoja Resumen con estilos
        if (periodo || extraData) {
            const summarySheet = workbook.addWorksheet('Resumen');
            summarySheet.columns = [
                { header: 'Descripción', key: 'descripcion', width: 30 },
                { header: 'Valor', key: 'valor', width: 50 }
            ];

            // Estilo del encabezado
            summarySheet.getRow(1).height = 25;
            summarySheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = bordeThin;
            });

            // Agregar datos
            if (periodo) summarySheet.addRow({ descripcion: 'Período', valor: periodo });
            if (extraData) {
                Object.entries(extraData).forEach(([k, v]) => {
                    summarySheet.addRow({ descripcion: k, valor: String(v) });
                });
            }

            // Estilo de las filas de datos
            summarySheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.height = 22;
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.font = { size: 11 };
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        cell.border = bordeThin;
                        if (rowNumber % 2 === 0) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        }
                    });
                    row.getCell(1).font = { size: 11, bold: true };
                }
            });
        }

        // Hoja de datos principal con estilos
        const dataSheet = workbook.addWorksheet(titulo.substring(0, 31));

        // Definir columnas
        dataSheet.columns = columnas.map(col => ({
            header: col.label,
            key: col.field,
            width: Math.max(col.label.length + 5, 15)
        }));

        // Estilo del encabezado
        dataSheet.getRow(1).height = 25;
        dataSheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = bordeThin;
        });

        // Agregar datos
        datos.forEach(row => {
            const rowData = {};
            columnas.forEach(col => {
                const value = row[col.field] !== undefined ? row[col.field] : '';
                rowData[col.field] = toExcelValue(value);
            });
            dataSheet.addRow(rowData);
        });

        // Estilo de las filas de datos
        dataSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.height = 22;
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    cell.border = bordeThin;
                    if (rowNumber % 2 === 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }
                });
            }
        });

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    static async generarExcelTodo(datos) {
        const fileName = `Reportes_Completos_${Date.now()}.xlsx`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar reportes completos como Excel',
            defaultPath: fileName,
            filters: [{ name: 'Excel', extensions: ['xlsx'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LUISINA VESTIDOS';
        workbook.created = new Date();

        const bordeThin = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const crearHoja = (nombre, columnas, filas) => {
            const sheet = workbook.addWorksheet(nombre);

            // Definir columnas
            sheet.columns = columnas.map(col => ({
                header: col.header,
                key: col.key,
                width: col.width || 20
            }));

            // Estilo del encabezado
            sheet.getRow(1).height = 25;
            sheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = bordeThin;
            });

            // Agregar datos
            filas.forEach(fila => sheet.addRow(fila));

            // Estilo de las filas de datos
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.height = 22;
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.font = { size: 11 };
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        cell.border = bordeThin;
                        if (rowNumber % 2 === 0) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        }
                    });
                }
            });
        };

        // Hoja Resumen
        const r = datos.resumenIngresos || {};
        crearHoja('Resumen',
            [
                { header: 'Descripción', key: 'descripcion', width: 30 },
                { header: 'Valor', key: 'valor', width: 50 }
            ],
            [
                { descripcion: 'Período', valor: datos.periodo || '' },
                { descripcion: 'Total de Ventas', valor: toExcelValue(r.total_ventas || 0) },
                { descripcion: 'Ingresos Totales', valor: toExcelValue(r.total_ingresos || '') },
                { descripcion: 'Promedio por Venta', valor: toExcelValue(r.promedio_venta || '') },
                { descripcion: 'Venta Mínima', valor: toExcelValue(r.venta_minima || '') },
                { descripcion: 'Venta Máxima', valor: toExcelValue(r.venta_maxima || '') }
            ]
        );

        // Formato especial para la primera columna (negrita)
        const resumenSheet = workbook.getWorksheet('Resumen');
        resumenSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.getCell(1).font = { size: 11, bold: true };
            }
        });

        // Hoja Ingresos por Período
        if (datos.ingresos.length > 0) {
            crearHoja('Ingresos por Período',
                [
                    { header: 'Fecha', key: 'fecha', width: 15 },
                    { header: 'Ventas', key: 'cantidad_ventas', width: 12 },
                    { header: 'Ingresos', key: 'total_ingresos', width: 20 }
                ],
                datos.ingresos.map(r => ({
                    fecha: r.fecha,
                    cantidad_ventas: r.cantidad_ventas,
                    total_ingresos: r.total_ingresos
                }))
            );
        }

        // Hoja Top Vestidos
        if (datos.vestidos.length > 0) {
            crearHoja('Top Vestidos',
                [
                    { header: 'Código', key: 'codigo', width: 12 },
                    { header: 'Nombre', key: 'nombre', width: 30 },
                    { header: 'Categoría', key: 'categoria', width: 20 },
                    { header: 'Vendidos', key: 'total_vendido', width: 12 },
                    { header: 'Ingresos', key: 'total_ingresos', width: 20 }
                ],
                datos.vestidos.map(r => ({
                    codigo: r.codigo,
                    nombre: r.nombre,
                    categoria: r.categoria_nombre,
                    total_vendido: r.total_vendido,
                    total_ingresos: r.total_ingresos
                }))
            );
        }

        // Hoja Top Clientes
        if (datos.clientes.length > 0) {
            crearHoja('Top Clientes',
                [
                    { header: 'Cliente', key: 'cliente', width: 30 },
                    { header: 'Compras', key: 'total_compras', width: 12 },
                    { header: 'Total Gastado', key: 'total_gastado', width: 20 }
                ],
                datos.clientes.map(r => ({
                    cliente: r.nombre,
                    total_compras: r.total_compras,
                    total_gastado: r.total_gastado
                }))
            );
        }

        // Hoja Top Vendedores
        if (datos.vendedores.length > 0) {
            crearHoja('Top Vendedores',
                [
                    { header: 'Vendedor', key: 'vendedor', width: 25 },
                    { header: 'Ventas', key: 'total_ventas', width: 12 },
                    { header: 'Ingresos', key: 'total_ingresos', width: 20 }
                ],
                datos.vendedores.map(r => ({
                    vendedor: r.usuario_venta,
                    total_ventas: r.total_ventas,
                    total_ingresos: r.total_ingresos
                }))
            );
        }

        // Hoja Forma de Pago
        if (datos.formaPago.length > 0) {
            crearHoja('Forma de Pago',
                [
                    { header: 'Forma de Pago', key: 'forma_pago', width: 20 },
                    { header: 'Cantidad Ventas', key: 'cantidad_ventas', width: 15 },
                    { header: 'Total Ingresos', key: 'total_ingresos', width: 20 },
                    { header: 'Porcentaje', key: 'porcentaje', width: 12 }
                ],
                datos.formaPago.map(r => ({
                    forma_pago: r.forma_pago,
                    cantidad_ventas: r.cantidad_ventas,
                    total_ingresos: r.total_ingresos,
                    porcentaje: r.porcentaje
                }))
            );
        }

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    static async generarExcelHistorial(titulo, periodo, datos) {
        const fileName = `Historial_Ventas_${Date.now()}.xlsx`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar historial de ventas como Excel',
            defaultPath: fileName,
            filters: [{ name: 'Excel', extensions: ['xlsx'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LUISINA VESTIDOS';
        workbook.created = new Date();

        const bordeThin = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        // Hoja Información
        const infoSheet = workbook.addWorksheet('Información');
        infoSheet.columns = [
            { header: 'Descripción', key: 'descripcion', width: 30 },
            { header: 'Valor', key: 'valor', width: 50 }
        ];

        // Estilo del encabezado
        infoSheet.getRow(1).height = 25;
        infoSheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = bordeThin;
        });

        infoSheet.addRow({ descripcion: 'Período', valor: periodo || '' });

        // Estilo de las filas de datos
        infoSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.height = 22;
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    cell.border = bordeThin;
                    if (rowNumber % 2 === 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }
                });
                row.getCell(1).font = { size: 11, bold: true };
            }
        });

        // Hoja Historial
        const historialSheet = workbook.addWorksheet('Historial');
        historialSheet.columns = [
            { header: 'N° Venta', key: 'id_venta', width: 12 },
            { header: 'Cliente', key: 'cliente', width: 25 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Forma de Pago', key: 'forma_pago', width: 18 },
            { header: 'Usuario', key: 'usuario', width: 20 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Código Vestido', key: 'codigo_vestido', width: 15 },
            { header: 'Vestido', key: 'vestido', width: 30 },
            { header: 'Cantidad', key: 'cantidad', width: 10 }
        ];

        // Estilo del encabezado
        historialSheet.getRow(1).height = 25;
        historialSheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = bordeThin;
        });

        // Agregar datos
        datos.forEach(row => {
            historialSheet.addRow({
                id_venta: `#${row.id_venta}`,
                cliente: row.nombre_cliente || 'Anónimo',
                total: formatCurrency(row.total),
                forma_pago: row.forma_pago || '-',
                usuario: row.usuario_venta || '-',
                fecha: formatDate(row.fecha_venta),
                codigo_vestido: row.codigo_vestido || '-',
                vestido: row.nombre_vestido || '-',
                cantidad: row.cantidad !== undefined && row.cantidad !== null ? String(row.cantidad) : '-'
            });
        });

        // Estilo de las filas de datos
        historialSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.height = 22;
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    cell.border = bordeThin;
                    if (rowNumber % 2 === 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }
                });
            }
        });

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    static async generarHistorialVentas(titulo, periodo, datos) {
        const fileName = `Historial_Ventas_${Date.now()}.pdf`;
        const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar historial de ventas',
            defaultPath: fileName,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) return null;
        const filePath = dialogResult.filePath;

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Header
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('LUISINA VESTIDOS', { align: 'center' })
                   .fontSize(14)
                   .text(titulo, { align: 'center' })
                   .fontSize(10)
                   .font('Helvetica')
                   .text(`Período: ${periodo}`, { align: 'center' })
                   .text(`Total de registros: ${datos.length}`, { align: 'center' })
                   .text(`Fecha de generación: ${formatDate(new Date())}`, { align: 'center' })
                   .moveDown(1.5);

                const leftMargin = 50;
                const colWidths = [45, 110, 70, 80, 80, 85, 60, 160, 50];
                const colLabels = ['N° Venta', 'Cliente', 'Total', 'Forma de Pago', 'Usuario', 'Fecha', 'Código', 'Vestido', 'Cantidad'];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);

                const drawHeader = (yPos) => {
                    doc.font('Helvetica-Bold').fontSize(9);
                    colLabels.forEach((label, i) => {
                        const x = leftMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                        doc.text(label, x, yPos, { width: colWidths[i], align: 'left' });
                    });
                    const lineY = yPos + 16;
                    doc.moveTo(leftMargin, lineY).lineTo(leftMargin + tableWidth, lineY).stroke();
                    return lineY + 6;
                };

                let y = drawHeader(doc.y);

                doc.font('Helvetica').fontSize(8);
                datos.forEach(row => {
                    if (y > doc.page.height - 80) {
                        doc.addPage();
                        y = drawHeader(50);
                        doc.font('Helvetica').fontSize(8);
                    }

                    const values = [
                        `#${row.id_venta}`,
                        row.nombre_cliente || 'Anónimo',
                        formatCurrency(row.total),
                        row.forma_pago || '-',
                        row.usuario_venta || '-',
                        formatDate(row.fecha_venta),
                        row.codigo_vestido || '-',
                        row.nombre_vestido || '-',
                        String(row.cantidad ?? '-')
                    ];

                    values.forEach((val, i) => {
                        const x = leftMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                        doc.text(val, x, y, { width: colWidths[i], align: 'left' });
                    });
                    y += 18;
                });

                doc.end();

                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Convierte valores numéricos a number para evitar advertencias en Excel
function toExcelValue(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    // Si es un string que representa un número, convertirlo
    if (typeof value === 'string') {
        // Remover formato de moneda si existe
        const cleaned = value.replace(/[$\s,]/g, '').replace(/\./g, '');
        const num = Number(cleaned);
        if (!isNaN(num) && cleaned.match(/^-?\d+(\.\d+)?$/)) {
            return num;
        }
        return value;
    }
    // Si ya es número, devolverlo tal cual
    if (typeof value === 'number') {
        return value;
    }
    return value;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
