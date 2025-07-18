import { ChipImplantDetailsType } from "~/models/chip_implant";

export type ModType = "Magnet" | "Chip" | "Other Mod" | "xLED";

/**
 */
export type FeatureType = {
  [key: string]: any;
};

export interface FeatureSupportedInterface extends FeatureType {
  supported: boolean;
}

export interface SummaryLine {
  feature: string;
  value: string;
}

export interface ModInterface {
  name: string;
  mod_type: string;
  type: string;
  summary: SummaryLine[];
  details: ChipImplantDetailsType;
  features: { [key: string]: FeatureType };
  install_method: string;
  description: string | null | undefined;
  first_offered: number | undefined | null;
}

export abstract class Mod implements ModInterface {
  readonly name: string;
  readonly mod_type: string;
  protected _features: { [key: string]: FeatureType };
  readonly install_method: string = "Unknown";
  readonly description: string | undefined;
  readonly first_offered: number | undefined | null;

  constructor(
    meta: ModMetadata,
    features: Partial<Record<string, FeatureType>> = {},
  ) {
    const { name, mod_type, install_method, description, first_offered } = meta;
    this.name = name;
    this.mod_type = mod_type;
    this.install_method = install_method ?? "Unknown";
    this._features = features as Record<string, FeatureType>;
    this.description = description;
    this.first_offered = first_offered;
  }

  // Exists to be overridden
  get type(): string {
    return this.name;
  }

  get features() {
    return this._features;
  }

  get details(): ChipImplantDetailsType {
    return {};
  }

  // Exists to be overridden
  get summary() {
    return Object.keys(this._features).map((key) => {
      return {
        feature: key,
        value: String(this._features[key]),
      };
    });
  }

  public toString(): string {
    return this.name;
  }
}

export interface ModMetadata {
  /** e.g., "DT NExT" */
  name: string;
  /** etc. for all boolean properties... */
  mod_type: ModType;
  /** "Injectable", "Needle", "Scalpel", or "Unknown" */
  install_method?: string;
  /** "flex", "x-series", "other", or "Unknown" */
  description?: string;
  first_offered?: number;
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
