const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'ropa.ll100@gmail.com',
                pass: 'pwpbqxrmvandknok'
            }
        });
    }

    async enviarComprobante(destinatario, venta, detalles, pdfPath) {
        try {
            // Crear contenido HTML del correo
            const htmlContent = this.generarHtmlComprobante(venta, detalles);

            const mailOptions = {
                from: '"Luisina Vestidos" <ropa.ll100@gmail.com>',
                to: destinatario,
                subject: `Comprobante de Venta #${venta.id_venta} - Luisina Vestidos`,
                html: htmlContent,
                attachments: pdfPath ? [{
                    filename: `Comprobante_${venta.id_venta}.pdf`,
                    path: pdfPath
                }] : []
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error al enviar email:', error);
            return false;
        }
    }

    generarHtmlComprobante(venta, detalles) {
        let productosHtml = '';
        detalles.forEach(detalle => {
            productosHtml += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${detalle.nombre_vestido}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #777; font-size: 12px;">${detalle.codigo_vestido}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${detalle.cantidad}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(detalle.subtotal)}</td>
                </tr>
            `;
        });

        // Calcular descuento si aplica
        let descuentoHtml = '';
        if (venta.descuento > 0) {
            const subtotalOriginal = detalles.reduce((sum, d) => sum + parseFloat(d.subtotal || 0), 0);
            const montoDescuento = subtotalOriginal - parseFloat(venta.total);
            descuentoHtml = `
                <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: #555;">Subtotal:</td>
                    <td style="padding: 8px; text-align: right;">${this.formatCurrency(subtotalOriginal)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: #e53e3e;">Descuento (${parseInt(venta.descuento)}%):</td>
                    <td style="padding: 8px; text-align: right; color: #e53e3e;">-${this.formatCurrency(montoDescuento)}</td>
                </tr>
            `;
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #ddd; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: bold; }
                    hr { border: none; border-top: 1px solid #ddd; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>LUISINA VESTIDOS</h1>
                        <p>Comprobante de Venta</p>
                    </div>
                    <div class="content">
                        <p style="margin: 4px 0;"><strong>N° de Venta:</strong> ${venta.id_venta}</p>
                        <p style="margin: 4px 0;"><strong>Fecha:</strong> ${this.formatDate(venta.fecha_venta)}</p>
                        <p style="margin: 4px 0;"><strong>Atendido por:</strong> ${venta.usuario_venta}</p>
                        ${venta.nombre_cliente ? `<p style="margin: 4px 0;"><strong>Cliente:</strong> ${venta.nombre_cliente}</p>` : ''}
                        <p style="margin: 4px 0;"><strong>Forma de pago:</strong> ${venta.forma_pago}</p>

                        <hr>
                        <h3 style="margin-bottom: 0;">Detalle de Productos</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Código</th>
                                    <th style="text-align: center;">Cantidad</th>
                                    <th style="text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHtml}
                                ${descuentoHtml}
                                <tr>
                                    <td colspan="3" style="padding: 10px; text-align: right; font-size: 18px; font-weight: bold; color: #764ba2;">TOTAL:</td>
                                    <td style="padding: 10px; text-align: right; font-size: 18px; font-weight: bold; color: #764ba2;">${this.formatCurrency(venta.total)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <p style="text-align: center; color: #555; margin-top: 20px;">¡Gracias por su compra!</p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo electrónico automático, por favor no responder.</p>
                        <p>© 2026 Luisina Vestidos - Todos los derechos reservados</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    async enviarRecuperacionPassword(destinatario, nombreUsuario, tokenRecuperacion) {
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                        .content { background: white; padding: 30px; border: 1px solid #ddd; }
                        .button { display: inline-block; padding: 12px 30px; background: #764ba2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>LUISINA VESTIDOS</h1>
                        </div>
                        <div class="content">
                            <h2>Recuperación de Contraseña</h2>
                            <p>Hola ${nombreUsuario},</p>
                            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                            <p>Tu código de recuperación es: <strong>${tokenRecuperacion}</strong></p>
                            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                            <p>Saludos,<br>Equipo de Luisina Vestidos</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: '"Luisina Vestidos" <ropa.ll100@gmail.com>',
                to: destinatario,
                subject: 'Recuperación de Contraseña - Luisina Vestidos',
                html: htmlContent
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error al enviar email de recuperación:', error);
            return false;
        }
    }

    formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

const emailService = new EmailService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = emailService;
}
