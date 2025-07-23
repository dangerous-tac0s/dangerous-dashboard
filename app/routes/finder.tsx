import UseCaseLegend from "~/src/UseCaseLegend";
import { Grid, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { LegendMenu } from "../src/UseCaseLegend";
import { useLoaderData } from "@remix-run/react";
import rawData from "~/data/implants.json";
import { applyFilters, transformOverallByProduct } from "~/routes/chart";
import { Mod, ModInterface, MODS_MAP } from "~/models/mod";
import { CHIP_IMPLANT_MAP } from "~/models/chip_implant";
import FinderFilter from "~/src/FinderFilter";
import finderFilter from "~/src/FinderFilter";
import SortControl, { defaultSort } from "~/src/SortControl";

// TODO: Sorting control - popularity (overall), popularity (recent), price (lowest), price (highest), newest, oldest
// TODO: Type - Chips v. Magnets?

const applyFinderFilters = (data: any[], filters: string[]) => {
  let filteredData = [...data];
  if (filters.includes("only_new")) {
    return filteredData.filter(
      (d) => d.first_offered >= new Date().getFullYear() - 1,
    );
  }
  if (!filters.includes("show_discontinued")) {
    filteredData = filteredData.filter((d) => d.discontinued === undefined);
  }
  if (!filters.includes("show_unreleased")) {
    filteredData = filteredData.filter((d) => d.first_offered > 0);
  }

  return filteredData;
};

const applySorting = (
  data: ModInterface[],
  sorting: string,
  sortOrder: string,
) => {
  switch (sorting) {
    case "popularity-recent":
    case "popularity-overall":
      if (sortOrder !== "desc") {
        return data.sort((a, b) => a.popularity - b.popularity);
      } else {
        return data.sort((a, b) => b.popularity - a.popularity);
      }
  }
};

export const loader = ({ request }) => {
  const url = new URL(request.url);
  const type = ["chips"];
  let chipFilters = url.searchParams.getAll("feature");
  const sorting = url.searchParams.get("sort") ?? defaultSort.sorting;
  const sortOrder = url.searchParams.get("sortOrder") ?? defaultSort.sortOrder;
  const filters = url.searchParams.getAll("filter");
  let data = null;
  if (sorting.includes("popularity-overall")) {
    data = transformOverallByProduct(rawData["overall"]);
  } else {
    const currentYear = new Date().getFullYear();
    // Default to the most recent
    let years = Object.keys(rawData)
      .filter((category) => category !== "overall")
      .map((year) => parseInt(year))
      .filter((year) => year !== currentYear);
    data = transformOverallByProduct(rawData[Math.max(...years).toString()]);
  }
  // if (
  //   sorting.includes("popularity-overall") ||
  //   sorting.includes("popularity-recent")
  // ) {
  //   data = data.sort((a, b) => a.direct - b.direct);
  // }

  Object.keys(CHIP_IMPLANT_MAP).forEach((key) => {
    if (!data.find((item) => item.product === key)) {
      data.push({ product: key, direct: 0 });
    }
  });

  data = applyFilters(data, type, chipFilters);

  const products: ModInterface[] = data.map((mod) => {
    return CHIP_IMPLANT_MAP[mod.product](mod.direct);
  });
  const filtered = applyFinderFilters(products, filters);

  const sorted = applySorting(filtered, sorting, sortOrder);

  return sorted;
};

const ModFinderRoute = () => {
  const data = useLoaderData();

  return (
    <Grid container size={{ xs: 12, md: 6 }} my={2}>
      <Grid
        component={Paper}
        flex={1}
        p={1}
        container
        justifyContent="space-between"
      >
        {/* header */}
        <Grid size={{ xs: 12 }} pt={"1rem"} flexDirection={"row"} container>
          <Grid size={{ xs: 10 }}>
            <LegendMenu />
          </Grid>
          <Grid size={{ xs: 2 }} justifyContent="space-evenly" container>
            <FinderFilter />
            <SortControl />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <hr />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant={"h6"}>Implant Name</Typography>
        </Grid>
        <Grid
          size={{ xs: 0, sm: 8 }}
          display={{ xs: "none", sm: "flex" }}
          justifyContent="space-between"
        >
          <Typography variant={"h6"}>Features</Typography>
          <Typography variant={"subtitle1"}>
            Showing {data.length} results
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <hr />
        </Grid>
        {/* data rows */}
        <Grid size={{ xs: 12 }} justifyContent={"center"} container>
          {data.map((mod, i) => (
            <Grid
              key={`${mod.name}-${i}`}
              size={{ xs: 8, sm: 12 }}
              sx={{ backgroundColor: i % 2 === 1 ? "secondary" : "black" }}
              container
            >
              <Grid
                size={{ xs: 12, sm: 4 }}
                sx={{ alignContent: "center" }}
                pl={".5rem"}
              >
                <a style={{ textDecoration: "none" }} href={`mod/${mod.name}`}>
                  {mod.name.replace("DT ", "")}
                </a>
              </Grid>
              <Grid
                display={{ xs: "none", sm: "flex" }}
                size={{ xs: 0, sm: 8 }}
              >
                <UseCaseLegend props={{ name: mod.name }} />
              </Grid>
            </Grid>
          ))}
          {data.length === 0 ? (
            <Grid
              key={"nothing-found"}
              size={{ xs: 12 }}
              justifyContent={"center"}
              p={"1rem"}
              container
            >
              <Typography variant={"subtitle1"}>
                No single product found.
              </Typography>
            </Grid>
          ) : null}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <hr />
        </Grid>
      </Grid>
      {/*<UseCaseLegend props={{ name: "DT NExT" }} />*/}
    </Grid>
  );
};

export default ModFinderRoute;
