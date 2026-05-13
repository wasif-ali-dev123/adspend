import Papa from 'papaparse';


export const dataService = {
  loadData: async () => {
    try {
      const response = await fetch('/data/data.csv');
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const cleanedData = dataService.cleanData(results.data);
            resolve(cleanedData);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  },

  cleanData: (data) => {
    return data
      .filter(item => {
        return item.advertiser && item.election && item.topic && item.spend;
      })
      .map(item => {
        const spend = typeof item.spend === 'number' ? item.spend : parseFloat(item.spend);
        let startDate = null;
        let endDate = null;
        
        if (item.spend_week) {
          const dateMatch = item.spend_week.match(/(\d{4})_(\d{2})\/(\d{2})-(\d{2})\/(\d{2})/);
          if (dateMatch) {
            const [_, year, startMonth, startDay, endMonth, endDay] = dateMatch;
            const startDateObj = new Date(year, parseInt(startMonth) - 1, parseInt(startDay));
            const endDateObj = new Date(year, parseInt(endMonth) - 1, parseInt(endDay));
            startDate = startDateObj.toISOString();
            endDate = endDateObj.toISOString();
          }
        }
        
        return {
          ...item,
          spend: isNaN(spend) ? 0 : spend,
          startDate,
          endDate,
          month: item.spend_month ? item.spend_month.split('_')[1] : null,
          year: item.spend_month ? item.spend_month.split('_')[0] : null
        };
      });
  },

  getUniqueValues: (data, field) => {
    const values = new Set(data.map(item => item[field]));
    return [...values].filter(Boolean).sort();
  },

  aggregateByField: (data, field) => {
    return data.reduce((acc, item) => {
      const key = item[field];
      if (!key) return acc;
      
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.spend || 0;
      return acc;
    }, {});
  }
};

export default dataService;
