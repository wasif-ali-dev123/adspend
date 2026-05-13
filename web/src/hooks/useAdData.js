import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData, setFilter, clearFilters } from '../store/slices/dataSlice';
import { 
  groupByFieldAndSum, 
  filterData, 
  groupByTimePeriod, 
  getTopNBySpend 
} from '../utils/dataTransformations';

const useAdData = () => {
  const dispatch = useDispatch();

  const {
    rawData,
    filteredData,
    filters,
    advertisers,
    elections,
    topics,
    loading,
    error
  } = useSelector(state => state.data);
  useEffect(() => {
  if (!rawData || rawData.length === 0) {
    dispatch(fetchData());
  }
}, [dispatch, rawData]);

  const memoizedFilteredData = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  const applyFilter = (filterType, value) => {
    dispatch(setFilter({ filterType, value }));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const getSpendingByElection = (advertiserName) => {
    const data = advertiserName 
      ? filterData(rawData, { advertiser: advertiserName })
      : memoizedFilteredData;

    return groupByFieldAndSum(data, 'election');
  };

  const getSpendingByTopic = (electionName) => {
    const data = electionName 
      ? filterData(rawData, { election: electionName })
      : memoizedFilteredData;

    return groupByFieldAndSum(data, 'topic');
  };

  const getSpendingOverTime = (advertiserName, period = 'week') => {
    return groupByTimePeriod(
      rawData,
      period,
      'advertiser',
      advertiserName
    );
  };

  const getTopAdvertisers = (limit = 10) => {
    const advertisersData = groupByFieldAndSum(memoizedFilteredData, 'advertiser');
    return getTopNBySpend(advertisersData, limit);
  };

  return {
    data: memoizedFilteredData, // Use memoized data
    filters,
    advertisers,
    elections,
    topics,
    loading,
    error,
    applyFilter,
    resetFilters,
    getSpendingByElection,
    getSpendingByTopic,
    getSpendingOverTime,
    getTopAdvertisers
  };
};

export default useAdData;