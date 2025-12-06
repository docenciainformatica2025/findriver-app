import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material'
import {
    Menu as MenuIcon,
    Dashboard,
    Receipt,
    TrendingUp,
    Assessment,
    Person,
    Logout,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import Footer from './Footer'

const drawerWidth = 240

const Layout = () => {
    const [open, setOpen] = useState(true)
    const [anchorEl, setAnchorEl] = useState(null)
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleDrawerToggle = () => {
        setOpen(!open)
    }

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        await signOut()
        handleMenuClose()
    }

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Transacciones', icon: <Receipt />, path: '/transactions' },
        { text: 'Estadísticas', icon: <TrendingUp />, path: '/statistics' },
        { text: 'Reportes', icon: <Assessment />, path: '/reports' },
        { text: 'Perfil', icon: <Person />, path: '/profile' },
    ]

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    transition: (theme) =>
                        theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    ...(open && {
                        marginLeft: drawerWidth,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: (theme) =>
                            theme.transitions.create(['width', 'margin'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Finanzas Conductor
                    </Typography>

                    {/* User Menu */}
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {user?.nombre?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile') }}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Perfil</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Cerrar Sesión</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 57,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 57,
                        transition: (theme) =>
                            theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                    }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{ opacity: open ? 1 : 0 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </Box>

                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleDrawerToggle}>
                        {open ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                    {open && (
                        <Typography variant="body2" color="text.secondary">
                            {open ? 'Contraer menú' : 'Expandir menú'}
                        </Typography>
                    )}
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: `calc(100% - ${open ? drawerWidth : 57}px)`,
                    backgroundColor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Toolbar /> {/* Espacio para el AppBar */}
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Outlet /> {/* Contenido de las rutas */}
                </Box>
                <Footer />
            </Box>
        </Box>
    )
}

export default Layout
