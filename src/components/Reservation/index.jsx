import React, { useState, useEffect } from 'react';
import Board from './Components/board';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box, Card, Typography, CircularProgress } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import WarningIcon from '@mui/icons-material/Warning';

const Index = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [ordersData, setOrdersData] = useState([]);
    // const [dateBasedOrders, setDateBasedOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: '#1976d2',
            },
        },
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: { padding: "6px" },
                },
            },
        },
    });
    const dateUpdateFunction = (date) => {
        setSelectedDate(date);
        if (!ordersData.length) return;

        setLoading(true);
        console.warn(ordersData);
        console.warn(dayjs(date).startOf('day').unix());
    //     const filteredOrders = ordersData
    //     .map(order => ({
    //         ...order,
    //         bookings: order.bookings.filter(booking => {
    //             if (!booking.start) return false; // Skip invalid bookings

    //             // Ensure booking.start is a number before comparing
    //             const bookingStartUnix = Number(booking.start);
    //             console.warn(bookingStartUnix);
    //             // Check if booking start falls within the selected date range
    //             return bookingStartUnix === dayjs(date).startOf('day').unix();
    //         })
    //     }))
    //     .filter(order => order.bookings.length > 0); // Keep only orders with matching bookings

    // setDateBasedOrders(filteredOrders);
        setLoading(false);
    };
    

    async function getOrdersWithBookings() {
        setLoading(true);
        
        const apiUrl = "https://cretaluxurycruises.dev6.inglelandi.com/wp-json";
        const consumerKey = "ck_ac19f76b7dff5105f1dfb34d435fae5d5b7b5dab";
        const consumerSecret = "cs_c00e2c2dddc3070dba6e7af6f8150897b2b784ac";

        try {
            const ordersResponse = await fetch(
                `${apiUrl}/wc/v3/orders?per_page=100&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
            );
            const orders = await ordersResponse.json();
            
            const ordersWithBookings = await Promise.all(
                orders.map(async (order) => {
                    let bookingId = null;
            
                    // Extract a single booking ID from order line items
                    for (const item of order.line_items) {
                        for (const meta of item.meta_data) {
                            if (meta.key === "_booking_id") {
                                bookingId = meta.value;
                                break; // Stop once we find the first booking ID
                            }
                        }
                        if (bookingId) break; // Stop looping if we already found a booking
                    }
            
                    // If no valid booking ID, return order without bookings
                    if (!bookingId || bookingId.length < 1) {
                        return { ...order, booking: [] };
                    }
            
                    // Fetch booking details for the single booking ID
                    const bookingResponse = await fetch(
                        `${apiUrl}/wc-bookings/v1/bookings/${bookingId}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
                    );
                    const booking = await bookingResponse.json();
            
                    // Attach booking details to the order
                    return {
                        ...order,
                        booking, // Attach single booking object, not an array
                    };
                })
            );
            
            console.warn(ordersWithBookings);
            // return false;
            setOrdersData(ordersWithBookings);
            
            
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getOrdersWithBookings();
        dateUpdateFunction(selectedDate);
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <Container>
                <Box>
                    <Card>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <StaticDatePicker   
                                displayStaticWrapperAs="desktop"
                                value={dayjs(selectedDate)}
                                onChange={(newDate) => dateUpdateFunction(dayjs(newDate).format('YYYY-MM-DD'))}
                            />
                        </LocalizationProvider>
                    </Card>
                </Box>
                
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : ordersData.length > 0 ? (
                    <Board orders={ordersData} selectedDate={selectedDate} loading={loading} />
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" color="error.main" minHeight="200px">
                        <WarningIcon sx={{ mr: 1 }} />
                        <Typography>No orders found on {selectedDate}</Typography>
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Index;
