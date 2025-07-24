import React, { useState } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, Alert, Button, useTheme
} from '@mui/material';
import usePendingCredits from '../hooks/usePendingCredits';
import axios from 'axios';

const PendingCreditsView = () => {
  const theme = useTheme();
  const { pendingCredits, loading, error, refetch } = usePendingCredits(); // refetch para recargar después de cobrar
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

const handleMarkAsPaid = async (operation_id) => {
  try {
    const { data } = await axios.post('/credit/mark-as-paid', { operation_id });
    if (data.ok) {
      showToast('Crédito cobrado correctamente', 'success');
      refetch(); // recargar lista
    } else {
      showToast(data.message || 'No se pudo cobrar', 'warning');
    }
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al cobrar', 'error');
  }
};

  // Filtramos por fechas si están definidas
  const filteredCredits = pendingCredits.filter(credit => {
    const createdAt = new Date(credit.created_at);
    if (startDate && createdAt < new Date(startDate)) return false;
    if (endDate && createdAt > new Date(endDate)) return false;
    return true;
  });

  return (
    <Box p={4}>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Desde"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="Hasta"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {(error || errorMessage) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Fecha de Venta</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Total ($)</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Días de Crédito</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Días Restantes</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCredits.length > 0 ? (
                filteredCredits.map((credit) => {
                  const canBePaid = credit.daysRemaining <= 0; // solo se puede pagar si venció
                  return (
                    <TableRow key={credit.id}>
                      <TableCell>{new Date(credit.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{credit.total_cost.toLocaleString()}</TableCell>
                      <TableCell align="right">{credit.credit_days}</TableCell>
                      <TableCell align="right">
                        {credit.daysRemaining > 0 ? credit.daysRemaining : 'Vencido'}
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
                    No hay créditos pendientes en este rango de fechas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PendingCreditsView;
