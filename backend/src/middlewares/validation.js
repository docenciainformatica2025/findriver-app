const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;

// Validar ObjectId de MongoDB
const isValidObjectId = (value, helpers) => {
    if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

// Esquemas de validación
const authSchemas = {
    register: Joi.object({
        nombre: Joi.string().min(2).max(50).required()
            .messages({
                'string.empty': 'El nombre es requerido',
                'string.min': 'El nombre debe tener al menos 2 caracteres',
                'string.max': 'El nombre no puede exceder 50 caracteres'
            }),
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Por favor ingresa un email válido',
                'string.empty': 'El email es requerido'
            }),
        password: Joi.string().min(6).required()
            .messages({
                'string.min': 'La contraseña debe tener al menos 6 caracteres',
                'string.empty': 'La contraseña es requerida'
            }),
        telefono: Joi.string().pattern(/^[0-9]{10}$/)
            .messages({
                'string.pattern.base': 'Número de teléfono inválido (10 dígitos)'
            }),
        tipoVehiculo: Joi.string().valid('auto', 'suv', 'moto', 'camion', 'van').required(),
        aceptaTerminos: Joi.boolean().valid(true).required()
            .messages({
                'any.only': 'Debes aceptar los términos y condiciones'
            })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required()
    })
};

const transactionSchemas = {
    create: Joi.object({
        tipo: Joi.string().valid('ingreso', 'gasto').required(),
        monto: Joi.number().positive().required(),
        descripcion: Joi.string().max(200).required(),
        categoria: Joi.string().required(),
        fecha: Joi.date().max('now').default(Date.now),

        // Campos específicos para viajes
        viaje: Joi.object({
            origen: Joi.string(),
            destino: Joi.string(),
            distanciaKm: Joi.number().positive(),
            tiempoMinutos: Joi.number().positive(),
            pasajeros: Joi.number().integer().min(1),
            tarifaBase: Joi.number().positive(),
            extras: Joi.object({
                propina: Joi.number().min(0),
                peaje: Joi.number().min(0),
                estacionamiento: Joi.number().min(0),
                otros: Joi.number().min(0)
            }),
            metodoPago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'app'),
            calificacion: Joi.number().min(1).max(5),
            observaciones: Joi.string()
        }).when('tipo', {
            is: 'ingreso',
            then: Joi.object({
                origen: Joi.string().required(),
                destino: Joi.string().required()
            })
        }),

        // Campos específicos para gastos
        gasto: Joi.object({
            proveedor: Joi.string(),
            ubicacion: Joi.string(),
            litros: Joi.number().positive(),
            precioLitro: Joi.number().positive(),
            odometro: Joi.number().positive(),
            factura: Joi.object({
                numero: Joi.string(),
                imagen: Joi.string(),
                subido: Joi.boolean()
            }),
            periodicidad: Joi.string().valid('unico', 'diario', 'semanal', 'mensual', 'anual')
        }),

        ubicacion: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2),
            direccion: Joi.string(),
            ciudad: Joi.string(),
            estado: Joi.string(),
            pais: Joi.string()
        }),

        etiquetas: Joi.array().items(Joi.string()),
        notas: Joi.string(),
        esRecurrente: Joi.boolean().default(false)
    }),

    update: Joi.object({
        monto: Joi.number().positive(),
        descripcion: Joi.string().max(200),
        categoria: Joi.string(),
        fecha: Joi.date().max('now'),
        notas: Joi.string(),
        estado: Joi.string().valid('pendiente', 'completado', 'cancelado', 'reembolsado')
    }),

    filter: Joi.object({
        tipo: Joi.string().valid('ingreso', 'gasto'),
        categoria: Joi.string(),
        fechaInicio: Joi.date(),
        fechaFin: Joi.date(),
        descripcion: Joi.string(),
        pagina: Joi.number().integer().min(1).default(1),
        limite: Joi.number().integer().min(1).max(100).default(20)
    })
};

const vehicleSchemas = {
    create: Joi.object({
        marca: Joi.string().required(),
        modelo: Joi.string().required(),
        año: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
        placa: Joi.string().required(),
        color: Joi.string(),
        tipo: Joi.string().valid('auto', 'suv', 'camioneta', 'moto', 'camion', 'van', 'otros'),

        motor: Joi.object({
            cilindrada: Joi.string(),
            tipoCombustible: Joi.string().valid('gasolina', 'diesel', 'electrico', 'hibrido', 'gnv'),
            rendimiento: Joi.number().positive()
        }),

        transmision: Joi.string().valid('automatica', 'manual', 'cvt'),

        seguro: Joi.object({
            compañia: Joi.string(),
            numeroPoliza: Joi.string(),
            vigencia: Joi.date(),
            cobertura: Joi.string(),
            costoAnual: Joi.number().positive(),
            proximoPago: Joi.date()
        }),

        principal: Joi.boolean().default(false)
    }),

    update: Joi.object({
        marca: Joi.string(),
        modelo: Joi.string(),
        color: Joi.string(),

        estadisticas: Joi.object({
            kilometrajeActual: Joi.number().min(0)
        }),

        mantenimiento: Joi.object({
            ultimoServicio: Joi.date(),
            proximoServicio: Joi.date(),
            kilometrajeUltimoServicio: Joi.number().min(0),
            kilometrajeProximoServicio: Joi.number().min(0)
        }),

        principal: Joi.boolean()
    })
};

// Middleware de validación genérico
exports.validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: `Error de validación: ${errors.map(e => e.message).join(', ')}`,
                details: errors
            });
        }

        // Reemplazar datos validados
        req[property] = value;
        next();
    };
};

// Validar ObjectId en parámetros
exports.validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }

        next();
    };
};

// Validar archivos subidos
exports.validateFile = (fieldName, allowedTypes, maxSizeMB = 5) => {
    return (req, res, next) => {
        if (!req.file) return next();

        const file = req.file;
        const maxSize = maxSizeMB * 1024 * 1024;

        // Validar tipo
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
            });
        }

        // Validar tamaño
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                error: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB`
            });
        }

        next();
    };
};

// Exportar esquemas
exports.schemas = {
    auth: authSchemas,
    transaction: transactionSchemas,
    vehicle: vehicleSchemas
};
