export const formatD = (d?: string | null): string | null => {
  if (!d) return null;
  try {
    const date = new Date(d);
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
  } catch {
    return d;
  }
};

export const formatCanvasDue = (d?: string | null): string => {
  if (!d) return 'No due date';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
    return `${month} ${day} by ${time}`;
  } catch {
    return d;
  }
};

export const formatCanvasSubmitted = (d?: string | null): { dateStr: string; timeStr: string } | null => {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
    return {
      dateStr: `${month} ${day}`,
      timeStr: `at ${time}`,
    };
  } catch {
    return null;
  }
};
