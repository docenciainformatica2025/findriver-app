import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    TextField,
    Button,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    DirectionsCar as CarIcon,
    Edit as EditIcon
} from '@mui/icons-material';

export default function ProfileScreen() {
    console.log("ProfileScreen: Mounting");
    const { user } = useAuth();

    if (!user) {
        return <Typography>Cargando perfil...</Typography>;
    }

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Perfil de Usuario
            </Typography>

            <Grid container spacing={3}>
                {/* Tarjeta Principal */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                margin: '0 auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {user.nombre ? user.nombre.charAt(0).toUpperCase() : <PersonIcon fontSize="inherit" />}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                            {user.nombre || 'Conductor'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {user.email}
                        </Typography>
                        <Button variant="outlined" startIcon={<EditIcon />} sx={{ mt: 2 }}>
                            Editar Perfil
                        </Button>
                    </Paper>
                </Grid>

                {/* Detalles */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" /> Información Personal
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre Completo"
                                    defaultValue={user.nombre}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    defaultValue={user.telefono || 'No registrado'}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Correo Electrónico"
                                    defaultValue={user.email}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CarIcon color="primary" /> Información del Vehículo
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Tipo de Vehículo"
                                    defaultValue={user.tipoVehiculo || 'No especificado'}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                    sx={{ textTransform: 'capitalize' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Modelo"
                                    defaultValue={user.modelo || 'No especificado'}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Año"
                                    defaultValue={user.año || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Placa"
                                    defaultValue={user.placa || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
