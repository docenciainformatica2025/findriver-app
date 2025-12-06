import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
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
    Stack,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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

import { useThemeContext } from '../contexts/ThemeContext';

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { mode, toggleTheme } = useThemeContext();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        tipoVehiculo: '',
        modelo: '',
        placa: '',
        notificaciones: true,
        temaOscuro: false
    });

    useEffect(() => {
        if (user) {
            const realName = (user.nombre && user.nombre !== 'Usuario Mock') ? user.nombre : (user.displayName || '');
            setFormData({
                nombre: realName,
                telefono: user?.telefono || '',
                tipoVehiculo: user?.tipoVehiculo || '',
                modelo: user?.modelo || '',
                placa: user?.placa || '',
                notificaciones: user?.configuracion?.notificaciones ?? true,
                temaOscuro: user?.configuracion?.tema === 'oscuro',
                costosFijos: user?.costosFijos || {}
            });
        }
    }, [user]);

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
        try {
            const updates = {
                nombre: formData.nombre,
                telefono: formData.telefono,
                tipoVehiculo: formData.tipoVehiculo,
                modelo: formData.modelo,
                placa: formData.placa,
                configuracion: {
                    notificaciones: formData.notificaciones,
                    tema: formData.temaOscuro ? 'oscuro' : 'claro',
                    // Preserve existing config like fuel price if not here
                    ...user.configuracion,
                },
                costosFijos: formData.costosFijos
            };

            // Update user profile/config
            await updateProfile(updates);

            // If vehicle detail changed, we might need a separate call or handle it in updateProfile
            // For now, assuming updateProfile handles user data. 
            // If vehicle data is separate, we'd need:
            // if (user.vehiculos?.length > 0) { ... update vehicle ... }

            setEditing(false);
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar perfil');
        } finally {
            setLoading(false);
        }
    };

    const [infoDialog, setInfoDialog] = useState({ open: false, title: '', content: null });

    const handleMenuClick = (item) => {
        let content = null;
        switch (item) {
            case 'Seguridad':
                content = (
                    <Stack spacing={2}>
                        <Typography variant="body2">Gestiona tu contraseña y métodos de acceso.</Typography>
                        <Button variant="outlined" color="primary">Cambiar Contraseña</Button>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>Biometría</Typography>
                            <Switch defaultChecked />
                        </Box>
                    </Stack>
                );
                break;
            case 'Privacidad':
                content = (
                    <Typography variant="body2" paragraph>
                        Tus datos están protegidos. No compartimos tu información financiera con terceros.
                        Para solicitar el borrado de tus datos, contacta a soporte.
                    </Typography>
                );
                break;
            case 'Soporte':
                content = (
                    <Stack spacing={2}>
                        <Typography variant="body2">¿Necesitas ayuda? Contáctanos:</Typography>
                        <Button variant="contained" color="success" startIcon={<PhoneIcon />} href="https://wa.me/573052357890" target="_blank">
                            WhatsApp Soporte
                        </Button>
                        <Button variant="outlined" startIcon={<InfoIcon />} href="mailto:docenciainformatica2025@gmail.com">
                            Enviar Email
                        </Button>
                    </Stack>
                );
                break;
            case 'Acerca de':
                content = (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary" gutterBottom>FinDriver Pro</Typography>
                        <Typography variant="caption" display="block">Versión 1.0.2</Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Desarrollado para maximizar las ganancias de los conductores profesionales.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
                            © 2025 Ing. Antonio Rodríguez
                        </Typography>
                    </Box>
                );
                break;
            default:
                content = <Typography>Opción en desarrollo</Typography>;
        }
        setInfoDialog({ open: true, title: item, content });
    };

    const menuItems = [
        { title: 'Seguridad', icon: <SecurityIcon />, action: () => handleMenuClick('Seguridad') },
        { title: 'Privacidad', icon: <LockIcon />, action: () => handleMenuClick('Privacidad') },
        { title: 'Soporte', icon: <HelpIcon />, action: () => handleMenuClick('Soporte') },
        { title: 'Acerca de', icon: <InfoIcon />, action: () => handleMenuClick('Acerca de') }
    ];

    const initial = formData.nombre ? formData.nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            {/* Info Dialog */}
            <Dialog
                open={infoDialog.open}
                onClose={() => setInfoDialog({ ...infoDialog, open: false })}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>{infoDialog.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        {infoDialog.content}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfoDialog({ ...infoDialog, open: false })}>Cerrar</Button>
                </DialogActions>
            </Dialog>
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
                {!editing && (
                    <Typography component="span" variant="caption" color="primary" sx={{ ml: 2, cursor: 'pointer' }} onClick={() => setEditing(true)}>
                        (Toca para editar)
                    </Typography>
                )}
            </Typography>
            <Card sx={{ mb: 3 }}>
                <List disablePadding>
                    <ListItem divider onClick={() => !editing && setEditing(true)} sx={{ cursor: !editing ? 'pointer' : 'default' }}>
                        <ListItemIcon><CarIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Tipo de Vehículo"
                            secondary={
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    size="small"
                                    value={formData.tipoVehiculo || ''}
                                    onChange={(e) => setFormData({ ...formData, tipoVehiculo: e.target.value })}
                                    placeholder="Ej. Automóvil, Moto, Van"
                                    InputProps={{
                                        readOnly: !editing,
                                        disableUnderline: !editing,
                                        style: { color: 'text.primary', fontWeight: editing ? 'normal' : '500' }
                                    }}
                                />
                            }
                        />
                    </ListItem>
                    <ListItem divider onClick={() => !editing && setEditing(true)} sx={{ cursor: !editing ? 'pointer' : 'default' }}>
                        <ListItemIcon><BadgeIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Modelo"
                            secondary={
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    size="small"
                                    value={formData.modelo || ''}
                                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                    placeholder="Ej. 2023"
                                    InputProps={{
                                        readOnly: !editing,
                                        disableUnderline: !editing,
                                        style: { color: 'text.primary', fontWeight: editing ? 'normal' : '500' }
                                    }}
                                />
                            }
                        />
                    </ListItem>
                    <ListItem onClick={() => !editing && setEditing(true)} sx={{ cursor: !editing ? 'pointer' : 'default' }}>
                        <ListItemIcon><BadgeIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Placa"
                            secondary={
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    size="small"
                                    value={formData.placa || ''}
                                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                                    placeholder="ABC-123"
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                    InputProps={{
                                        readOnly: !editing,
                                        disableUnderline: !editing,
                                        style: { color: 'text.primary', fontWeight: editing ? 'normal' : '500' }
                                    }}
                                />
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
                    <ListItem onClick={() => !editing && setEditing(true)} sx={{ cursor: !editing ? 'pointer' : 'default' }}>
                        <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary="Teléfono"
                            secondary={
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    size="small"
                                    value={formData.telefono || ''}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="300 123 4567"
                                    InputProps={{
                                        readOnly: !editing,
                                        disableUnderline: !editing,
                                        style: { color: 'text.primary', fontWeight: editing ? 'normal' : '500' }
                                    }}
                                />
                            }
                        />
                    </ListItem>
                </List>
            </Card>

            {/* FinDriver Pro: Costos Fijos */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1, color: 'primary.main' }}>
                Costos Fijos Anuales (CPK)
            </Typography>
            <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Ingresa estos costos anuales para que FinDriver calcule automáticamente tu deducción diaria.
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Seguro Anual"
                            type="number"
                            fullWidth
                            size="small"
                            value={formData.costosFijos?.seguroAnual || ''}
                            onChange={(e) => setFormData({ ...formData, costosFijos: { ...formData.costosFijos, seguroAnual: e.target.value } })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                readOnly: !editing
                            }}
                            variant={editing ? "outlined" : "filled"}
                            onClick={() => !editing && setEditing(true)}
                        />
                        <TextField
                            label="Impuestos / Tenencia"
                            type="number"
                            fullWidth
                            size="small"
                            value={formData.costosFijos?.impuestosAnuales || ''}
                            onChange={(e) => setFormData({ ...formData, costosFijos: { ...formData.costosFijos, impuestosAnuales: e.target.value } })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                readOnly: !editing
                            }}
                            variant={editing ? "outlined" : "filled"}
                            onClick={() => !editing && setEditing(true)}
                        />
                        <TextField
                            label="Depreciación Estimada (Año)"
                            type="number"
                            fullWidth
                            size="small"
                            value={formData.costosFijos?.depreciacionAnual || ''}
                            onChange={(e) => setFormData({ ...formData, costosFijos: { ...formData.costosFijos, depreciacionAnual: e.target.value } })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                readOnly: !editing
                            }}
                            variant={editing ? "outlined" : "filled"}
                            onClick={() => !editing && setEditing(true)}
                        />
                        <TextField
                            label="Plan Celular (Mensual)"
                            type="number"
                            fullWidth
                            size="small"
                            value={formData.costosFijos?.planCelularMensual || ''}
                            onChange={(e) => setFormData({ ...formData, costosFijos: { ...formData.costosFijos, planCelularMensual: e.target.value } })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                readOnly: !editing
                            }}
                            variant={editing ? "outlined" : "filled"}
                            onClick={() => !editing && setEditing(true)}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Settings */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, ml: 1 }}>
                Configuración
            </Typography>
            <Card sx={{ mb: 3 }}>
                <List disablePadding>
                    <ListItem divider onClick={() => !editing && setEditing(true)} sx={{ cursor: !editing ? 'pointer' : 'default' }}>
                        <ListItemIcon><NotificationsIcon /></ListItemIcon>
                        <ListItemText
                            primary="Notificaciones"
                            secondary={!editing ? "Toca para cambiar" : null}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                checked={formData.notificaciones}
                                onChange={(e) => editing && setFormData({ ...formData, notificaciones: e.target.checked })}
                                disabled={!editing}
                                sx={{ pointerEvents: !editing ? 'none' : 'auto' }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><DarkModeIcon /></ListItemIcon>
                        <ListItemText primary="Tema oscuro" />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                checked={mode === 'dark'}
                                onChange={toggleTheme}
                            // Theme is always editable as it's a global preference, unrelated to profile form data
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
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<EditIcon />}
                            onClick={() => setEditing(true)}
                            sx={{ mb: 2 }}
                        >
                            Editar Perfil
                        </Button>
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
                    </>
                )}
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 4, color: 'text.disabled' }}>
                <Typography variant="caption" display="block">Versión 1.0.2</Typography>
                <Typography variant="caption">© 2025 Ing. Antonio Rodríguez. Todos los derechos reservados.</Typography>
            </Box>
        </Box>
    );
}
