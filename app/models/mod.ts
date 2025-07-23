import {
  CHIP_IMPLANT_MAP,
  ChipImplantDetailsType,
} from "~/models/chip_implant";
import { MAGNET_IMPLANT_MAP } from "~/models/magnet_implant";

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
  image_uri?: string;
  product_url?: string;
  discontinued?: number;
  popularity?: number;
}

export interface ModInterface extends ModMetadata {
  // name: string;
  // mod_type: string;
  type: string;
  summary: SummaryLine[];
  details: ChipImplantDetailsType;
  features: { [key: string]: FeatureType };
  // install_method: string;
  // description?: string | null;
  // first_offered?: number | null;
  // image_uri?: string;
  // product_url?: string;
}

export abstract class Mod implements ModInterface {
  readonly name: string;
  readonly mod_type: ModType;
  protected _features: { [key: string]: FeatureType };
  readonly install_method: string = "Unknown";
  readonly description: string | undefined;
  readonly first_offered: number | undefined;
  readonly image_uri: string | undefined;
  readonly product_url: string | undefined;
  readonly discontinued: number | undefined;
  readonly popularity: number | undefined;

  constructor(
    meta: ModMetadata,
    features: Partial<Record<string, FeatureType>> = {},
  ) {
    const {
      name,
      mod_type,
      install_method,
      description,
      first_offered,
      image_uri,
      product_url,
      discontinued,
      popularity,
    } = meta;
    this.name = name;
    this.mod_type = mod_type;
    this.install_method = install_method ?? "Unknown";
    this._features = features as Record<string, FeatureType>;
    this.description = description;
    this.first_offered = first_offered;
    this.image_uri = image_uri;
    this.product_url = product_url;
    this.discontinued = discontinued;
    this.popularity = popularity;
  }

  // Exists to be overridden
  get type(): string {
    return this.name;
  }

  get features() {
    return this._features;
  }

  get details(): ChipImplantDetailsType {
    // @ts-expect-error exists to be overridden
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

export const MODS_MAP = {};
Object.assign(MODS_MAP, CHIP_IMPLANT_MAP);
