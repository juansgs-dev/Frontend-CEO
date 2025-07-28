// usePendingCredits.js
import { useState, useEffect } from 'react';
import { getUserId } from '../../../utils/timeManagement/operationTime.js';
import axiosInstance from '../../../services/api/axiosConfig.js';

const usePendingCredits = () => {
  const [pendingCredits, setPendingCredits] = useState([]);
  const [simulatedDate, setSimulatedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = getUserId();

  const fetchPendingCredits = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/credit/get-pending', {
        params: { user_id: userId }
      });

      const { pendingCredits, simulatedDate } = response.data;

      setPendingCredits(pendingCredits || []);
      setSimulatedDate(simulatedDate || null);
    } catch (err) {
      console.error('Error al obtener créditos pendientes:', err);
      setError(err.response?.data?.message || 'Error al obtener créditos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCredits();
  }, [userId]);

  return {
    pendingCredits,
    setPendingCredits,
    simulatedDate,
    loading,
    error
  };
};

export default usePendingCredits;
