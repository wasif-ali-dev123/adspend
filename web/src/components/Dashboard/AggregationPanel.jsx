import { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { groupByFieldAndSum, formatCurrency } from '../../utils/dataTransformations';

const AggregationPanel = ({ data }) => {
  const [aggregateBy, setAggregateBy] = useState('advertiser');
  const [sortBy, setSortBy] = useState('spend');
  const [sortDirection, setSortDirection] = useState('desc');
  const aggregatedData = groupByFieldAndSum(data, aggregateBy);

  const sortedData = [...aggregatedData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  const topItems = sortedData.slice(0, 10);
  const totalSpend = aggregatedData.reduce((sum, item) => sum + item.spend, 0);
  
  const handleAggregateByChange = (event) => {
    setAggregateBy(event.target.value);
  };
  
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Aggregation
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl sx={{width:150}}>
            <InputLabel id="aggregate-by-label">Aggregate By</InputLabel>
            <Select
              labelId="aggregate-by-label"
              id="aggregate-by"
              value={aggregateBy}
              label="Aggregate By"
              onChange={handleAggregateByChange}
            >
              <MenuItem value="advertiser">Advertiser</MenuItem>
              <MenuItem value="election">Election</MenuItem>
              <MenuItem value="topic">Topic</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Total Spend by {aggregateBy.charAt(0).toUpperCase() + aggregateBy.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Showing top 10 items
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {aggregateBy.charAt(0).toUpperCase() + aggregateBy.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end',
                        cursor: 'pointer'
                      }}
                      onClick={handleSortDirectionChange}
                    >
                      <Typography variant="subtitle2">
                        Spend
                      </Typography>
                      <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      % of Total
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item[aggregateBy]}</TableCell>
                    <TableCell align="right">{formatCurrency(item.spend)}</TableCell>
                    <TableCell align="right">
                      {((item.spend / totalSpend) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AggregationPanel;
