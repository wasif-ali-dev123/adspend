import { Grid, Typography, Card, CardContent, Divider, Box } from '@mui/material';
import { formatCurrency } from '../../utils/dataTransformations';

const DataSummary = ({ data, topAdvertisers }) => {
  const totalSpend = data.reduce((sum, item) => sum + (item.spend || 0), 0);
  const uniqueAdvertisers = new Set(data.map(item => item.advertiser)).size;
  const uniqueElections = new Set(data.map(item => item.election)).size;
  const uniqueTopics = new Set(data.map(item => item.topic)).size;

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        width: '100%',
        gap: 2
      }}>
        <Box sx={{ 
          width: { xs: '100%', sm: '25%' },
          minWidth: 0
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" noWrap>
                Total Spend
              </Typography>
              <Typography variant="h4" color="primary" align="center">
                {formatCurrency(totalSpend)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', sm: '25%' },
          minWidth: 0
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" noWrap>
                Advertisers
              </Typography>
              <Typography variant="h4" color="primary" align="center">
                {uniqueAdvertisers}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', sm: '25%' },
          minWidth: 0
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" noWrap>
                Elections
              </Typography>
              <Typography variant="h4" color="primary" align="center">
                {uniqueElections}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', sm: '25%' },
          minWidth: 0
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" noWrap>
                Topics
              </Typography>
              <Typography variant="h4" color="primary" align="center">
                {uniqueTopics}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ mb: 2, width: '100%', overflowX: 'hidden' }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Top Advertisers by Spend
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {topAdvertisers.slice(0, 5).map((advertiser, index) => (
            <Box
              key={index}
              sx={{
                flex: { sm: '1 1 calc(20% - 16px)', xs: '1 1 100%' },
                minWidth: 0,
              }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography
                    variant="body1"
                    noWrap
                    align="center"
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                  >
                    {advertiser.advertiser}
                  </Typography>
                  <Typography variant="h6" color="primary" align="center">
                    {formatCurrency(advertiser.spend)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default DataSummary;
