// src/components/sales/SalesRecordTab.jsx

import React, { useState } from "react";
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Typography,
    InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PercentIcon from "@mui/icons-material/Percent";

import SalesTable from "../common/sales/SalesTable";
import SalesIndicatorCard from "../common/sales/SalesIndicatorCard";
import useIndicatorRecords from "../hooks/useIndicatorRecords";
import { PROGRESS_MONTH_KEY } from "../../../utils/timeManagement/operationTime";
import useSalesRecords from "../hooks/useSalesRecords";


const types = ["Todos", "Empresa", "Cliente Mayorista", "Cliente Natural"];

const SalesRecordView = () => {
    const [progressData, setProgressData] = useState(() => {
        const stored = localStorage.getItem(PROGRESS_MONTH_KEY);
        return stored
            ? JSON.parse(stored)
            : { currentMonth: 1, currentDecade: 1, isDecember: false, elapsedMinutes: 0 };
    });


    const [page, setPage] = useState(1);

    const pageSize = 10;

    const monthsOptions = ["Todos", ...Array.from({ length: progressData.currentMonth }, (_, i) => i + 1)];
    const decadesOptions = ["Todos", 1, 2, 3];

    const [filters, setFilters] = useState({
        type: "Todos",
        search: "",
        month: "Todos",
        decade: "Todos",
    });

    const { indicators } = useIndicatorRecords(filters);
    const { sales, loading, error, totalPages } = useSalesRecords(filters, page, pageSize);

    const recordsData = indicators.map((item) => {
        let icon = null;
        let colorKey = item.colorKey || "blue";
        let subtitle = item.subtitle || "";

        switch (item.title) {
            case "Total Vendido":
                icon = <MonetizationOnIcon fontSize="large" />;
                break;
            case "Ventas Mayoristas":
                icon = <StorefrontIcon fontSize="large" />;
                break;
            case "Ventas Minoristas":
                icon = <ShoppingCartIcon fontSize="large" />;
                break;
            case "Comisiones":
                icon = <PercentIcon fontSize="large" />;
                break;
            default:
                icon = null;
        }

        return {
            ...item,
            icon,
            colorKey,
            subtitle,
        };
    });

    const handleChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
        setPage(1);
    };

    return (
        <Box>
            {/* Filtros */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        label="Mes"
                        select
                        fullWidth
                        size="small"
                        value={filters.month}
                        onChange={(e) => handleChange("month", e.target.value)}
                    >
                        {monthsOptions.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m === "Todos" ? "Todos" : `Mes ${m}`}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        label="Década"
                        select
                        fullWidth
                        size="small"
                        value={filters.decade}
                        onChange={(e) => handleChange("decade", e.target.value)}
                    >
                        {decadesOptions.map((d) => (
                            <MenuItem key={d} value={d}>
                                {d === "Todos" ? "Todos" : `Década ${d}`}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        label="Tipo de Venta"
                        select
                        fullWidth
                        size="small"
                        value={filters.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                    >
                        {types.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por ID o cliente"
                        value={filters.search}
                        onChange={(e) => handleChange("search", e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            {/* Indicadores */}
            <Grid container spacing={2}>
                {recordsData.map((item, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <SalesIndicatorCard
                            title={item.title}
                            value={item.value}
                            subtitle={item.subtitle}
                            icon={item.icon}
                            colorKey={item.colorKey}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Tabla de ventas */}
            <SalesTable
                sales={sales}
                filters={filters}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
            />
        </Box>
    );
};

export default SalesRecordView;
