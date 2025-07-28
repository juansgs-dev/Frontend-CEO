import React, { useState } from 'react';
import {
  Box, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, useTheme, Pagination, Alert
} from '@mui/material';
import usePendingCredits from '../hooks/usePendingCredits';
import axios from 'axios';
import ToastNotification, { showToast } from '../../alerts/ToastNotification';
import { formatCurrency } from '../../../utils/formatters/currencyFormatters';
import axiosInstance from '../../../services/api/axiosConfig';

const PendingCreditsView = () => {
  const theme = useTheme();
  const { pendingCredits, loading, error, setPendingCredits } = usePendingCredits();
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

const handleMarkAsPaid = async (operation_id) => {
  try {
    const response = await axiosInstance.post('/credit/mark-as-paid', { operation_id });

    if (response.data.ok) {
      showToast('Crédito cobrado correctamente', 'success');

      setPendingCredits(prev =>
        prev.filter(credit => credit.id !== operation_id)
      );
    } else {
      showToast(response.data.message || 'No se pudo cobrar', 'warning');
    }
  } catch (err) {
    console.error('Error al marcar como pagado:', err);
    showToast(err.response?.data?.message || 'Error al cobrar', 'error');
  }
};

  const totalPages = Math.ceil(pendingCredits.length / rowsPerPage);
  const currentPageItems = pendingCredits.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box p={4}>
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>

        <ToastNotification />

          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Id</TableCell>
                  <TableCell sx={{ color: 'white' }}>Fecha de Venta</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Total ($)</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Días de Crédito</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Días Restantes</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPageItems.length > 0 ? (
                  currentPageItems.map((credit) => {
                    const canBePaid = credit.days_remaining <= 0;
                    return (
                      <TableRow key={credit.id}>
                        <TableCell>{credit.id}</TableCell>
                        <TableCell>{new Date(credit.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{formatCurrency(credit.total_cost)}</TableCell>
                        <TableCell align="right">{credit.credit_days}</TableCell>
                        <TableCell align="right">
                          {credit.days_remaining > 0 ? credit.days_remaining : 'Vencido'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={!canBePaid}
                            onClick={() => handleMarkAsPaid(credit.id)}
                          >
                            Cobrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay créditos pendientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default PendingCreditsView;
