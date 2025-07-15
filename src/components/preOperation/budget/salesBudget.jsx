import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Inventory as PackageIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

// Componentes
import MonthSelector from "./common/monthSelector";
import ProductInputForm from "./common/productInputForm";
import BudgetResultsTable from "./common/budgetResultsTable";

// Hooks
import useBudgetData from "../../../hooks/budget/useBudgetData";

// Utils
import { calculateTotals } from "../../../utils/budget/budgetCalculations";
import axiosInstance from "../../../services/api/axiosConfig";
import showAlert from "../../../utils/functions";
import { getUserId } from "../../../utils/timeManagement/operationTime";

const defaultProducts = [
  { id: "alfaros", productId: 1, name: "Alfaros", quantity: 2650 },
  { id: "betacos", productId: 2, name: "Betacos", quantity: 1920 },
  { id: "gamaroles", productId: 3, name: "Gamaroles", quantity: 1060 },
];

/**
 * Componente para el presupuesto de ventas
 * @param {Object} props Propiedades del componente
 * @param {Object} props.budgetConfig Configuración del presupuesto
 * @param {Object} props.theme Tema de Material UI
 * @returns {JSX.Element} Componente renderizado
 */
const SalesBudget = ({ budgetConfig, theme, budgetType, onSuccess }) => {
  // Estado para diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Productos para el presupuesto de ventas
  const [products, setProducts] = useState(defaultProducts);

  useEffect(() => {
    const fetchProjectedSales = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = getUserId();

        const response = await axiosInstance.get(
          `/salesbudget/getProjectSales/${userId}`
        );

        const data = response?.data?.data ?? [];

        if (data.length > 0) {
          const formatted = data.map((item) => ({
            id: (item.Product?.name ?? "desconocido").toLowerCase(),
            productId: item.Product?.id ?? null,
            name: item.Product?.name ?? "Sin nombre",
            quantity: Number(item.quantity),
          }));
          setProducts(formatted);
        } else {
          setProducts(defaultProducts);
        }
      } catch (err) {
        console.error("Error al obtener proyecciones de ventas:", err);

        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("No se pudo cargar la proyección de ventas.");
        }

        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectedSales();
  }, []);

 const budgetData = useBudgetData(products, setProducts);

  const {
    selectedMonth,
    setSelectedMonth,
    monthlyData,
    handleProductChange,
    calculateDecadeValues,
    getProductTotal,
  } = budgetData;

  // Calcular valor de ventas para cada producto y mes según el crecimiento configurado
  const getCalculatedValue = (month, productId) => {
    // Para el mes 1, usar el valor ingresado manualmente
    if (month === 1) {
      return monthlyData[1]?.[productId] || 0;
    }

    // Para los meses 2-12, calcular basado en el crecimiento acumulativo
    let baseValue = monthlyData[1]?.[productId] || 0;
    let cumulativeGrowth = 100; // Comenzar con 100% (sin crecimiento)

    // Sumar los porcentajes de crecimiento de los meses anteriores
    for (let i = 1; i < month; i++) {
      cumulativeGrowth += Number(budgetConfig.growthRates[i]) || 0;
    }

    // Aplicar el crecimiento acumulado
    return Math.round((baseValue * cumulativeGrowth) / 100);
  };

  // Calcular distribución por décadas para un mes y producto específicos
  const calculateProductDecadeValues = (month, productId) => {
    const total = getCalculatedValue(month, productId);
    const distribution = budgetConfig.decadeDistribution[month - 1];

    return {
      d1: Math.round((total * distribution.d1) / 100),
      d2: Math.round((total * distribution.d2) / 100),
      d3: Math.round((total * distribution.d3) / 100),
      total,
    };
  };

  // Calcular totales por década para el mes seleccionado
  const totals = calculateTotals(
    products,
    calculateProductDecadeValues,
    selectedMonth
  );

  // Manejar guardar datos del mes 1
  const handleSave = () => {
    if (selectedMonth === 1) {
      setOpenConfirmDialog(true);
    }
  };

  const userData = JSON.parse(localStorage.getItem("userData")) || null;

  const createdBy = userData.id;

  const confirmSave = async () => {
    try {
      const formattedData = products.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        created_by: createdBy
      }));

      const response = await axiosInstance.post("/salesbudget/createProjectedSales", {
        projectedSalesData: formattedData
      });

      if (response.data.ok) {
        showAlert(
          "Ventas proyectadas",
          "¡Proyecciones guardadas con éxito!",
          "success",
          "#1C4384"
        );

        if (onSuccess) onSuccess();
      } else {
        showAlert(
          "Ventas proyectadas",
          "Error al guardar proyecciones",
          "error",
          "#1C4384"
        );
      }
    } catch (error) {
      showAlert(
        "Ventas proyectadas",
        "Error al guardar proyecciones",
        "error",
        "#1C4384"
      );
    } finally {
      setOpenConfirmDialog(false);
    }
  };

  // Calcular crecimiento acumulado para el mes seleccionado
  const getAccumulatedGrowth = () => {
    if (selectedMonth === 1) return 0;

    let totalGrowth = 0;
    for (let i = 1; i < selectedMonth; i++) {
      totalGrowth += Number(budgetConfig.growthRates[i]) || 0;
    }
    return totalGrowth;
  };

  const isFirstMonth = selectedMonth === 1;
  const accumulatedGrowth = getAccumulatedGrowth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Selector de Mes */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        theme={theme}
      />

      {/* Mensaje Informativo */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          bgcolor: "#EBF5FF",
          color: theme.palette.primary.main,
          border: "1px solid rgba(28, 67, 132, 0.2)",
          "& .MuiAlert-icon": {
            color: theme.palette.primary.main,
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: "bold" }}>
          {isFirstMonth
            ? "Configuración de Ventas Iniciales"
            : "Proyección de Ventas Calculada"}
        </AlertTitle>
        {isFirstMonth
          ? "Establece las unidades a vender de cada producto para el Mes 1. Los meses siguientes se calcularán automáticamente según el crecimiento configurado."
          : `Las ventas del Mes ${selectedMonth} se calculan automáticamente con un crecimiento acumulado del ${accumulatedGrowth}% respecto al Mes 1.`}
      </Alert>

      {/* Formulario de Entrada de Productos */}
      <ProductInputForm
        products={products}
        selectedMonth={selectedMonth}
        handleProductChange={handleProductChange}
        getCalculatedValue={getCalculatedValue}
        decadeDistribution={budgetConfig.decadeDistribution}
        growthRates={budgetConfig.growthRates}
        theme={theme}
        onSave={handleSave}
        title={
          isFirstMonth
            ? "Datos del Mes 1"
            : `Datos Proyectados - Mes ${selectedMonth}`
        }
        inputLabel="Unidades Totales"
        icon={isFirstMonth ? PackageIcon : CalculateIcon}
        readOnly={!isFirstMonth}
        accumulatedGrowth={accumulatedGrowth}
        showSaveButton={isFirstMonth}
      />



      {/* Tabla de Resultados */}
      <BudgetResultsTable
        products={products}
        calculateValues={calculateProductDecadeValues}
        selectedMonth={selectedMonth}
        theme={theme}
        totals={totals}
        title={budgetType?.title}
        columnTitle="Producto"
        itemTitle="name"
      />

      {/* Diálogo de Confirmación */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckIcon /> Confirmar Guardado
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            ¿Estás seguro de que deseas guardar los datos del Mes 1? Estos
            valores servirán como base para calcular las proyecciones de los
            demás meses.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmSave}
            variant="contained"
            color="primary"
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesBudget;
