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
import { Backdrop, Box, CircularProgress } from "@mui/material";

export interface BarCharComponentProps {
  rows: Array<BarChartRow>;
  dataSetLabel: string;
  chartTitle: string;
  onClick?: (index: number) => void;
  showPointerOnHover?: boolean;
  isLoading?: boolean;
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
  chartTitle,
  onClick,
  showPointerOnHover,
  isLoading
}) => {
  const labels = rows.map((r) => r.label);
  return (
    <Box display={"flex"} flexDirection={"column"} flex={1}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Bar
        options={{
          onClick: (event, elements) => {
            if (elements.length === 1 && onClick) {
              onClick(elements[0].index);
            }
          },
          onHover: (event, elements) => {
            if (!showPointerOnHover) {
              return;
            }
            const target = event.native.target as HTMLElement;

            if (elements.length > 0) {
              target.style.cursor = "pointer";
            } else {
              target.style.cursor = "auto";
            }
          },
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
