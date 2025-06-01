import { ModInterface } from "~/models/mod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const getColor = (value: string) => {
  return parseFloat(value) >= 0 ? "#0000FF" : "#FF0000";
};

const ModDetailChart = ({
  mod,
  rawData,
}: {
  mod: ModInterface;
  rawData: { [key: string]: Record<string, string> };
}) => {
  const years = Object.keys(rawData).filter((k) => k !== "overall");

  const popularity = years
    .filter((year: string) => rawData[year][mod.name])
    .map((year: string) => ({
      name: year,
      value: rawData[year][mod.name] || 0,
    }));

  // Get the min and max values for Y-axis scaling. Add padding 'cause it looks nice.
  const minValue = Math.min(
    ...popularity.map((entry) => parseFloat(entry.value as string) * 1.25),
  );
  const maxValue = Math.max(
    ...popularity.map((entry) => parseFloat(entry.value as string) * 1.25),
  );

  const halfPlotHeight = Math.max(Math.abs(minValue), maxValue);
  const gradientOffset = () => {
    if (maxValue <= 0) {
      return 0;
    }
    if (minValue >= 0) {
      return 1;
    }

    return maxValue / (maxValue - minValue);
  };
  const off = gradientOffset();

  return (
    <Box sx={{ width: "100%", height: 200, position: "relative" }}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={popularity} margin={{ top: 20, bottom: 0, right: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <ReferenceLine y={0} stroke="#FFF" />
          <YAxis domain={[halfPlotHeight * -1, halfPlotHeight]} tick={false} />
          {/* Explicit Y-axis range */}
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="blue" stopOpacity={1} />
              <stop offset={off} stopColor="red" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#000"
            fill="url(#splitColor)"
          />
          {popularity.length === 0 && (
            <ReferenceDot x={0} y={0} r={0} isFront>
              <Label
                value="No Data Available"
                position="center"
                fill="#999"
                fontSize={16}
                textAnchor="middle"
              />
            </ReferenceDot>
          )}
        </AreaChart>
      </ResponsiveContainer>{" "}
      {popularity.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            bgcolor: "transparent",
          }}
        >
          <Typography variant="body1" color="text.secondary" mt={-4}>
            No Data Available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ModDetailChart;
