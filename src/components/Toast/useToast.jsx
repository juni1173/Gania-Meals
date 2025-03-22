import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const useToast = () => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const closeToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast({ ...toast, open: false });
  };

  const Toast = () => (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={closeToast}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // You can change this
    >
      <Alert
        onClose={closeToast}
        severity={toast.severity}
        sx={{ width: '100%' }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );

  return { showToast, Toast };
};