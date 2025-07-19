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
  let chipFilters = url.searchParams.getAll("feature");
  // const parsed = json.parse(rawData);
  const transformed = transformOverallByProduct(
    rawData["overall"] as unknown as DataSubset,
  );

  const IMPLANT_MAP = {};
  Object.assign(IMPLANT_MAP, CHIP_IMPLANT_MAP, MAGNET_IMPLANT_MAP);

  const data = applyFilters(transformed, active, chipFilters)
    .sort((a, b) => a.product.localeCompare(b.product))
    //@ts-expect-error
    .map((item) => IMPLANT_MAP[item.product]());

  const formatted = data.map((item) => ({
    name: item.name,
    uid_length: item._uid_length,
    frequency: item.frequency,
    type: item.type,
    form_factor: item.form_factor,
    description: item.description,
    first_offered: item.first_offered,
    features: item.features,
    details: item.details,
  }));

  return json(formatted, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
