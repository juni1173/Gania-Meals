import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function UpdateOrder({ order, updateOrder }) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');
  const [newDate, setNewDate] = useState(dayjs(order?.date_created) || dayjs());

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const statusOptions = [
    'any',
    'pending',
    'processing',
    'on-hold',
    'completed',
    'cancelled',
    'refunded',
    'failed',
  ];

  const handleUpdate = () => {
    updateOrder(order.id, newStatus, newDate.format('YYYY-MM-DD'));
    handleClose();
  };

  return (
    <>
      <IconButton aria-label="edit" onClick={handleOpen}>
        <EditIcon />
      </IconButton>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            color: "#fff",
          }}
        >
          <Typography variant="h6">Order Details</Typography>
          <Typography>Order: {order?.billing?.first_name} {order?.billing?.last_name}</Typography>
          <Typography>Date: {dayjs(order?.date_created).format('YYYY-MM-DD')}</Typography>
          <Typography>Status: {order?.status}</Typography>
          <Typography>Total: {order?.total}</Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="New Date"
              value={newDate}
              onChange={(date) => setNewDate(date)}
              renderInput={(params) => <TextField {...params} margin="normal" />}
            />
          </LocalizationProvider>

          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" onClick={handleUpdate} fullWidth>
            Update
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default UpdateOrder;