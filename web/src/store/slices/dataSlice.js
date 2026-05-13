import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dataService from '../../services/dataService';

export const fetchData = createAsyncThunk(
  'data/fetchData',
  async () => {
    return await dataService.loadData();
  }
);

const initialState = {
  rawData: [],
  filteredData: [],
  filters: {
    advertiser: null,
    election: null,
    topic: null,
    dateRange: {
      start: null,
      end: null
    }
  },
  advertisers: [],
  elections: [],
  topics: [],
  loading: false,
  error: null
};

const applyAllFilters = (data, filters) => {
  return data.filter(item => {
    if (filters.advertiser && item.advertiser !== filters.advertiser) return false;
    if (filters.election && item.election !== filters.election) return false;
    if (filters.topic && item.topic !== filters.topic) return false;

    if (filters.dateRange.start && filters.dateRange.end && item.startDate) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      const itemStart = new Date(item.startDate).getTime();
      const itemEnd = new Date(item.endDate).getTime();
      if (itemStart > end || itemEnd < start) return false;
    }

    return true;
  });
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
      state.filteredData = applyAllFilters(state.rawData, state.filters);
    },
    clearFilters: (state) => {
      state.filters = {
        advertiser: null,
        election: null,
        topic: null,
        dateRange: {
          start: null,
          end: null
        }
      };
      state.filteredData = state.rawData;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.rawData = action.payload;
        state.filteredData = action.payload;

        state.advertisers = dataService.getUniqueValues(action.payload, 'advertiser');
        state.elections = dataService.getUniqueValues(action.payload, 'election');
        state.topics = dataService.getUniqueValues(action.payload, 'topic');
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilter, clearFilters } = dataSlice.actions;
export default dataSlice.reducer;