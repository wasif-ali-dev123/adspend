export const groupByFieldAndSum = (data, field) => {
  const grouped = data.reduce((acc, item) => {
    const key = item[field];
    if (!key) return acc;
    
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.spend || 0;
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([key, value]) => ({
    [field]: key,
    spend: value
  }));
};

export const filterData = (data, filters) => {
  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      
      if (Array.isArray(value)) {
        if (value.length > 0 && !value.includes(item[key])) {
          return false;
        }
      } 
      else if (key === 'dateRange' && value.start && value.end) {
        if (!item.startDate || item.startDate > value.end || item.endDate < value.start) {
          return false;
        }
      }
      else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const groupByTimePeriod = (data, period, filterField, filterValue) => {
  let filteredData = data;
  if (filterField && filterValue) {
    filteredData = data.filter(item => item[filterField] === filterValue);
  }

  const grouped = filteredData.reduce((acc, item) => {
    let key;
    
    if (period === 'month' && item.spend_month) {
      key = item.spend_month;
    } else if (item.spend_week) {
      key = item.spend_week;
    } else {
      return acc;
    }
    
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.spend || 0;
    return acc;
  }, {});
  
  return Object.entries(grouped)
    .map(([date, spend]) => ({ date, spend }))
    .sort((a, b) => {
      if (period === 'month') {
        return a.date.localeCompare(b.date);
      } else {
        const getDatePart = (weekStr) => {
          const match = weekStr.match(/(\d{4})_(\d{2})\/(\d{2})/);
          return match ? match[0] : weekStr;
        };
        return getDatePart(a.date).localeCompare(getDatePart(b.date));
      }
    });
};

export const getTopNBySpend = (data, n = 10) => {
  return [...data]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, n);
};

export default {
  groupByFieldAndSum,
  filterData,
  formatCurrency,
  groupByTimePeriod,
  getTopNBySpend
};
