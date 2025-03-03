import { ModInterface } from "~/models/mod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

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

  const halfPlotHight = Math.max(Math.abs(minValue), maxValue);
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
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={popularity} margin={{ top: 20, bottom: 20, right: 75 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <ReferenceLine y={0} stroke="#FFF" />
        <YAxis domain={[halfPlotHight * -1, halfPlotHight]} tick={false} />
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
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ModDetailChart;
