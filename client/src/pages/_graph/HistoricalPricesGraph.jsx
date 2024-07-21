import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HistoricalPricesGraph = () => {
  const { shape } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/historical-prices?shape=${shape}`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching historical prices:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [shape]);

  const chartData = {
    labels: data.map(row => row.Date),
    datasets: [
      {
        label: 'Price',
        data: data.map(row => row.Price),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Historical Prices for ${shape.charAt(0).toUpperCase() + shape.slice(1)} Shaped Diamonds`,
      },
    },
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <IconButton 
        color="primary" 
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        Historical Diamond Prices ({shape.charAt(0).toUpperCase() + shape.slice(1)} Shape)
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Line data={chartData} options={options} />
      )}
    </Box>
  );
};

export default HistoricalPricesGraph;
