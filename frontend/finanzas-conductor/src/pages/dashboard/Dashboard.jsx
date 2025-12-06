import React, { useState, useEffect } from 'react'
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Tabs,
    Tab
} from '@mui/material'
import {
    TrendingUp,
    Timeline,
    LocalGasStation,
    AttachMoney
} from '@mui/icons-material'
import CostPerKmPanel from '../../components/costs/CostPerKmPanel'
import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
    const { user } = useAuth()
    const [tabValue, setTabValue] = useState(0)
    const [transactions, setTransactions] = useState([])

    // Datos de ejemplo para costos
    const sampleTransactions = [
        { id: 1, tipo: 'ingreso', descripcion: 'Viaje al centro', monto: 150000, fecha: '2024-01-15', categoria: 'viaje', viaje: { distanciaKm: 8 } },
        { id: 2, tipo: 'gasto', descripcion: 'Gasolina', monto: 50000, fecha: '2024-01-15', categoria: 'fuel' },
        { id: 3, tipo: 'ingreso', descripcion: 'Viaje al aeropuerto', monto: 200000, fecha: '2024-01-14', categoria: 'viaje', viaje: { distanciaKm: 25 } },
        { id: 4, tipo: 'gasto', descripcion: 'Cambio de aceite', monto: 80000, fecha: '2024-01-13', categoria: 'maintenance' },
        { id: 5, tipo: 'gasto', descripcion: 'Peaje', monto: 15000, fecha: '2024-01-14', categoria: 'tolls' },
        { id: 6, tipo: 'gasto', descripcion: 'Estacionamiento', monto: 20000, fecha: '2024-01-14', categoria: 'parking' },
        { id: 7, tipo: 'ingreso', descripcion: 'Viaje al centro comercial', monto: 120000, fecha: '2024-01-13', categoria: 'viaje', viaje: { distanciaKm: 12 } },
        { id: 8, tipo: 'gasto', descripcion: 'Almuerzo', monto: 30000, fecha: '2024-01-13', categoria: 'food' },
    ]

    useEffect(() => {
        // En una app real, esto vendría de una API
        setTransactions(sampleTransactions)
    }, [])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    return (
        <Box>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    ¡Bienvenido, {user?.nombre || 'Conductor'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Controla tus costos y maximiza tus ganancias
                </Typography>
            </Paper>

            {/* Tabs de Navegación */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 600
                        }
                    }}
                >
                    <Tab icon={<Timeline />} label="Análisis de Costos" />
                    <Tab icon={<TrendingUp />} label="Resumen General" />
                    <Tab icon={<LocalGasStation />} label="Combustible" />
                    <Tab icon={<AttachMoney />} label="Ganancias" />
                </Tabs>
            </Paper>

            {/* Contenido basado en tab seleccionada */}
            {tabValue === 0 ? (
                <CostPerKmPanel transactions={transactions} />
            ) : (
                <Grid container spacing={3}>
                    {/* Otras pestañas... */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Resumen General
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Selecciona "Análisis de Costos" para ver el cálculo detallado por kilómetro.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Quick Stats Bar */}
            <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Kilometraje Total
                            </Typography>
                            <Typography variant="h6">45 km</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Costo Promedio/km
                            </Typography>
                            <Typography variant="h6">$0.85</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Viajes Hoy
                            </Typography>
                            <Typography variant="h6">3</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Eficiencia
                            </Typography>
                            <Typography variant="h6" color="success.main">
                                42.5%
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}

export default Dashboard
