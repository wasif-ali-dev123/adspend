import { useState, useEffect } from "react";
import {
	Container,
	Paper,
	Typography,
	Box,
	CircularProgress,
	Tabs,
	Tab,
	useTheme,
} from "@mui/material";
import useAdData from "../../hooks/useAdData";
import FilterPanel from "../Filters/FilterPanel";
import DataSummary from "./DataSummary";
import AggregationPanel from "./AggregationPanel";
import ChartContainer from "../Charts/ChartContainer";

const Dashboard = () => {
	const theme = useTheme();
	const {
		data,
		loading,
		error,
		advertisers,
		elections,
		topics,
		applyFilter,
		resetFilters,
	} = useAdData();

	const [topAdvertisers, setTopAdvertisers] = useState([]);
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		if (data.length > 0) {
			const advertiserMap = {};

			data.forEach((ad) => {
				advertiserMap[ad.advertiser] =
					(advertiserMap[ad.advertiser] || 0) + ad.spend;
			});

			const top = Object.entries(advertiserMap)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([advertiser, spend]) => ({ advertiser, spend }));

			setTopAdvertisers(top);
		}
	}, [data]);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	if (error) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: 2,
				}}
			>
				<Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
					Error Loading Data: {error}
				</Typography>
			</Box>
		);
	}

	return (
		<Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
			{loading ? (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "50vh",
					}}
				>
					<CircularProgress />
					<Typography variant="h6" sx={{ ml: 2 }}>
						Loading advertising data...
					</Typography>
				</Box>
			) : (
				<Box sx={{ width: "100%" }}>
					<Paper sx={{ p: 2, width: "100%", height: "100%", mb: 3 }}>
						<FilterPanel
							advertisers={advertisers}
							elections={elections}
							topics={topics}
							onFilterChange={applyFilter}
							onResetFilters={resetFilters}
						/>
					</Paper>
					<Paper sx={{ p: 2, mb: 3, width: "100%" }}>
						<DataSummary data={data} topAdvertisers={topAdvertisers} />
					</Paper>

					<Paper sx={{ mb: 3, width: "100%" }}>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							indicatorColor="primary"
							textColor="primary"
							variant="fullWidth"
						>
							<Tab label="Data Aggregation" />
							<Tab label="Visualizations" />
						</Tabs>

						<Box sx={{ p: 2 }}>
							{activeTab === 0 && <AggregationPanel data={data} />}
							{activeTab === 1 && <ChartContainer />}
						</Box>
					</Paper>
				</Box>
			)}
		</Container>
	);
};

export default Dashboard;
