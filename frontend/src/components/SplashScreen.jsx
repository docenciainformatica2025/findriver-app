import ThreeDLogo from './ThreeDLogo';

export default function SplashScreen() {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url(/splash_background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 9999,
                '&::before': { // Dark overlay for better logo contrast
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)'
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <ThreeDLogo />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress sx={{ color: 'white' }} />
                </Box>
            </Box>
        </Box>
    );
}
