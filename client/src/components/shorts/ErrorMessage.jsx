import React from 'react';

const ErrorMessage = ({ error }) => (
  error ? (
    <div style={{ color: '#d32f2f', marginBottom: 10, fontWeight: 600, fontSize: 12 }}>{error}</div>
  ) : null
);

export default ErrorMessage; 