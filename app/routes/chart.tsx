import Box from "@mui/material/Box";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { CHIP_IMPLANT_MAP } from "~/models/chip_implant";
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
  AreaChart,
  Area,
} from "recharts";
import { useLayout } from "~/src/LayoutContext";
import {
  Container,
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

// const MultiSelectCheckmarks = lazy(() => import("../MultiSelect"));

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
  const allYears = Object.keys(dataObj).filter((k) => k !== "overall");
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
    if (tooltipVisible && previousClick === dataItem.product) {
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
    const [hovered, setHovered] = useState(false);
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
        <Table>
          <TableHead
            component={Paper}
            sx={{
              backgroundColor: theme.palette.action.selected,
            }}
          >
            {["chip", "xled"].includes(mod.mod_type.toLowerCase()) ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <UseCaseLegend props={{ name: mod.name }} />
                </TableCell>
              </TableRow>
            ) : (
              ""
            )}
            <TableRow
              component={Paper}
              sx={{
                color: theme.palette.getContrastText(
                  theme.palette.action.active,
                ),
              }}
            >
              <TableCell>
                {formatter ? formatter(label as number) : label}
              </TableCell>
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
          tickFormatter={floatToLocalizedPercentage} // X-axis now represents values
        />
        <YAxis
          type="category"
          dataKey="product" // Y-axis now represents categories
          tick={({ payload, x, y }) => (
            <text
              x={x}
              y={y}
              dy={4}
              fontSize={18}
              textAnchor="end"
              fill="#666"
              style={{ whiteSpace: "pre-line" }} // Prevent wrapping
            >
              {/* Trim the labels to reduce the width... Slightly. */}
              {payload.value
                .replace(/^(DT|VivoKey)\W/, "")
                .replace(/Payment\WConversion/, "Payment\nConversion")}
            </text>
          )}
          width={200}
        />
        {/* @ts-expect-error BarChat is passing params to the tooltip*/}
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="direct"
          onClick={handleBarClick}
          onMouseMove={(e) =>
            setTooltipVisible(e.activeTooltipIndex !== undefined)
          }
          onMouseLeave={() => setTooltipVisible(false)}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={colorMap[entry.product]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
