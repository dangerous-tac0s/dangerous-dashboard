import rawData from "~/data/implants.json";
import { DataSubset, transformOverallByProduct } from "~/routes/chart";
import { applyFilters } from "./chart";
import { json } from "@remix-run/node";
import { CHIP_IMPLANT_MAP } from "~/models/chip_implant";
import { MAGNET_IMPLANT_MAP } from "~/models/magnet_implant";

export const loader = ({ request }) => {
  const url = new URL(request.url);
  let active = url.searchParams.getAll("type");
  if (active.length === 0) {
    active = ["chips", "magnets"];
  }
  let chipFilters = url.searchParams.getAll("chip");
  // const parsed = json.parse(rawData);
  const transformed = transformOverallByProduct(
    rawData["overall"] as unknown as DataSubset,
  );

  const IMPLANT_MAP = {};
  Object.assign(IMPLANT_MAP, CHIP_IMPLANT_MAP, MAGNET_IMPLANT_MAP);

  const data = applyFilters(transformed, active, chipFilters)
    .sort((a, b) => a.product.localeCompare(b.product))
    .map((item) => IMPLANT_MAP[item.product]());

  return json(data, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
