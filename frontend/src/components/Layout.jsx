import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTabs from './navigation/BottomTabs';

/**
 * Layout principal de la aplicación.
 * Envuelve el contenido en un contenedor flexible que asegura que el Footer
 * siempre esté al final de la página (sticky footer).
 */
export default function Layout({ children }) {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',

            // bgcolor: 'background.default', // REMOVED: Managed by body/CSS to show background image
            pb: { xs: 7, md: 0 } // Add padding on mobile preventing bottom nav overlap
        }}>
            {/* Navbar hidden on mobile if we decide full app feel, but title is useful. Keeping it for now but maybe simplified */}
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
                {children}
            </Box>

            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <BottomTabs />
            </Box>

            {/* Footer hidden on mobile to save space, shown on desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Footer />
            </Box>
        </Box>
    );
}
