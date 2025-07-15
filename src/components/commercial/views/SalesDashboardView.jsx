// src/components/sales/SalesDashboardView.jsx
import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
} from "@mui/material";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PercentIcon from '@mui/icons-material/Percent';

import SalesIndicatorCard from "../common/sales/SalesIndicatorCard";
import SalesBarChart from "../common/sales/SalesBarChart";
import ProbabilityFactors from "../common/sales/ProbabilityFactors";
import SalesProductSummary from "../common/sales/SalesProductSummary";
import AccountsReceivableSummary from "../common/sales/AccountsReceivableSummary";
import InfoCard from "../../common/infoCard";
import useIndicator from "../hooks/useIndicator";
import useProductInventory from "../hooks/useProductInventory";


const productData = [
  {
    name: "Alfaros",
    unitPrice: 65000,
    monthlyGoal: 2650,
    soldD1: 1650,
    stock: 250,
    coverage: 9,
    baseProbability: 70,
    priceFactor: -2
  },
  {
    name: "Betacos",
    unitPrice: 50000,
    monthlyGoal: 2650,
    soldD1: 2300,
    stock: 250,
    coverage: 9,
    baseProbability: 70,
    priceFactor: -2
  },
  {
    name: "Gamaroles",
    unitPrice: 65000,
    monthlyGoal: 2650,
    soldD1: 850,
    stock: 250,
    coverage: 9,
    baseProbability: 70,
    priceFactor: -2
  }
];

const receivableData = [
  {
    term: 30,
    amount: 32000000,
    dueDate: "2025-02-15"
  },
  {
    term: 60,
    amount: 45000000,
    dueDate: "2025-03-15"
  }
];

const SalesDashboardView = () => {
  const [receivables, setReceivables] = useState(receivableData);

  const {
    indicators,
    totalsByDecade,
    totalMonth,
    percentagesByDecade,
    totalProjectedMonth,
    projectedTotalsByDecade,
    projectedPercentagesByDecade,
    numSellers,
    loading,
    error
  } = useIndicator();

  console.log(totalsByDecade, percentagesByDecade, totalProjectedMonth, projectedPercentagesByDecade);

  const { products } = useProductInventory();

  const totalPercent = products.reduce((acc, item) => acc + (item.investment_percent || 0), 0);
  const averagePercent = products.length > 0 ? totalPercent / products.length : 0;

  console.log(products);

  const indicatorsData = indicators.map((item) => {
    let icon = null;
    let colorKey = "blue";
    let subtitle = "";

    switch (item.key) {
      case "ventasActuales":
        icon = <MonetizationOnIcon fontSize="large" />;
        colorKey = "green";
        subtitle = `${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}% de la meta`;
        break;
      case "vendedores":
        icon = <PeopleIcon fontSize="large" />;
        colorKey = "blue";
        subtitle = `${item.change > 0 ? "+" : ""}${item.change} Intentos de venta`;
        break;
      case "porCobrar":
        icon = <ReceiptIcon fontSize="large" />;
        colorKey = "orange";
        subtitle = `${item.change.toFixed(2)}% sobre ventas`;
        break;
      case "comisiones":
        icon = <PercentIcon fontSize="large" />;
        colorKey = "purple";
        subtitle = "+1% por venta";
        break;
      default:
        subtitle = "";
    }

    return {
      title: item.title,
      value: `$${item.value.toLocaleString("es-CO")}`,
      subtitle,
      icon,
      colorKey,
    };
  });

  const chartData = ['1', '2', '3'].map(decade => ({
    name: `Década ${decade}`,
    Real: Number(totalsByDecade[decade] || 0),
    Proyectado: Number(projectedTotalsByDecade[decade] || 0),
  }));

  let totalCreditPercent = 0;
  products.forEach(product => {
    const c30 = Number(product.credit30) || 0;
    const c60 = Number(product.credit60) || 0;

    const c30Percent = Math.min((c30 / 30) * 2, 2);
    const c60Percent = Math.min((c60 / 30) * 3, 3);

    totalCreditPercent += c30Percent + c60Percent;
  });

  const avgCreditPercent = products.length > 0 ? totalCreditPercent / products.length : 0;

  const creditLabelValue = `+${avgCreditPercent.toFixed(0)}% Probabilidad`;

  let competitiveCount = 0;

  products.forEach(product => {
    const price = Number(product.currentPrice) || 0;
    const min = Number(product.suggestedMin) || 0;
    const max = Number(product.suggestedMax) || 0;

    if (price >= min && price <= max) {
      competitiveCount++;
    }
  });

  let competitivePercent = 0;
  if (competitiveCount === products.length) {
    competitivePercent = 4.5;
  } else if (competitiveCount === 2) {
    competitivePercent = 3;
  } else if (competitiveCount === 1) {
    competitivePercent = 1.5;
  } else {
    competitivePercent = 0; 
  }

  const competitiveValue = `+${competitivePercent}% Probabilidad`;

  const factors = [
    { label: "Marketing", value: `+${averagePercent.toFixed(0)}% Probabilidad` },
    { label: `Vendedores (${numSellers})`, value: `${numSellers > 0 ? "+" : ""}${numSellers} Intentos de venta` },
    { label: "Políticas Crédito", value: creditLabelValue },
    { label: "Precios Competitivos", value: competitiveValue }
  ];

  const handleCollect = (credit) => {
    setReceivables((prev) =>
      prev.filter((item) => item.dueDate !== credit.dueDate)
    );
  };

  return (
    <Box>
      {/* Indicadores */}
      <Grid container spacing={2} mt={1}>
        {indicatorsData.map((indicator, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <SalesIndicatorCard {...indicator} />
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <SalesBarChart data={chartData} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ProbabilityFactors factors={factors} />
          </Grid>
        </Grid>
      </Box>

      <Box mt={5}>
        <SalesProductSummary products={productData} />
      </Box>

      <Box mt={5}>
        <AccountsReceivableSummary receivables={receivables} onCollect={handleCollect} />
      </Box>
    </Box>
  );
};

export default SalesDashboardView;
