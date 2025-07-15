import { useEffect, useState } from 'react';
import axiosInstance from '../../../services/api/axiosConfig.js';
import { getUserId } from '../../../utils/timeManagement/operationTime.js';

const useIndicator = () => {
  const [indicators, setIndicators] = useState([]);
  const [totalsByDecade, setTotalsByDecade] = useState({});
  const [totalMonth, setTotalMonth] = useState(0);
  const [percentagesByDecade, setPercentagesByDecade] = useState({});
  const [totalProjectedMonth, setTotalProjectedMonth] = useState(0);
  const [projectedTotalsByDecade, setProjectedTotalsByDecade] = useState({});
  const [projectedPercentagesByDecade, setProjectedPercentagesByDecade] = useState({});
  const [numSellers, setnumSellers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = getUserId();

  const monthProgress = localStorage.getItem("monthProgress");

  const monthStatus = JSON.parse(monthProgress);

  const decade = monthStatus.currentDecade;

  useEffect(() => {
    if (!userId) return;

    const fetchIndicators = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/monthlyOperation/user-indicators/${userId}?decade=${decade}`);

        const data = response.data || {};

        setIndicators(data.indicators || []);
        setTotalsByDecade(data.totalsByDecade || {});
        setTotalMonth(data.totalMonth || 0);
        setPercentagesByDecade(data.percentagesByDecade || {});
        setTotalProjectedMonth(data.totalProjectedMonth || 0);
        setProjectedTotalsByDecade(data.projectedTotalsByDecade || {});
        setProjectedPercentagesByDecade(data.projectedPercentagesByDecade || {});
        setnumSellers(data.numSellers || 0);

      } catch (err) {
        console.error('Error al obtener indicadores:', err);
        setError(err.response?.data?.message || 'Error al obtener indicadores.');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [userId]);

  return {
    indicators,
    totalsByDecade,
    totalMonth,
    percentagesByDecade,
    totalProjectedMonth,
    projectedTotalsByDecade,
    projectedPercentagesByDecade,
    numSellers,
    loading,
    error,
  };
};

export default useIndicator;
