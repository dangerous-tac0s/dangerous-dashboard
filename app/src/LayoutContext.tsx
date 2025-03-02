import { createContext, useContext, useState } from "react";
import rawData from "~/data/implants.json";

export interface LayoutState {
  [key: string]: any;
}
// Create context
const LayoutContext = createContext({} as LayoutState);

// Custom hook for easy access
export function useLayout() {
  return useContext(LayoutContext);
}

export const defaults = {
  "/chart": {
    type: [
      { name: "chips", active: true },
      { name: "magnets", active: true },
    ],
    period: [
      {
        name: "overall",
        active: true,
      },
      ...Object.keys(rawData)
        .filter((e) => e !== "overall")
        .map((key: string) => ({
          name: key,
          active: false,
        })),
    ],
  },
};

// Provider component
// @ts-ignore
export function LayoutProvider({ children }) {
  const [filters, setFilters]: [
    LayoutState,
    React.Dispatch<React.SetStateAction<LayoutState>>,
  ] = useState({ ...defaults } as LayoutState);

  const handleTypeChange = (
    newTypeFilterKeys: string[],
  ): { name: string; active: boolean }[] => {
    if (newTypeFilterKeys.length === 0 || newTypeFilterKeys.length === 2) {
      return [...defaults["/chart"]["type"]];
    }

    const current: { name: string; active: boolean }[] = [
      ...filters["/chart"]["type"],
    ];

    return current.map((item) => ({
      name: item.name,
      active: !newTypeFilterKeys.includes(item.name),
    }));
  };

  const setTypeFilter = (e: any) => {
    setFilters({
      ...filters,
      ["/chart"]: {
        ...filters["/chart"],
        ["type"]: handleTypeChange(e.target.value),
      },
    });
  };

  return (
    <LayoutContext.Provider value={{ filters, setFilters, setTypeFilter }}>
      {children}
    </LayoutContext.Provider>
  );
}
