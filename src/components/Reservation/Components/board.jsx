import React, {useState} from 'react'
import { Typography, Table,
    TableBody,
    Box,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,Button,
TextField,
Snackbar,
Alert} from '@mui/material'
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
// import CancelIcon from '@mui/icons-material/Cancel';
// import UpdateOrder from './updateOrder';
// import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
const Board = ({ orders, loading }) => {
    const [open, setOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [bookingStart, setBookingStart] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
    const [bookingEnd, setBookingEnd] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
   
    const unixToDate = (date) => {
        if (date) {
            return dayjs.unix(date).format("YYYY-MM-DD HH:mm:ss");
        }
    }
    const ActionCell = ({ order }) => {
        const handleRebook = () => {
          // Implement re-book logic
          console.log('Re-book clicked for order:', order.id);
        };
    
        const handleCancel = () => {
          // Implement cancel logic
          console.log('Cancel clicked for order:', order.id);
        };
    
        return (
          <TableCell>
            {order.status === 'cancelled' ? (
              <button onClick={() => handleOpen(order)}>Re-book</button>
            ) : (
                <>
                <button onClick={() => handleOpen(order)}>Re-book</button>
              <button onClick={handleCancel}>Cancel</button>
                </>
                
            )}
          </TableCell>
        );
      };
    
      const handleOpen = (order) => {
        setSelectedOrder(order);
        order.booking && setBookingStart(dayjs(order.booking.start).format('YYYY-MM-DD')); // Format for datetime-local input
        order.booking && setBookingEnd(dayjs(order.booking.end).format('YYYY-MM-DD'));
        order.booking && setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedOrder(null);
        setError("");
    };
    const fetchProducts = async (product_id) => {
        try {
          // const response = await axios.get("https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc/v3/products?per_page=50", {
          const response = await axios.get(`https://cretaluxurycruises.dev6.inglelandi.com//wp-json/wc-bookings/v1/products/${product_id}`, {
            auth: {
              username: "ck_ac19f76b7dff5105f1dfb34d435fae5d5b7b5dab",
              password: "cs_c00e2c2dddc3070dba6e7af6f8150897b2b784ac",
            },
          });
          const activeProducts = response.data.filter((product) => product.status === "publish");
          setSelectedProduct(response.data);
        } catch (error) {
            setSelectedProduct([]);
          console.error("Error fetching products:", error);
        } finally {
        //   setLoading(false);
        }
      };
    const RebookingModal = ({ open, handleClose, handleSubmit, error }) => {
        const [bookingStart, setBookingStart] = useState(dayjs());
        const [bookingEnd, setBookingEnd] = useState(dayjs().add(1, "day"));
    
        const handleFormSubmit = (event) => {
            event.preventDefault();
            handleSubmit(bookingStart.format("YYYY-MM-DD"), bookingEnd.format("YYYY-MM-DD"));
        };
        console.warn(selectedOrder);
        return (
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: "center" }}>Re-book Order</DialogTitle>
            <DialogContent>
                <form onSubmit={handleFormSubmit}>
                <Box sx={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
                {/* Start Date Picker */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="subtitle1" align="center">
                        Start Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={bookingStart}
                            onChange={(newDate) => setBookingStart(newDate)}
                        />
                    </LocalizationProvider>
                </Box>

                {/* End Date Picker */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="subtitle1" align="center">
                        End Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={bookingEnd}
                            onChange={(newDate) => setBookingEnd(newDate)}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </form>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button type="submit" onClick={handleFormSubmit} color="primary" variant="contained">
                    Confirm Rebook
                </Button>
            </DialogActions>
        </Dialog>
        );
    };
    return (
        <>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell><b>Order Status</b></TableCell>
                                <TableCell><b>Total ($)</b></TableCell>
                                <TableCell><b>Booking Start Date & Time</b></TableCell>
                                <TableCell><b>Booking End Date & Time</b></TableCell>
                                <TableCell><b>Action</b></TableCell>
                                
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    order.booking ? (
                                       
                                            <TableRow key={`${order.id}`}>
                                                <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
                                                <TableCell>{order.status}</TableCell>
                                                <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                                <TableCell>{unixToDate(order.booking.start)}</TableCell>
                                                <TableCell>{unixToDate(order.booking.end)}</TableCell>
                                                <ActionCell order={order}/>
                                            </TableRow>
                                       
                                    ) : (
                                        <TableRow key={order.id}>
                                            <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
                                            <TableCell>{order.status}</TableCell>
                                            <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                            <TableCell colSpan={3} align="center">No bookings</TableCell>
                                        </TableRow>
                                    )
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No orders found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
           <RebookingModal
                open={open}
                handleClose={() => setOpen(false)}
                handleSubmit={(start, end) => console.log("Rebooking from:", start, "to:", end)}
                error={error}
            />
            {/* Success Snackbar */}
            <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
                <Alert onClose={() => setSuccess(false)} severity="success">
                    Rebooking successful!
                </Alert>
            </Snackbar>
        </>
    );
};

export default Board;