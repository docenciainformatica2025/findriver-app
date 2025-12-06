import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MaintenanceAlerts from '../components/MaintenanceAlerts';
import client from '../api/client';

// Mock API Client
vi.mock('../api/client');

describe('MaintenanceAlerts Component', () => {
    it('renders loading state initially', () => {
        // Mock waiting promise
        client.get.mockImplementation(() => new Promise(() => { }));
        const { container } = render(<MaintenanceAlerts />);
        expect(container.firstChild).toBeNull(); // Returns null on loading
    });

    it('renders healthy status when no alerts', async () => {
        client.get.mockResolvedValue({
            data: {
                data: {
                    vehicleName: 'Toyota Corolla',
                    kilometraje: 50000,
                    alertas: []
                }
            }
        });

        render(<MaintenanceAlerts />);

        await waitFor(() => {
            expect(screen.getByText('Salud del Vehículo')).toBeInTheDocument();
            expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
            expect(screen.getByText('Todo en orden. ¡Excelentes condiciones!')).toBeInTheDocument();
        });
    });

    it('renders alerts when present', async () => {
        client.get.mockResolvedValue({
            data: {
                data: {
                    vehicleName: 'Toyota Corolla',
                    kilometraje: 50000,
                    alertas: [
                        { tipo: 'mantenimiento', mensaje: 'Cambio de aceite', prioridad: 'alta' }
                    ]
                }
            }
        });

        render(<MaintenanceAlerts />);

        await waitFor(() => {
            expect(screen.getByText('Cambio de aceite')).toBeInTheDocument();
        });
    });
});
