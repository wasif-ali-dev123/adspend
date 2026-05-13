import { useState } from 'react';
import { 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box,
} from '@mui/material';

const FilterPanel = ({ 
  advertisers, 
  elections, 
  topics, 
  onFilterChange, 
  onResetFilters,
}) => {
  const [selectedAdvertiser, setSelectedAdvertiser] = useState('');
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleAdvertiserChange = (event) => {
    const value = event.target.value;
    setSelectedAdvertiser(value);
    onFilterChange('advertiser', value);
  };

  const handleElectionChange = (event) => {
    const value = event.target.value;
    setSelectedElection(value);
    onFilterChange('election', value);
  };

  const handleTopicChange = (event) => {
    const value = event.target.value;
    setSelectedTopic(value);
    onFilterChange('topic', value);
  };

  const handleResetFilters = () => {
    setSelectedAdvertiser('');
    setSelectedElection('');
    setSelectedTopic('');
    onResetFilters();
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Filters
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleResetFilters}
        >
          Reset
        </Button>
      </Box>

      <Box sx={{display:'flex',flexDirection:'row',width:'100%',gap:2}}>
      <Box sx={{ mb: 2,flex:1}}>
        <FormControl fullWidth size="small" sx={{ minHeight: '40px' }}>
          <InputLabel id="advertiser-select-label">Advertiser</InputLabel>
          <Select
            labelId="advertiser-select-label"
            id="advertiser-select"
            value={selectedAdvertiser}
            label="Advertiser"
            onChange={handleAdvertiserChange}
            sx={{ height: '40px' }}
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
      </Box>
      
      <Box sx={{ mb: 2, flex:1 }}>
        <FormControl fullWidth size="small" sx={{ minHeight: '40px' }}>
          <InputLabel id="election-select-label">Election</InputLabel>
          <Select
            labelId="election-select-label"
            id="election-select"
            value={selectedElection}
            label="Election"
            onChange={handleElectionChange}
            sx={{ height: '40px' }}
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
      </Box>
      
      <Box sx={{ mb: 2,  flex:1 }}>
        <FormControl fullWidth size="small" sx={{ minHeight: '40px' }}>
          <InputLabel id="topic-select-label">Topic</InputLabel>
          <Select
            labelId="topic-select-label"
            id="topic-select"
            value={selectedTopic}
            label="Topic"
            onChange={handleTopicChange}
            sx={{ height: '40px' }}
          >
            <MenuItem value="">
              <em>All Topics</em>
            </MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic} value={topic}>
                {topic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      </Box>
    </Box>
  );
};

export default FilterPanel;
