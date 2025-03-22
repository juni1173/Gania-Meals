import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Card, CardMedia, Grid, Button, Alert, List, ListItem } from "@mui/material";
import axios from "axios";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/${id}`, {
          auth: {
            username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
            password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
          },
        });
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>No product found.</Typography>;

  return (
    <Container>
      <Grid container spacing={4}>
        {/* Left Side - Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images[0]?.src || "https://via.placeholder.com/400"}
              alt={product.name}
            />
          </Card>
        </Grid>

        {/* Right Side - Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            €{product.price}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.short_description.replace(/(<([^>]+)>)/gi, "")}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Cruise Duration:
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.acf?.cruise_duration || "N/A"}
          </Typography>
          <Typography variant="h6" gutterBottom>
            The Price Includes:
          </Typography>
          <List>
            {[
              "Fuel",
              "Captain & Crew",
              "Fresh Towels",
              "Snorkeling Gear",
              "Free WiFi",
              "Open Bar",
            ].map((feature, index) => (
              <ListItem key={index}>{feature}</ListItem>
            ))}
          </List>
          <Alert severity="info">Please insert total number of persons, including kids and babies.</Alert>
          <Typography variant="body1" gutterBottom>
            Persons: <strong>1</strong>
          </Typography>
          <Button variant="contained" color="primary">
            Book Now
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetail;
