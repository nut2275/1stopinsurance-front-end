export const CustomStyles = `
  html, body {
    margin: 0;
    height: 100%;
    overflow-y: auto;
    background: #f0f6ff;
    font-family: 'Inter', sans-serif;
  }
  .form-select {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.5rem 2rem 0.5rem 1rem;
    background-color: white;
    font-size: 0.875rem;
    color: #374151;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
  }
  .form-select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
  .table-header th {
    white-space: nowrap;
    color: #e0e7ff;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.025em;
  }
  .table-row {
    transition: all 0.2s;
  }
  .table-row:hover {
    background-color: #eff6ff; /* blue-50 */
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`;