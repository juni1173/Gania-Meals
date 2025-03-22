import React, { useState } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Box, Card, Typography, Switch, FormControlLabel, Grid } from '@mui/material';

const BulkUpdate = (productFields, updateDetected, selectedProduct, setProductFields) => {
    const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const shouldDisableDate = (date) => {
    return date.isBefore(dayjs().startOf('day'), 'day'); // Disable dates before today
  };

  const handleSlotToggle = (event, slot, product) => {
    const status = event.target.checked;
    setProductFields((prev) => {
        const updatedProductFields = { ...prev };
        const productDurations = updatedProductFields[product]?.durationArray;
    
        if (productDurations && Array.isArray(productDurations)) {
          const updatedDurations = productDurations.map((durationSlot) => {
            if (durationSlot.duration === slot.duration) {
              return { ...durationSlot, availability: status };
            }
            return durationSlot;
          });
    
          if (updatedProductFields[product]) {
            updatedProductFields[product].durationArray = updatedDurations;
          }
        }
        console.warn(updatedProductFields);
        return updatedProductFields;
      });
  };

  return (
    <>
     <Box>
      <Card>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                shouldDisableDate={shouldDisableDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                shouldDisableDate={shouldDisableDate}
                minDate={startDate} // Ensure end date is after start date
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Card>
    </Box>
     {updateDetected ? (
                      <Typography>
                        Duration, Start Time or Buffer change detected update to generate
                        new slots...
                      </Typography>
                    ) : (
                      productFields[selectedProduct.id]?.durationArray?.map((slot, index) => (
                        <Card key={index} sx={{ p: 2, minWidth: 300, maxHeight: 30, textAlign: 'center', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                            {(slot !== "Slot required Start Time" || slot !== "Slot required Booking Duration" || slot !== "Slot required Buffer Time") && (
                                <FormControlLabel
                                control={<Switch checked={slot.availability} onChange={e => handleSlotToggle(e, slot, selectedProduct.id)} size="small" />}
                                label={slot.availability ? 'Bookable' : 'Not Bookable'}
                                labelPlacement="start"
                                sx={{
                                  margin: 0,
                                  '& .MuiTypography-root': {
                                    fontSize: '0.75rem', // Adjust the font size as needed
                                  },
                                }}
                              />
                            )}
                        </Box>
                        <Typography style={{ marginTop: "20px", fontSize: 'larger', letterSpacing:'2px', fontWeight:'700' }} variant="body1">{slot.duration}</Typography>
                      </Card>
                    ))
                    )}
    </>
   
    
  );
};

export default BulkUpdate;