import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const SalesProductSummary = ({ products }) => {
  const theme = useTheme();

  const getCustomProgressColor = (value) => {
    if (value >= 80) return theme.palette.primary.main;
    if (value >= 40) return theme.palette.primary.light;
    return theme.palette.info.main;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Resultado: Detalle por Producto
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {products.map((product) => {
            const progress = Math.round((product.soldD1 / product.monthlyGoal) * 100);
            const progressColor = getCustomProgressColor(progress);

            return (
              <Grid item xs={12} md={4} key={product.name}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid ${progressColor}`,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    height: "100%",
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <InventoryIcon sx={{ color: progressColor }} />
                      <Typography variant="subtitle1" fontWeight={700} color={progressColor}>
                        {product.name}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Precio: <strong>${product.unitPrice.toLocaleString()}/unidad</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Meta Mensual: <strong>{product.monthlyGoal} und</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ventas D1: <strong>{product.soldD1} und</strong>
                    </Typography>

                    <Box mt={1} mb={1}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progressColor,
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={progressColor}
                      >
                        {progress}% meta D1
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary">
                      Stock actual: <strong>{product.stock} und</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SalesProductSummary;
