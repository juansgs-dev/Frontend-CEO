import { useState, useEffect } from 'react';
import { getUserId } from '../../../utils/timeManagement/operationTime.js';
import { getSimulatedCurrentDate } from '../../../utils/timeManagement/simulatedDate.js';
import axiosInstance from '../../../services/api/axiosConfig.js';

const usePendingCredits = () => {
  const [pendingCredits, setPendingCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = getUserId();

  useEffect(() => {
    const fetchPendingCredits = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get('/credit/get-pending', {
          params: { user_id: userId }
        });

        const credits = response.data.pendingCredits || [];
        const simulatedNow = getSimulatedCurrentDate();

        const enrichedCredits = credits.map(credit => {
          const createdAt = new Date(credit.created_at);
          const dueDate = new Date(createdAt.getTime() + credit.credit_days * 24 * 60 * 60 * 1000);
          const diffMs = dueDate - simulatedNow;
          const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          return {
            ...credit,
            daysRemaining
          };
        });

        setPendingCredits(enrichedCredits);
      } catch (err) {
        console.error('Error al obtener créditos pendientes:', err);
        setError(err.response?.data?.message || 'Error al obtener créditos pendientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCredits();
  }, [userId]);

  return {
    pendingCredits,
    loading,
    error
  };
};

export default usePendingCredits;
