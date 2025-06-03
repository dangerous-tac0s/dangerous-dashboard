import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
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
  LabelList,
} from "recharts";
import { Grid, Paper, Typography } from "@mui/material";
import theme from "~/src/theme";
import UseCaseLegend from "~/src/UseCaseLegend";
import Box from "@mui/material/Box";

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
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const [ALL_MODS, setAll_MODS] = useState<Record<
    string,
    () => ModInterface
  > | null>(null);
  const tooltipRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [previousClick, setPreviousClick] = useState<string | null>(null);

  const [searchParams, _] = useSearchParams({
    type: ["chips", "magnets"],
    period: "overall",
    chip: [],
  });

  const mode = searchParams.get("period") ?? "overall";

  const clickInTooltip = (tooltip, clickEvent): boolean => {
    console.log("click");
    console.log(tooltip);
    const x1 = tooltip.x;
    const x2 = tooltip.x + tooltip.offsetWidth;
    const y1 = tooltip.y;
    const y2 = tooltip.y + tooltip.offsetHeight;

    return x1 < clickEvent.clientX < x2 && y1 < clickEvent.clientY < y2;
  };

  // A single handler for all bars
  const handleBarClick = (dataItem: ChartDataItem, id, e) => {
    // if (
    //   tooltipVisible &&
    //   (previousClick === dataItem.product || previousClick === null)
    // ) {
    //   setPreviousClick(null);
    // } else {
    //   setPreviousClick(dataItem.product);
    //   setTooltipVisible(true);
    // }
    navigate(`/mod/${encodeURIComponent(dataItem.product)}`);
  };

  const applyFilters = (
    data: { product: string; direct: number }[],
  ): { product: string; direct: number }[] => {
    // Type Filter
    const active = searchParams.getAll("type") ?? ["chips", "magnets"];

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
      const chipFilters = searchParams.getAll("chip") ?? [];

      // At least one chip filter is in use
      if (chipFilters.length > 0) {
        // Get our active chip filters

        updated = updated.filter((item) =>
          chipFilters.every((f) => {
            const chipImplant: ModInterface = CHIP_IMPLANT_MAP[item.product]();

            return chipImplant.features[f]?.supported;
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
        ref={tooltipRef}
        size={{ xs: 12, lg: 6, xl: 4 }}
        sx={{
          position: "fixed",
          top: position?.y ?? "50%",
          left: position?.x ?? "50%",
          transform: "translate(-50%, -50%)",
          flex: 1,
          justifyContent: "flex-start",
          cursor: "pointer", // optional, for UX
        }}
        component={Paper}
        border={`solid thin ${theme.palette.mode === "dark" ? "black" : "gray"}`}
        onClick={() => {
          console.log(`/mod/${encodeURIComponent(label)}`);
          // navigate(`/mod/${encodeURIComponent(label)}`);
        }}
      >
        {["chip", "xled"].includes(mod.mod_type.toLowerCase()) ? (
          <Grid
            container
            sx={{ backgroundColor: theme.palette.action.selected }}
          >
            <UseCaseLegend props={{ name: mod.name }} />
          </Grid>
        ) : (
          ""
        )}
        <Grid
          container
          sx={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            m: "1rem",
          }}
        >
          <Grid
            columns={4}
            sx={{
              flex: 1.5,
              m: 0,
            }}
            container
          >
            <Typography color={"white"}>
              <Link to={`/mod/${label}`}>{label}</Link>
            </Typography>
          </Grid>
          <Grid
            sx={{
              flex: 2,
              m: 0,
            }}
            container
          >
            <Typography color={"white"}>
              {payload.map((entry) => floatToLocalizedPercentage(entry.value))}
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          flexDirection={"column"}
          justifyContent={"flex-start"}
          sx={{ backgroundColor: theme.palette.action.selected }}
        >
          {mod.summary.map(
            (ele: { feature: string; value: string }, i: number) => (
              <Grid
                key={i}
                sx={{ m: 0, p: 0, borderBottom: "1px solid gray" }}
                container
              >
                <Grid
                  sx={{
                    mx: "1.5rem",
                    my: "1rem",
                    flex: 1,
                  }}
                >
                  <Typography variant={"caption"} color={"white"}>
                    {ele.feature.replace(/\n$/, "")}
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    mx: "1.25rem",
                    my: "1rem",
                  }}
                >
                  <Typography
                    variant={"caption"}
                    color={"white"}
                    whiteSpace={"pre-line"}
                  >
                    {ele.value.replace(/\n$/, "")}
                  </Typography>
                </Grid>
              </Grid>
            ),
          )}
        </Grid>
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

  const renderCustomLabel = (props: {
    x: number;
    y: number;
    height: number;
    width: number;
    index: number;
  }) => {
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
      {data.length > 0 ? (
        <BarChart
          layout="vertical" // Make it horizontal
          data={data}
          margin={{ top: 20, right: 50, left: -80, bottom: 20 }} // Adjust for long labels
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
            dataKey="product"
            tick={({ payload, x, y }) => (
              <text
                x={x}
                y={y}
                dy={payload.value.slice(3, 6).toLowerCase() === "pay" ? -8 : 4}
                fontSize={18}
                textAnchor="end"
                fill="#666"
                style={{ whiteSpace: "pre-line" }}
                onClick={() => navigate(`/mod/${payload.value}`)}
              >
                {/* Trim the labels to reduce the width... Slightly. */}
                {payload.value
                  .replace(/^(DT|VivoKey)\W/, "")
                  .replace(/Payment\WConversion/, "Pay Conv")}
              </text>
            )}
            width={200}
            interval={0}
          />
          <Bar dataKey="direct" onClick={handleBarClick} barSize={38}>
            {data.map((entry, index) => (
              <Cell key={index} fill={colorMap[entry.product]} />
            ))}
            {/* @ts-expect-error */}
            <LabelList dataKey="percentage" content={renderCustomLabel} />
          </Bar>
          <Tooltip
            content={(e) => {
              console.log(e);
              return null;
            }}
          />
        </BarChart>
      ) : (
        <Box
          sx={{
            display: "flex",
            maxWidth: "99vw",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Nothing found. Adjust filters.
        </Box>
      )}
    </ResponsiveContainer>
  );
};

export default Chart;
