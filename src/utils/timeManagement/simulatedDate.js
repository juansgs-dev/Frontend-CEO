export const getSimulatedCurrentDate = (startTime) => {
  if (!startTime) return new Date();

  const now = new Date();
  const elapsedMs = now - new Date(startTime);   // tiempo transcurrido desde que empezó la simulación
  const elapsedMinutes = elapsedMs / 60000;

  // Cada semana real = 1 mes simulado (7 días * 24 horas * 60 min = 10080 min)
  const simulatedMinutesPerMonth = 10080;
  const monthsElapsed = elapsedMinutes / simulatedMinutesPerMonth;

  // Creamos la fecha simulada sumando esos meses al startTime
  const simulatedDate = new Date(startTime);
  simulatedDate.setMonth(simulatedDate.getMonth() + Math.floor(monthsElapsed));

  return simulatedDate;
};
