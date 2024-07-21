import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const shapes = [
  'Marquise', 'Heart', 'Pear', 'Emerald', 'Princess', 'Oval', 'Round', 'Cushion'
];

const GraphLayout = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <IconButton 
        color="primary" 
        onClick={handleBack}
        sx={{ position: 'absolute', top: '16px', left: '16px' }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Diamond Shapes Historical Prices
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        {shapes.map((shape) => (
          <Button
            key={shape}
            variant="contained"
            color="primary"
            onClick={() => navigate(`/historical-prices/${shape.toLowerCase()}`)}
            sx={{ width: '400px' }}
          >
            {shape}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default GraphLayout;
