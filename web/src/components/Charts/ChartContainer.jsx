import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Divider
} from '@mui/material';
import BarChart from './BarChart';
import PieChart from './PieChart';
import LineChart from './LineChart';
import useAdData from '../../hooks/useAdData';

const ChartContainer = () => {
  const { 
    data, 
    advertisers, 
    elections, 
    getSpendingByElection, 
    getSpendingByTopic, 
    getSpendingOverTime 
  } = useAdData();
  
  const [selectedAdvertiser, setSelectedAdvertiser] = useState('');
  const [selectedElection, setSelectedElection] = useState('');
  const [timePeriod, setTimePeriod] = useState('week');
  
  const electionSpendingData = getSpendingByElection(selectedAdvertiser);
  const topicSpendingData = getSpendingByTopic(selectedElection);
  const timeSeriesData = getSpendingOverTime(selectedAdvertiser, timePeriod);
  
  const handleAdvertiserChange = (event) => {
    setSelectedAdvertiser(event.target.value);
  };
  
  const handleElectionChange = (event) => {
    setSelectedElection(event.target.value);
  };
  
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Visualizations
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Which elections has a given advertiser spent the most in?
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl sx={{width:200}}>
              <InputLabel id="advertiser-select-label">Select Advertiser</InputLabel>
              <Select
                labelId="advertiser-select-label"
                id="advertiser-select"
                value={selectedAdvertiser}
                label="Select Advertiser"
                onChange={handleAdvertiserChange}
              >
                <MenuItem value="">
                  <em>All Advertisers</em>
                </MenuItem>
                {advertisers.map((advertiser) => (
                  <MenuItem key={advertiser} value={advertiser}>
                    {advertiser}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 400,mb:4 }}>
          <BarChart 
            data={electionSpendingData} 
            xKey="election" 
            yKey="spend" 
            title={`Spending by Election${selectedAdvertiser ? ` for ${selectedAdvertiser}` : ''}`}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          How much has been spent by topic in a given election?
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl sx={{width:200}}>
              <InputLabel id="election-select-label">Select Election</InputLabel>
              <Select
                labelId="election-select-label"
                id="election-select"
                value={selectedElection}
                label="Select Election"
                onChange={handleElectionChange}
              >
                <MenuItem value="">
                  <em>All Elections</em>
                </MenuItem>
                {elections.map((election) => (
                  <MenuItem key={election} value={election}>
                    {election}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 400 }}>
          <PieChart 
            data={topicSpendingData} 
            nameKey="topic" 
            valueKey="spend" 
            title={`Spending by Topic${selectedElection ? ` for ${selectedElection}` : ''}`}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          How has a given advertiser spent over time?
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl sx={{width:200}}>
              <InputLabel id="advertiser-time-select-label">Select Advertiser</InputLabel>
              <Select
                labelId="advertiser-time-select-label"
                id="advertiser-time-select"
                value={selectedAdvertiser}
                label="Select Advertiser"
                onChange={handleAdvertiserChange}
              >
                <MenuItem value="">
                  <em>All Advertisers</em>
                </MenuItem>
                {advertisers.map((advertiser) => (
                  <MenuItem key={advertiser} value={advertiser}>
                    {advertiser}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl sx={{width:150}}>
              <InputLabel id="time-period-select-label">Time Period</InputLabel>
              <Select
                labelId="time-period-select-label"
                id="time-period-select"
                value={timePeriod}
                label="Time Period"
                onChange={handleTimePeriodChange}
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 400,mb:6 }}>
          <LineChart 
            data={timeSeriesData} 
            xKey="date" 
            yKey="spend" 
            title={`Spending Over Time${selectedAdvertiser ? ` for ${selectedAdvertiser}` : ''}`}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ChartContainer;