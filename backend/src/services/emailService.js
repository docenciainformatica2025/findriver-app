const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const logger = require('../utils/logger');

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verificar conexión
// Verificar conexión (DESHABILITADO POR DEFECTO PARA EVITAR CRASH)
// transporter.verify(function (error, success) {
//     if (error) {
//         logger.warn('Error conectando al servidor SMTP (No crítico):', error.message);
//     } else {
//         logger.info('✅ Servidor SMTP listo');
//     }
// });

// Cargar plantillas
const loadTemplate = async (templateName, context) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
        const templateContent = await fs.readFile(templatePath, 'utf8');
        const template = handlebars.compile(templateContent);
        return template(context);
    } catch (error) {
        logger.error(`Error cargando plantilla ${templateName}:`, error);
        return null;
    }
};

// Enviar email
const sendEmail = async (options) => {
    try {
        // Si estamos en desarrollo, loguear en lugar de enviar
        if (process.env.NODE_ENV === 'development' && process.env.EMAIL_LOG_ONLY === 'true') {
            logger.info('📧 Email (modo desarrollo):', {
                to: options.to,
                subject: options.subject,
                template: options.template
            });
            return true;
        }

        // Cargar plantilla HTML
        let html;
        if (options.template) {
            html = await loadTemplate(options.template, options.context);
        }

        // Configurar email
        const mailOptions = {
            from: `"Finanzas Conductor" <${process.env.SMTP_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: html || options.html
        };

        // Enviar email
        const info = await transporter.sendMail(mailOptions);

        logger.info('Email enviado:', info.messageId);
        return true;

    } catch (error) {
        logger.error('Error enviando email:', error);
        throw error;
    }
};

// Plantillas disponibles
const emailTemplates = {
    // Autenticación
    verification: {
        subject: 'Verifica tu cuenta - Finanzas Conductor',
        template: 'verification'
    },
    resetPassword: {
        subject: 'Restablecer contraseña - Finanzas Conductor',
        template: 'resetPassword'
    },
    passwordChanged: {
        subject: 'Contraseña cambiada - Finanzas Conductor',
        template: 'passwordChanged'
    },
    passwordUpdated: {
        subject: 'Contraseña actualizada - Finanzas Conductor',
        template: 'passwordUpdated'
    },

    // Transacciones
    transactionCreated: {
        subject: 'Transacción registrada - Finanzas Conductor',
        template: 'transactionCreated'
    },
    monthlyReport: {
        subject: 'Reporte mensual - Finanzas Conductor',
        template: 'monthlyReport'
    },

    // Alertas
    maintenanceReminder: {
        subject: 'Recordatorio de mantenimiento - Finanzas Conductor',
        template: 'maintenanceReminder'
    },
    insuranceExpiry: {
        subject: 'Seguro próximo a vencer - Finanzas Conductor',
        template: 'insuranceExpiry'
    },

    // Sistema
    welcome: {
        subject: '¡Bienvenido a Finanzas Conductor!',
        template: 'welcome'
    }
};

// Método para enviar email basado en plantilla
const sendTemplateEmail = async (to, templateName, context = {}) => {
    const template = emailTemplates[templateName];

    if (!template) {
        throw new Error(`Plantilla ${templateName} no encontrada`);
    }

    return await sendEmail({
        to,
        subject: template.subject,
        template: template.template,
        context
    });
};

// Método para enviar reporte mensual
const sendMonthlyReport = async (user, reportData) => {
    const context = {
        nombre: user.nombre,
        mes: reportData.mes,
        año: reportData.año,
        ingresos: reportData.ingresos,
        gastos: reportData.gastos,
        ganancias: reportData.ganancias,
        viajes: reportData.viajes,
        topCategories: reportData.topCategories,
        insights: reportData.insights,
        pdfUrl: reportData.pdfUrl
    };

    return await sendTemplateEmail(user.email, 'monthlyReport', context);
};

// Método para enviar alerta de mantenimiento
const sendMaintenanceAlert = async (user, vehicle, daysLeft) => {
    const context = {
        nombre: user.nombre,
        vehiculo: `${vehicle.marca} ${vehicle.modelo}`,
        placa: vehicle.placa,
        proximoServicio: vehicle.mantenimiento.proximoServicio.toLocaleDateString(),
        diasRestantes: daysLeft,
        kilometrajeActual: vehicle.estadisticas.kilometrajeActual,
        kilometrajeProximo: vehicle.mantenimiento.kilometrajeProximoServicio
    };

    return await sendTemplateEmail(user.email, 'maintenanceReminder', context);
};

module.exports = {
    sendEmail,
    sendTemplateEmail,
    sendMonthlyReport,
    sendMaintenanceAlert,
    emailTemplates
};
