import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    FormControlLabel,
    Radio,
    RadioGroup,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Checkbox
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';

export default function RegisterScreen() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        telefono: '',
        tipoVehiculo: 'auto',
        modelo: '',
        año: '',
        placa: '',
        aceptaTerminos: false
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const tiposVehiculo = [
        { label: 'Auto/Sedán', value: 'auto' },
        { label: 'SUV/Camioneta', value: 'suv' },
        { label: 'Motocicleta', value: 'moto' },
        { label: 'Camión', value: 'camion' },
        { label: 'VAN', value: 'van' }
    ];

    const steps = ['Credenciales', 'Información Personal', 'Vehículo', 'Términos'];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!formData.email || !formData.password || !formData.confirmPassword) {
                    toast.error('Completa todos los campos');
                    return false;
                }
                if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    toast.error('Email inválido');
                    return false;
                }
                if (formData.password.length < 6) {
                    toast.error('La contraseña debe tener al menos 6 caracteres');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast.error('Las contraseñas no coinciden');
                    return false;
                }
                return true;

            case 2:
                if (!formData.nombre) {
                    toast.error('Ingresa tu nombre');
                    return false;
                }
                return true;

            case 3:
                if (!formData.tipoVehiculo) {
                    toast.error('Selecciona el tipo de vehículo');
                    return false;
                }
                return true;

            case 4:
                if (!formData.aceptaTerminos) {
                    toast.error('Debes aceptar los términos y condiciones');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 4) {
                setStep(step + 1);
            } else {
                handleRegister();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleRegister = async () => {
        setLoading(true);

        const userInfo = {
            nombre: formData.nombre,
            telefono: formData.telefono,
            tipoVehiculo: formData.tipoVehiculo,
            modelo: formData.modelo,
            año: formData.año,
            placa: formData.placa
        };

        const result = await signUp(formData.email, formData.password, userInfo);
        setLoading(false);

        if (result.success) {
            toast.success('¡Cuenta creada exitosamente!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } else {
            console.error("Registro falló:", result.error);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Paso 1: Credenciales
                        </Typography>
                        <TextField
                            label="Correo electrónico"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                        <TextField
                            label="Contraseña"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                        />
                        <TextField
                            label="Confirmar Contraseña"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            margin="normal"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            required
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                />
                            }
                            label="Mostrar contraseña"
                        />
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Paso 2: Información Personal
                        </Typography>
                        <TextField
                            label="Nombre completo"
                            fullWidth
                            margin="normal"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            required
                        />
                        <TextField
                            label="Teléfono"
                            type="tel"
                            fullWidth
                            margin="normal"
                            value={formData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                        />
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Paso 3: Información del Vehículo
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Tipo de vehículo:
                        </Typography>
                        <RadioGroup
                            value={formData.tipoVehiculo}
                            onChange={(e) => handleChange('tipoVehiculo', e.target.value)}
                        >
                            {tiposVehiculo.map((item) => (
                                <FormControlLabel
                                    key={item.value}
                                    value={item.value}
                                    control={<Radio />}
                                    label={item.label}
                                />
                            ))}
                        </RadioGroup>
                        <TextField
                            label="Modelo (ej. Toyota Corolla)"
                            fullWidth
                            margin="normal"
                            value={formData.modelo}
                            onChange={(e) => handleChange('modelo', e.target.value)}
                        />
                        <TextField
                            label="Año"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={formData.año}
                            onChange={(e) => handleChange('año', e.target.value)}
                        />
                        <TextField
                            label="Placa"
                            fullWidth
                            margin="normal"
                            value={formData.placa}
                            onChange={(e) => handleChange('placa', e.target.value)}
                        />
                    </Box>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Paso 4: Términos y Condiciones
                        </Typography>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="body2">
                                    Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
                                    {"\n\n"}
                                    1. Tus datos serán utilizados únicamente para el funcionamiento de la aplicación.
                                    {"\n"}
                                    2. Te comprometes a proporcionar información verídica.
                                    {"\n"}
                                    3. Eres responsable de mantener la confidencialidad de tu cuenta.
                                </Typography>
                            </CardContent>
                        </Card>
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
                );
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 3
            }}
        >

            <Card sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Crear Cuenta
                    </Typography>

                    <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

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

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                Inicia sesión
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
