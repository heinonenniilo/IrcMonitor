import { BarChartRow } from "api/models/BarChartRow";
import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";

export interface BarCharComponentProps {
  rows: Array<BarChartRow>;
  dataSetLabel: string;
  chartTitle: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const
    },
    title: {
      display: true,
      text: "Overview chart"
    }
  }
};

export const BarChartComponent: React.FC<BarCharComponentProps> = ({
  rows,
  dataSetLabel,
  chartTitle
}) => {
  const labels = rows.map((r) => r.label);
  return (
    <Box display={"flex"} flexDirection={"column"} flex={1}>
      <Bar
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const
            },
            title: {
              display: true,
              text: chartTitle
            }
          }
        }}
        data={{
          labels: labels,
          datasets: [
            { data: rows.map((r) => r.value), backgroundColor: "blue", label: dataSetLabel }
          ]
        }}
      />
    </Box>
  );
};
