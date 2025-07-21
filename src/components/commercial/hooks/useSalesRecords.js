// src/components/hooks/useSalesRecords.js
import { useEffect, useState } from "react";
import axiosInstance from "../../../services/api/axiosConfig.js";
import { getUserId } from "../../../utils/timeManagement/operationTime.js";
import socket from "../../../services/socket.js";

const useSalesRecords = (filters, page, pageSize) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const userId = getUserId();

  const fetchSales = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/monthlyOperation/user-sales-records/${userId}`, {
        params: { month: filters.month, decade: filters.decade, page, pageSize }
      });
      setSales(res.data.sales || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      setError(err.response?.data?.message || "Error al obtener ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [userId, filters.month, filters.decade, page, pageSize]);

  useEffect(() => {
    socket.on('salesUpdated', () => {
      console.log('Evento recibido: salesUpdated, recargando datos...');
      fetchSales();
    });
    return () => {
      socket.off('salesUpdated');
    };
  }, [userId, filters.month, filters.decade, page, pageSize]);

  return { sales, loading, error, totalPages };
};

export default useSalesRecords;
