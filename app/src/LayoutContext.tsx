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
    chip: {
      smartphone: false,
      legacy_access_control: false,
      digital_security: false,
      data_sharing: false,
      payment: false,
      magic: false,
      blink: false,
      temperature: false,
    },

    options: {
      smartphone: {
        iso: [], // "14443a", "14443b", "15693"
      },
      legacy_access_control: {},
      digital_security: {},
      data_sharing: {
        ndef: [], // Container size
        spark: false,
      },
      payment: { enabled: "bool" },
      magic: { chip: [] },
      blink: { color: [] },
      temperature: {},
    },

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

  const toggleChipFilter = (feature: string) => {
    setFilters({
      ...filters,
      ["/chart"]: {
        ...filters["/chart"],
        chip: {
          ...filters["/chart"].chip,
          [feature]: !filters["/chart"].chip[feature],
        },
      },
    });
  };

  return (
    <LayoutContext.Provider
      value={{ filters, setFilters, setTypeFilter, toggleChipFilter }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
