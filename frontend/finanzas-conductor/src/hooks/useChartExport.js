import { useCallback } from 'react';
import html2canvas from 'html2canvas';

export const useChartExport = () => {
    const exportAsImage = useCallback(async (elementRef, fileName = 'chart-export') => {
        if (!elementRef.current) return;

        try {
            const canvas = await html2canvas(elementRef.current, {
                backgroundColor: '#f8f9fa', // Match app background
                scale: 2, // Higher quality
                logging: false,
                useCORS: true
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting chart:', error);
            alert('Hubo un error al exportar la imagen.');
        }
    }, []);

    return { exportAsImage };
};
