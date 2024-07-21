import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

const RecordView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('/api/valuation-records');
        // Ensure the response is an array
        if (Array.isArray(response.data)) {
          setRecords(response.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleViewRecord = (recordId) => {
    navigate(`/consultant/valuation-records/${recordId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewStatus = (recordId) => {
    navigate(`/consultant/record-view-status/${recordId}`);
  }
  const getStatusColor = (status) => {
    if (status === 'Completed') {
      return 'green';
    } else if (status === 'In Progress') {
      return 'red';
    } else {
      return 'gray';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Valuation Records
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Record Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow key={record._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{record.recordNumber}</TableCell>
                  <TableCell>{record.customerName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(record.status),
                          mr: 1
                        }}
                      /> 
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewStatus(record._id)}
                        sx={{
                          textTransform: 'none',
                          padding: 0,
                          minWidth: 'auto',
                          color:'black'
                        }}
                      >
                        {record.status}
                      </Button>
                      
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="black"
                      onClick={() => handleViewRecord(record._id)}
                    >
                      <RemoveRedEyeIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={records.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default RecordView;
