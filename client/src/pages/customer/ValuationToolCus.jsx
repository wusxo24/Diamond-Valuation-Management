import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Grid, 
  FormControl, 
  Slider, 
  TextField, 
  Typography,
  Paper,
  Divider
} from '@mui/material';
import CustomerLayout from '../../components/CustomerLayout';

const ValuationToolCus = () => {
  const [formData, setFormData] = useState({
    carat: 0.5,
    cut: '',
    color: '',
    clarity: '',
    depth: '',
    table: 60,
    x: '',
    y: '',
    z: ''
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleHistoricalPrice = () => {
    navigate('/historical-prices');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSliderChange = (name) => (e, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCutChange = (value) => {
    setFormData({ ...formData, cut: value });
  };

  const handleColorChange = (value) => {
    setFormData({ ...formData, color: value });
  };

  const handleClarityChange = (value) => {
    setFormData({ ...formData, clarity: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.x <= 0) {
      newErrors.x = 'X must be greater than 0';
    }
    if (formData.y <= 0) {
      newErrors.y = 'Y must be greater than 0';
    }
    if (formData.z <= 0) {
      newErrors.z = 'Z must be greater than 0';
    }
    if (!formData.cut) {
      newErrors.cut = 'Please select a cut';
    }
    if (!formData.color) {
      newErrors.color = 'Please select a color';
    }
    if (!formData.clarity) {
      newErrors.clarity = 'Please select a clarity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const depth = (2 * parseFloat(formData.z)) / (parseFloat(formData.x) + parseFloat(formData.y));
    try {
      const response = await axios.post('http://localhost:8000/predict-price', { ...formData, depth });
      console.log('API response:', response.data); // Add this line for debugging
      setPredictedPrice(response.data.predicted_price);
    } catch (error) {
      console.error('Error predicting price:', error);
    }
  };

  return (
    <CustomerLayout>
      <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto', marginTop: '100px' }}>
        <Paper elevation={3} sx={{ p: 3, backgroundColor: '#FAFAFA' }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, color: '#033F63' }}>
            Diamond Price Predictor
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography gutterBottom>Carat</Typography>
                  <Slider
                    value={formData.carat}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onChange={handleSliderChange('carat')}
                    valueLabelDisplay="auto"
                    sx={{ color: '#033F63' }}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography gutterBottom>Cut</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {['Ideal', 'Premium', 'Good', 'Very Good', 'Fair'].map((cut) => (
                      <Button
                        key={cut}
                        variant={formData.cut === cut ? 'contained' : 'outlined'}
                        onClick={() => handleCutChange(cut)}
                        sx={{ borderRadius: '20px', borderColor: '#033F63', color: formData.cut === cut ? 'white' : '#033F63', backgroundColor: formData.cut === cut ? '#033F63' : 'transparent' }}
                      >
                        {cut}
                      </Button>
                    ))}
                  </Box>
                  {errors.cut && <Typography color="error">{errors.cut}</Typography>}
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography gutterBottom>Color</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {['E', 'I', 'J', 'H', 'F', 'G', 'D'].map((color) => (
                      <Button
                        key={color}
                        variant={formData.color === color ? 'contained' : 'outlined'}
                        onClick={() => handleColorChange(color)}
                        sx={{ borderRadius: '20px', borderColor: '#033F63', color: formData.color === color ? 'white' : '#033F63', backgroundColor: formData.color === color ? '#033F63' : 'transparent' }}
                      >
                        {color}
                      </Button>
                    ))}
                  </Box>
                  {errors.color && <Typography color="error">{errors.color}</Typography>}
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography gutterBottom>Clarity</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {['SI2', 'SI1', 'VS1', 'VS2', 'VVS2', 'VVS1', 'I1', 'IF'].map((clarity) => (
                      <Button
                        key={clarity}
                        variant={formData.clarity === clarity ? 'contained' : 'outlined'}
                        onClick={() => handleClarityChange(clarity)}
                        sx={{ borderRadius: '20px', borderColor: '#033F63', color: formData.clarity === clarity ? 'white' : '#033F63', backgroundColor: formData.clarity === clarity ? '#033F63' : 'transparent' }}
                      >
                        {clarity}
                      </Button>
                    ))}
                  </Box>
                  {errors.clarity && <Typography color="error">{errors.clarity}</Typography>}
                </FormControl>

                <TextField
                  label="X"
                  name="x"
                  type="number"
                  value={formData.x}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.x)}
                  helperText={errors.x}
                />

                <TextField
                  label="Y"
                  name="y"
                  type="number"
                  value={formData.y}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.y)}
                  helperText={errors.y}
                />

                <TextField
                  label="Z"
                  name="z"
                  type="number"
                  value={formData.z}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.z)}
                  helperText={errors.z}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography gutterBottom>Table</Typography>
                  <Slider
                    value={formData.table}
                    min={40}
                    max={100}
                    step={1}
                    onChange={handleSliderChange('table')}
                    valueLabelDisplay="auto"
                    sx={{ color: '#033F63' }}
                  />
                </FormControl>

                <Button type="submit" variant="contained" sx={{ width: '100%', backgroundColor: '#033F63', color: 'white', '&:hover': { backgroundColor: '#022D48' } }}>
                  Predict Price
                </Button>
              </form>
            </Grid>

            <Grid item xs={12}>
              {predictedPrice !== null && (
                <Box sx={{ mt: 4, p: 2, borderRadius: '8px', backgroundColor: '#033F63', color: 'white', textAlign: 'center' }}>
                  <Typography variant="h6">Predicted Price</Typography>
                  <Typography variant="h4">${predictedPrice.toFixed(2)}</Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleHistoricalPrice} sx={{ width: '100%', borderColor: '#033F63', color: '#033F63', mt: 2, '&:hover': { backgroundColor: '#033F63', color: 'white' } }}>
                View Historical Prices
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </CustomerLayout>
  );
};

export default ValuationToolCus;
