export const formatDate = (dateInput: string | Date | undefined): string => {
  if(!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const toInputDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};