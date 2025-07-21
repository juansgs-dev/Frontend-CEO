import { useEffect, useState } from "react";
import axiosInstance from "../../../services/api/axiosConfig.js";
import { getUserId } from "../../../utils/timeManagement/operationTime.js";

const useSalesRecords = (filters, page, pageSize) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const userId = getUserId();

  useEffect(() => {
    if (!userId) return;

    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/monthlyOperation/user-sales-records/${userId}`,
          {
            params: {
              month: filters.month,
              decade: filters.decade,
              page,
              pageSize,
            }
          }
        );
        setSales(res.data.sales || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error al obtener ventas:", err);
        setError(err.response?.data?.message || "Error al obtener ventas");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [userId, filters.month, filters.decade, page, pageSize]);

  return { sales, loading, error, totalPages };
};

export default useSalesRecords;
