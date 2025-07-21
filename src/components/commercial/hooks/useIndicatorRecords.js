import { useEffect, useState } from 'react';
import axiosInstance from '../../../services/api/axiosConfig.js';
import { getUserId } from '../../../utils/timeManagement/operationTime.js';
import iconMap from './mappers/iconMapper.js';
import socket from '../../../services/socket.js'; // 👈 Importa el socket

const useIndicatorRecords = (filters) => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = getUserId();

  const fetchIndicatorRecords = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `/monthlyOperation/user-indicators-records/${userId}`,
        {
          params: {
            month: filters.month,
            decade: filters.decade,
          }
        }
      );
      const data = response.data || {};

      const indicatorsWithIcons = (data.indicators || []).map(item => ({
        ...item,
        icon: iconMap[item.icon] || null,
      }));

      setIndicators(indicatorsWithIcons);
    } catch (err) {
      console.error('Error al obtener indicadores de registros:', err);
      setError(err.response?.data?.message || 'Error al obtener indicadores de registros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicatorRecords();
  }, [userId, filters.month, filters.decade]);

  useEffect(() => {
    socket.on('salesUpdated', () => {
      console.log('Evento recibido: salesUpdated, recargando indicadores...');
      fetchIndicatorRecords();
    });

    return () => {
      socket.off('salesUpdated');
    };
  }, [userId, filters.month, filters.decade]);

  return {
    indicators,
    loading,
    error,
  };
};

export default useIndicatorRecords;
