// 도메인 정의서 4장: 상태(Status) 계산 규칙, 서버 UTC 자정 기준 today
function computeStatus({ startDate, endDate, isCompleted }) {
  if (isCompleted) return 'COMPLETED';
  const today = new Date().toISOString().slice(0, 10);
  if (today < startDate) return 'NOT_STARTED';
  if (today > endDate) return 'OVERDUE';
  return 'IN_PROGRESS';
}

module.exports = { computeStatus };
