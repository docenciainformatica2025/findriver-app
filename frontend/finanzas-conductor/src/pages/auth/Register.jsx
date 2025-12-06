import React, { useState } from 'react'
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    FormLabel
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Register = () => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        // Paso 1
        email: '',
        password: '',
        confirmPassword: '',

        // Paso 2
        nombre: '',
        telefono: '',

        // Paso 3
        tipoVehiculo: 'auto',
        modelo: '',
        año: '',
        placa: '',

        // Paso 4
        aceptaTerminos: false
    })

    const { signUp } = useAuth()
    const navigate = useNavigate()

    const steps = ['Credenciales', 'Información Personal', 'Vehículo', 'Términos']

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        if (validateStep()) {
            if (step < 4) {
                setStep(step + 1)
            } else {
                handleRegister()
            }
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!formData.email || !formData.password || !formData.confirmPassword) {
                    setError('Completa todos los campos')
                    return false
                }
                if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    setError('Email inválido')
                    return false
                }
                if (formData.password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres')
                    return false
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Las contraseñas no coinciden')
                    return false
                }
                return true

            case 2:
                if (!formData.nombre) {
                    setError('Ingresa tu nombre')
                    return false
                }
                return true

            case 3:
                if (!formData.tipoVehiculo) {
                    setError('Selecciona el tipo de vehículo')
                    return false
                }
                return true

            case 4:
                if (!formData.aceptaTerminos) {
                    setError('Debes aceptar los términos y condiciones')
                    return false
                }
                return true
        }
        return true
    }

    const handleRegister = async () => {
        setLoading(true)
        setError('')

        try {
            const userData = {
                nombre: formData.nombre,
                telefono: formData.telefono,
                tipoVehiculo: formData.tipoVehiculo,
                modelo: formData.modelo,
                año: formData.año,
                placa: formData.placa
            }

            const result = await signUp(formData.email, formData.password, userData)

            if (!result.success) {
                setError(result.error)
            }
        } catch (err) {
            setError('Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Box>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Correo electrónico"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Contraseña"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Confirmar Contraseña"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        />
                    </Box>
                )

            case 2:
                return (
                    <Box>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nombre completo"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Teléfono"
                            value={formData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                        />
                    </Box>
                )

            case 3:
                return (
                    <Box>
                        <FormLabel component="legend">Tipo de vehículo</FormLabel>
                        <RadioGroup
                            value={formData.tipoVehiculo}
                            onChange={(e) => handleChange('tipoVehiculo', e.target.value)}
                        >
                            <FormControlLabel value="auto" control={<Radio />} label="Auto/Sedán" />
                            <FormControlLabel value="suv" control={<Radio />} label="SUV/Camioneta" />
                            <FormControlLabel value="moto" control={<Radio />} label="Motocicleta" />
                            <FormControlLabel value="camion" control={<Radio />} label="Camión" />
                            <FormControlLabel value="van" control={<Radio />} label="VAN" />
                        </RadioGroup>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Modelo (ej. Toyota Corolla)"
                            value={formData.modelo}
                            onChange={(e) => handleChange('modelo', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Año"
                            type="number"
                            value={formData.año}
                            onChange={(e) => handleChange('año', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Placa"
                            value={formData.placa}
                            onChange={(e) => handleChange('placa', e.target.value)}
                        />
                    </Box>
                )

            case 4:
                return (
                    <Box>
                        <Typography variant="body2" paragraph>
                            Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
                        </Typography>
                        <Typography variant="body2" paragraph>
                            1. Tus datos serán utilizados únicamente para el funcionamiento de la aplicación.
                        </Typography>
                        <Typography variant="body2" paragraph>
                            2. Te comprometes a proporcionar información verídica.
                        </Typography>
                        <Typography variant="body2" paragraph>
                            3. Eres responsable de mantener la confidencialidad de tu cuenta.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.aceptaTerminos}
                                    onChange={(e) => handleChange('aceptaTerminos', e.target.checked)}
                                />
                            }
                            label="Acepto los términos y condiciones"
                        />
                    </Box>
                )
        }
    }

    return (
        <Container component="main" maxWidth="md">
            <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Crear Cuenta
                    </Typography>

                    <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {renderStep()}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            disabled={step === 1 || loading}
                        >
                            Atrás
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading}
                            endIcon={loading && <CircularProgress size={20} />}
                        >
                            {step === 4 ? 'Crear Cuenta' : 'Siguiente'}
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2">
                            ¿Ya tienes cuenta?{' '}
                            <Link component={RouterLink} to="/login">
                                Inicia sesión
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    )
}

export default Register
