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
import { Box, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { BarChartReturnModel } from "api";

export interface BarCharComponentProps {
  rows: BarChartReturnModel;
  dataSetLabel: string;
  chartTitle: string;
  onClick?: (index: number) => void;
  showPointerOnHover?: boolean;
  maxHeight?: string;
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
  maxHeight
}) => {
  const theme = useTheme();
  const barColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.error.main
  ];
  const labels = rows?.labels ?? [];
  return (
    <Box flex={1} position={"relative"} maxHeight={maxHeight} height={"auto"} width={"auto"}>
      <Bar
        options={{
          color: theme.palette.text.primary,
          scales: {
            x: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.divider } },
            y: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.divider } }
          },
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
              color: theme.palette.text.primary,
              text: chartTitle
            },
            colors: {
              enabled: false
            }
          }
        }}
        data={{
          labels: labels,
          datasets: rows?.dataSets
            ? rows.dataSets.map((d, index) => {
                const color = barColors[index % barColors.length];
                return {
                  data: d.values,
                  label: d.label,
                  backgroundColor: alpha(color, 0.75),
                  borderColor: color,
                  borderWidth: 1,
                  hoverBackgroundColor: color,
                  hoverBorderColor: color,
                  borderRadius: 4
                };
              })
            : []
        }}
      />
    </Box>
  );
};
