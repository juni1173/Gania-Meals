import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box, Card, Typography, CircularProgress, Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper, Button} from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import WarningIcon from '@mui/icons-material/Warning';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from './header';

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
    const [allData, setAllData] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const darkTheme = createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: '#1976d2', // Customize primary color
          },
        },
        components: {
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: "6px",
              },
            },
          },
        },
      });
    const dateUpdateFunction = date => {
        setSelectedDate(date);
        const filterredDateData = allData.filter(pre => pre.bookingDate === date);
            setData(filterredDateData);
    }
    
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://chaniacruises.gr/wp-json/wc/v3/orders?per_page=100`, {
                auth: {
                    username: "ck_ff4b454a411d5cf84926de02ade843f5cefd049a",
                    password: "cs_44fd345ef5ccc504d651fe0ba0a6afca63119655",
                },
            });
            const ordersData = response.data;
            const extractedData = ordersData.map((order) => {
                try {
                    // Ensure order and line_items exist
                    if (!order?.line_items?.length) {
                        throw new Error("Missing line items");
                    }
            
                    const lineItem = order.line_items[0]; // First item
            
                    // Safely find metadata
                    const metaBookingDate = lineItem.meta_data?.find(
                        (meta) => meta.key === "_tmpost_data"
                    )?.value || [];
            
                    const metaData = lineItem.meta_data?.find(
                        (meta) => meta.key === "_tmcartepo_data"
                    )?.value || [];
            
                    // Helper function to safely extract meta values
                    const getMetaValue = (key) => {
                        return metaData.find((item) => item.name === key)?.value || "N/A";
                    };
            
                    return {
                        name: getMetaValue("Name") || order.billing?.first_name || "N/A",
                        surname: getMetaValue("Surname") || order.billing?.last_name || "N/A",
                        noOfPersons: getMetaValue("Number of Persons"),
                        mealChoice: getMetaValue("Meal choice"),
                        bookingDate: metaBookingDate.length
                            ? `${metaBookingDate[0]?.wc_bookings_field_start_date_year || "0000"}-${metaBookingDate[0]?.wc_bookings_field_start_date_month || "00"}-${metaBookingDate[0]?.wc_bookings_field_start_date_day || "00"}`
                            : "N/A"
                    };
                } catch (error) {
                    console.error("Error processing order:", error.message);
                    return {
                        name: "N/A",
                        surname: "N/A",
                        noOfPersons: "N/A",
                        mealChoice: "N/A",
                        bookingDate: "N/A"
                    };
                }
            });            
              console.warn(extractedData);
              setAllData(extractedData);
              const filterredDateData = extractedData.filter(pre => pre.bookingDate === selectedDate);
            setData(filterredDateData);
        } catch (error) {
            
            console.error("Error fetching order:", error);
  
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOrders();
        //fetchOrders(dayjs(new Date()).format('YYYY-MM-DD'));
      }, []);
      const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Meal Details - ${selectedDate}`, 14, 15);

        const tableColumn = ["Name", "Surname", "No. of Persons", "Meal Choice"];
        const tableRows = data.map((item) => [item.name, item.surname, item.noOfPersons, item.mealChoice]);

        autoTable(doc, {  
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`Bookings_Meals_${selectedDate}.pdf`);
    };
  return (
    <ThemeProvider theme={darkTheme}>
    <Container>
        <Header/>
        <Box>
            <Card>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={selectedDate}
                        onChange={(newDate) => dateUpdateFunction(dayjs(newDate).format('YYYY-MM-DD'))}
                    />
                </LocalizationProvider>
            </Card>
        </Box>

        {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        ) : data.length > 0 ? (
            <>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="left">No of persons</TableCell>
                                <TableCell align="left">Meal Choice</TableCell>
                                <TableCell align="left">Booking Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((order, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {order.name} {order.surname}
                                    </TableCell>
                                    <TableCell align="left">{order.noOfPersons}</TableCell>
                                    <TableCell align="left">{order.mealChoice}</TableCell>
                                    <TableCell align="left">{order.bookingDate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Export PDF Button */}
                <Box mt={2} display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" onClick={exportPDF}>
                        Export as PDF
                    </Button>
                </Box>
            </>
        ) : (
            <Box display="flex" justifyContent="center" alignItems="center" color="error.main" minHeight="200px">
                <WarningIcon sx={{ mr: 1 }} />
                <Typography>No orders found on {selectedDate}</Typography>
            </Box>
        )}
    </Container>
</ThemeProvider>
   
  )
}

export default Dashboard