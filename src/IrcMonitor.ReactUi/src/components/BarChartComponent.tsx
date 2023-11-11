import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";
import { BarChartReturnModel } from "api";

export interface BarCharComponentProps {
  rows: BarChartReturnModel;
  dataSetLabel: string;
  chartTitle: string;
  onClick?: (index: number) => void;
  showPointerOnHover?: boolean;
  maxHeight?: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Colors);

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
  maxHeight
}) => {
  const labels = rows?.labels ?? [];
  return (
    <Box flex={1} position={"relative"} maxHeight={maxHeight} height={"auto"} width={"auto"}>
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
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const
            },
            title: {
              display: true,
              text: chartTitle
            },
            colors: {
              forceOverride: true
            }
          }
        }}
        data={{
          labels: labels,
          datasets: rows?.dataSets
            ? rows.dataSets.map((d) => {
                return { data: d.values, label: d.label };
              })
            : []
        }}
      />
    </Box>
  );
};
