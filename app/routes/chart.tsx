import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { CHIP_IMPLANT_MAP, ChipImplant } from "~/models/chip_implant";
import { MAGNET_IMPLANT_MAP } from "~/models/magnet_implant";
import { ModInterface } from "~/models/mod";
import { json, MetaFunction } from "@remix-run/node";
import rawData from "~/data/implants.json";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { useLayout } from "~/src/LayoutContext";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import theme from "~/src/theme";
import UseCaseLegend from "~/src/UseCaseLegend";

// Vaguely colorblind safe
export const colorPalette45: string[] = [
  "#2e1d9c",
  "#351e2f",
  "#364e1c",
  "#552e9d",
  "#563653",
  "#596da5",
  "#69655a",
  "#693c1b",
  "#44366a",
  "#9e6036",
  "#8e6b8f",
  "#7a71d0",
  "#608110",
  "#9695d6",
  "#405906",
  "#62acb6",
  "#a5aa30",
  "#c582c2",
  "#bfaba9",
  "#66d915",
  "#8dc367",
  "#c0dba5",
  "#403510",
  "#b74979",
  "#c6c23c",
  "#caa992",
  "#91cce9",
  "#b1d05e",
  "#73328d",
  "#d65f2c",
  "#747794",
  "#ce9b54",
  "#aa7ce3",
  "#dfaedb",
  "#b7c9ce",
  "#798346",
  "#d4d95f",
  "#e6c9c0",
  "#8b9562",
  "#92dfb0",
  "#d07baf",
  "#4a8b82",
  "#e1b437",
  "#e4917a",
  "#ebd860",
  "#8e506b",
];

interface DataSubset {
  direct: { [key: string]: number };
}

export interface DataSet {
  [key: string]: DataSubset;
}

export function numberToLocalizedNumber(value: string) {
  const userLocale =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;

  // Extract the first number from the string (handles decimals)
  const match = value.match(/[\d,.]+/);
  if (!match) return value; // Return original if no number is found

  const numberString = match[0];

  // Normalize number (handle different formats like "1,234.56" or "1.234,56")
  const normalizedNumber = parseFloat(numberString.replace(/,/g, ""));

  if (isNaN(normalizedNumber)) return value; // Return original if parsing fails

  // Format number based on locale
  const formattedNumber = new Intl.NumberFormat(userLocale).format(
    normalizedNumber,
  );

  // Replace the original number in the string with the formatted one
  return value.replace(numberString, formattedNumber);
}

export function floatToLocalizedPercentage(value: number, decimals = 2) {
  const userLocale =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
  return new Intl.NumberFormat(userLocale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export async function loader() {
  return json(rawData);
}

/**
 * mergeProductCounts(target, productName, amount, category)
 *   - Merges `amount` into `target[productName][category]`.
 *     For example, if category="direct", we add `amount` to target[productName].direct.
 */
function mergeProductCounts(
  target: { [key: string]: { [key: string]: number } },
  productName: string,
  amount: number,
  category: string,
) {
  if (!target[productName]) {
    target[productName] = { direct: 0 };
  }
  target[productName][category] += amount;
}

/**
 * transformOverallByProduct(overallObj)
 *   Summation of all products (across all time) with direct/resellers/partners.
 *   Returns an array: [ { product: "DT NExT", direct: 2818, resellers: 169, partners: 185 }, ...]
 */
function transformOverallByProduct(overallObj: DataSubset) {
  const productMap = {} as {
    [key: string]: { direct: number };
  };

  // Merge direct
  for (const [prod, amt] of Object.entries(overallObj.direct || {})) {
    mergeProductCounts(productMap, prod, amt, "direct");
  }

  // Convert productMap to array
  return Object.entries(productMap).map(([product, cat]) => ({
    product,
    direct: cat.direct,
  }));
}

export const meta: MetaFunction = () => {
  return [
    { title: "Dangerous Dashboard" },
    {
      name: "description",
      content: "Informing Dangerous Decisions Since 2025",
    },
  ];
};

type ChartDataItem = {
  product: string;
  direct: number;
};
const Chart = () => {
  const navigate = useNavigate();
  const dataObj = useLoaderData<DataSet>();
  // const [mode, setMode] = useState("overall");
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const [ALL_MODS, setAll_MODS] = useState<Record<
    string,
    () => ModInterface
  > | null>(null);
  const { filters } = useLayout();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [previousClick, setPreviousClick] = useState<string | null>(null);

  const mode =
    Object.keys(filters).length > 0
      ? filters["/chart"]["period"].find(
          (p: { name: string; active: boolean }) => p.active,
        ).name
      : "overall";

  // A single handler for all bars
  const handleBarClick = (dataItem: ChartDataItem) => {
    if (
      tooltipVisible &&
      (previousClick === dataItem.product || previousClick === null)
    ) {
      // Navigate to /mod/<productName>
      setPreviousClick(null);
      navigate(`/mod/${encodeURIComponent(dataItem.product)}`);
    } else {
      setPreviousClick(dataItem.product);
      setTooltipVisible(true);
    }
  };

  const applyFilters = (
    data: { product: string; direct: number }[],
  ): { product: string; direct: number }[] => {
    // Type Filter
    const active = filters["/chart"]["type"]
      .filter((t: { name: string; active: boolean }) => t.active)
      .map((t: { name: string; action: boolean }) => t.name);
    let updated = [...data];
    if (active.length === 0) {
      return [];
    }
    if (active.length < 2) {
      switch (active[0]) {
        case "chips":
          updated = updated.filter((item) =>
            Object.keys(CHIP_IMPLANT_MAP).includes(item.product),
          );
          break;
        case "magnets":
          updated = updated.filter((item) =>
            Object.keys(MAGNET_IMPLANT_MAP).includes(item.product),
          );
          break;
        default:
          updated = [];
      }
    }

    // Chip
    if (active.length === 1 && active.some((item) => item === "chips")) {
      const chipFilters = { ...filters["/chart"].chip };

      // At least one chip filter is in use
      if (Object.values(chipFilters).some((item) => item)) {
        // Get our active chip filters
        const activeChipFilters = Object.entries(chipFilters)
          .filter(([_name, active]) => active)
          .map(([name, _active]) => name);

        updated = updated.filter((item) =>
          activeChipFilters.every((f) => {
            const chipImplant: ChipImplant = CHIP_IMPLANT_MAP[item.product]();
            // console.log(chipImplant.options);
            return chipImplant.features[f].supported;
          }),
        );
      }
    }

    return updated;
  };

  const data = applyFilters(transformOverallByProduct(dataObj[mode])).sort(
    (a, b) => a.product.localeCompare(b.product),
  );

  // Simple custom tooltip: shows label + each dataKey’s name + value
  function CustomTooltip({
    active,
    payload,
    label,
    formatter,
    position,
  }: {
    active: boolean;
    payload: never | { dataKey: string; color: string; value: number }[];
    label: string | number;
    formatter: (value: number) => string;
    position: { x?: number; y?: number };
  }) {
    const [hovered, _setHovered] = useState(false);
    if (!active && !hovered) return null;
    if (!ALL_MODS) {
      return null;
    }

    const mod = Object.hasOwn(ALL_MODS, label) ? ALL_MODS[label]() : null;
    if (!active || !mod || !payload || payload.length === 0) {
      return null;
    }

    return mod ? (
      <Grid
        size={{ xs: 12, lg: 6, xl: 4 }}
        sx={{
          position: "fixed",
          top: position?.y ?? "50%",
          left: position?.x ?? "50%",
          transform: "translate(-50%, -50%)",
        }}
        component={Paper}
        border={`solid thin ${theme.palette.mode === "dark" ? "black" : "gray"}`}
      >
        {["chip", "xled"].includes(mod.mod_type.toLowerCase()) ? (
          <UseCaseLegend props={{ name: mod.name }} />
        ) : (
          ""
        )}
        <Table>
          <TableHead
            sx={{
              backgroundColor: theme.components?.MuiPaper?.defaultProps?.color,
            }}
          >
            <TableRow
              sx={{
                color: theme.palette.getContrastText(
                  theme.palette.action.active,
                ),
              }}
            >
              <TableCell>{label}</TableCell>
              <TableCell>
                {payload.map((entry) =>
                  floatToLocalizedPercentage(entry.value),
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              backgroundColor: theme.palette.action.selected,
            }}
          >
            <TableRow>
              <TableCell component="th" scope="row">
                Type:
              </TableCell>
              <TableCell>{mod.mod_type}</TableCell>
            </TableRow>
            {mod.summary.map(
              (ele: { feature: string; value: string }, i: number) => (
                <TableRow key={i}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ display: "flex", alignItems: "flex-start" }}
                  >
                    {ele.feature}:&nbsp;
                  </TableCell>
                  <TableCell style={{ whiteSpace: "pre-line" }}>
                    {ele.value}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </Grid>
    ) : (
      ""
    );
  }

  // Build a consistent color map
  useEffect(() => {
    setAll_MODS(Object.assign({}, CHIP_IMPLANT_MAP, MAGNET_IMPLANT_MAP));

    const colorMap: { [key: string]: string } = {};
    Object.keys(dataObj["overall"]["direct"]).map((k, index) => {
      colorMap[k] = colorPalette45[index % colorPalette45.length];
    });
    setColorMap(colorMap);
  }, []);

  const barHeight = 50;
  const minHeight = 300;
  const chartHeight = Math.max(data.length * barHeight, minHeight);

  const renderCustomLabel = (
    props,
  ): { x: number; y: number; height: number; index: number } => {
    const { x, y, width, height, index } = props;
    const text = floatToLocalizedPercentage(data[index].direct);

    const maxValue = Math.max(...data.map((ea) => ea.direct));

    const padding = 10;
    const approxCharWidth = 12; // approximate width per character in pixels
    const textWidth = text.length * approxCharWidth - 1 + 3;
    const rectWidth = textWidth + padding * 2 + 3;
    const rectHeight = 32; // fixed height for the box

    // Position the label just beyond the bar's end.
    let labelX = x + width + 18;
    // Unless the bar is over half the max
    if (data[index].direct > 0.5 * maxValue) {
      // Then display it in the bar near the end.
      labelX = labelX - 2 * textWidth + 2 * padding - 1;
    }

    let labelY = y + height - rectHeight + 1;
    return (
      <g>
        <rect
          x={labelX}
          y={labelY - 4}
          width={rectWidth}
          height={rectHeight}
          fill="#1F1F1F"
          stroke="lightgray"
          strokeWidth={1}
          rx={3}
          ry={3}
        />
        <text
          fontSize={"18pt"}
          x={labelX + padding}
          y={labelY + rectHeight / 2 + 5}
          textAnchor="start"
          fill="gray"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical" // Make it horizontal
        data={data}
        margin={{ top: 20, right: 50, left: 0, bottom: 20 }} // Adjust for long labels
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={floatToLocalizedPercentage}
          orientation="top"
          tickLine={false}
        />
        {/* We need to make "DT Payment Conversion" a manageable length and then adjust its position */}
        <YAxis
          type="category"
          dataKey="product" // Y-axis now represents categories
          tick={({ payload, x, y }) => (
            <text
              x={x}
              y={y}
              dy={payload.value.slice(3, 6).toLowerCase() === "pay" ? -8 : 4}
              fontSize={18}
              textAnchor="end"
              fill="#666"
              style={{ whiteSpace: "pre-line" }}
            >
              {/* Trim the labels to reduce the width... Slightly. */}
              {payload.value
                .replace(/^(DT|VivoKey)\W/, "")
                .replace(/Payment\WConversion/, "Payment\nConversion")}
            </text>
          )}
          width={200}
          interval={0}
        />
        {/* @ts-expect-error BarChat is passing params to the tooltip*/}
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="direct"
          onClick={handleBarClick}
          onMouseEnter={() => {
            setTooltipVisible(true);
          }}
          onMouseLeave={() => {
            setPreviousClick(null);
            setTooltipVisible(false);
          }}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={colorMap[entry.product]} />
          ))}

          <LabelList dataKey="percentage" content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
