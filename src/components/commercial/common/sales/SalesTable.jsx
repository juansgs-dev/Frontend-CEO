import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Chip,
  Typography,
  Box,
  useTheme,
  Pagination,
  TableSortLabel,
} from "@mui/material";

const getTypeColor = (type) =>
  type === "Empresa"
    ? "info"
    : type === "Cliente Mayorista"
      ? "primary"
      : type === "Cliente Natural"
        ? "warning"
        : "default";

const SalesTable = ({ sales = [], filters, page, setPage, totalPages }) => {
  const theme = useTheme();

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null); // sin ordenar
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = sales.filter((item) => {
    const matchType = filters.type === "Todos" || item.type === filters.type;
    const matchSearch =
      filters.search === "" ||
      item.id.toString().toLowerCase().includes(filters.search.toLowerCase()) ||
      item.client.toLowerCase().includes(filters.search.toLowerCase());
    return matchType && matchSearch;
  });

  const sorted = sortField
    ? [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null || bValue == null) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    })
    : filtered;

  return (
    <Box mt={3}>
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {[
                { label: "ID Venta", field: "id" },
                { label: "Producto", field: "product" },
                { label: "Cantidad", field: "quantity" },
                { label: "Valor Total", field: "total" },
                { label: "Cliente", field: "client" },
                { label: "Tipo", field: "type" },
                { label: "Pago", field: "payment" },
                { label: "Fecha", field: "date" },
              ].map(({ label, field }) => (
                <TableCell key={field}>
                  <TableSortLabel
                    active={sortField === field}
                    direction={sortField === field && sortDirection ? sortDirection : "asc"}
                    onClick={() => handleSort(field)}
                    sx={{ color: "white", "& .MuiSvgIcon-root": { color: "white" } }}
                  >
                    <Typography variant="body2" fontWeight={600} color="common.white">
                      {label}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography fontWeight={500}>{row.id}</Typography>
                </TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{row.total}</Typography>
                </TableCell>
                <TableCell>{row.client}</TableCell>
                <TableCell>
                  <Chip label={row.type} size="small" color={getTypeColor(row.type)} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.payment === "Pagado" ? "Pagado" : "Pendiente"}
                    size="small"
                    color={row.payment === "Pagado" ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(row.date).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default SalesTable;
