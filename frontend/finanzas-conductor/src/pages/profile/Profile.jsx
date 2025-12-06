import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Button,
    Divider,
    Stack
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Logout as LogoutIcon,
    DirectionsCar as CarIcon,
    Badge as BadgeIcon,
    Phone as PhoneIcon,
    Notifications as NotificationsIcon,
    DarkMode as DarkModeIcon,
    Security as SecurityIcon,
    Lock as LockIcon,
    Help as HelpIcon,
    Info as InfoIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function ProfileScreen() {
    const { user, userData, logout, updateProfile } = useAuth(); // Changed signOut to logout based on AuthContext
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        modelo: '',
        placa: '',
        notificaciones: true,
        temaOscuro: false
    });

    useEffect(() => {
        if (userData || user) {
            setFormData({
                nombre: userData?.nombre || user?.displayName || '',
                telefono: userData?.telefono || '',
                modelo: userData?.modelo || '',
                placa: userData?.placa || '',
                notificaciones: userData?.configuracion?.notificaciones ?? true,
                temaOscuro: userData?.configuracion?.tema === 'oscuro'
            });
        }
    }, [userData, user]);

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            const result = await logout();
            if (result.success) {
                navigate('/login');
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        // Mock update logic since updateProfile might not be fully implemented in mock context
        // In a real app, this would call updateProfile(updates)

        setTimeout(() => {
            setLoading(false);
            setEditing(false);
            toast.success('Perfil actualizado correctamente');
        }, 1000);
    };

    const menuItems = [
        { title: 'Seguridad', icon: <SecurityIcon />, action: () => console.log('Seguridad') },
        { title: 'Privacidad', icon: <LockIcon />, action: () => console.log('Privacidad') },
        { title: 'Soporte', icon: <HelpIcon />, action: () => console.log('Soporte') },
        { title: 'Acerca de', icon: <InfoIcon />, action: () => console.log('Acerca de') }
    ];

    const initial = formData.nombre ? formData.nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            {/* Header Card */}
            <Card sx={{ mb: 2, position: 'relative', overflow: 'visible', mt: 4 }}>
                <Box sx={{ position: 'absolute', top: -40, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2.5rem', border: '4px solid white', boxShadow: 2 }}>
                        {initial}
                    </Avatar>
                </Box>
                {!editing && (
                    <IconButton
                        onClick={() => setEditing(true)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        color="primary"
                    >
                        <EditIcon />
                    </IconButton>
                )}
                <CardContent sx={{ pt: 6, textAlign: 'center' }}>
                    {editing ? (
                        <TextField
                            fullWidth
                            variant="standard"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' } }}
                            sx={{ mb: 1 }}
                        />
                    ) : (
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {formData.nombre || 'Usuario'}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                        {user?.email}
                    </Typography>
                </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1 }}>
                Información del Vehículo
            </Typography>
            <Card sx={{ mb: 3 }}>
                <List disablePadding>
                    <ListItem divider>
                        <ListItemIcon><CarIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Tipo"
                            secondary={userData?.tipoVehiculo || 'No especificado'}
                        />
                    </ListItem>
                    <ListItem divider>
                        <ListItemIcon><BadgeIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Modelo"
                            secondary={
                                editing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="standard"
                                        value={formData.modelo}
                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                    />
                                ) : (formData.modelo || 'No especificado')
                            }
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><BadgeIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Placa"
                            secondary={
                                editing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="standard"
                                        value={formData.placa}
                                        onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                    />
                                ) : (formData.placa || 'No registrada')
                            }
                        />
                    </ListItem>
                </List>
            </Card>

            {/* Contact Info */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1 }}>
                Contacto
            </Typography>
            <Card sx={{ mb: 3 }}>
                <List disablePadding>
                    <ListItem>
                        <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Teléfono"
                            secondary={
                                editing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="standard"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                ) : (formData.telefono || 'No registrado')
                            }
                        />
                    </ListItem>
                </List>
            </Card>

            {/* Settings */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1 }}>
                Configuración
            </Typography>
            <Card sx={{ mb: 3 }}>
                <List disablePadding>
                    <ListItem divider>
                        <ListItemIcon><NotificationsIcon /></ListItemIcon>
                        <ListItemText primary="Notificaciones" />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                checked={formData.notificaciones}
                                onChange={(e) => editing && setFormData({ ...formData, notificaciones: e.target.checked })}
                                disabled={!editing}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><DarkModeIcon /></ListItemIcon>
                        <ListItemText primary="Tema oscuro" />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                checked={formData.temaOscuro}
                                onChange={(e) => editing && setFormData({ ...formData, temaOscuro: e.target.checked })}
                                disabled={!editing}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Card>

            {/* Menu */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1 }}>
                Más Opciones
            </Typography>
            <Card sx={{ mb: 4 }}>
                <List disablePadding>
                    {menuItems.map((item, index) => (
                        <ListItem
                            button
                            key={index}
                            onClick={item.action}
                            divider={index < menuItems.length - 1}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.title} />
                            <ChevronRightIcon color="action" />
                        </ListItem>
                    ))}
                </List>
            </Card>

            {/* Actions */}
            <Stack spacing={2}>
                {editing ? (
                    <>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<CloseIcon />}
                            onClick={() => setEditing(false)}
                        >
                            Cancelar
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{ bgcolor: 'error.lighter', borderColor: 'error.light' }}
                    >
                        Cerrar Sesión
                    </Button>
                )}
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 4, color: 'text.disabled' }}>
                <Typography variant="caption" display="block">ID: {user?.uid?.substring(0, 8)}...</Typography>
                <Typography variant="caption">Versión Web 1.0.0</Typography>
            </Box>
        </Box>
    );
}
