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
}

export abstract class Mod implements ModInterface {
  readonly name: string;
  readonly mod_type: string;
  protected _features: { [key: string]: FeatureType };
  readonly install_method: string = "Unknown";
  readonly description: string | null | undefined;

  constructor(
    meta: ModMetadata,
    features: Partial<Record<string, FeatureType>> = {},
  ) {
    const { name, mod_type, install_method, description } = meta;
    this.name = name;
    this.mod_type = mod_type;
    this.install_method = install_method ?? "Unknown";
    this._features = features as Record<string, FeatureType>;
    this.description = description ?? null;
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
  //
  // public get blink(): BlinkType {
  //   return this._blink;
  // }
  //
  // public get has_blink(): boolean {
  //   return Object.keys(this._blink).length > 0;
  // }
  //
  // public get chip(): ChipInterface[] {
  //   return this._chip;
  // }
  //
  // public get frequency(): string | void {
  //   if (!["Chip", "xLED"].includes(this.mod_type)) {
  //     return;
  //   }
  //
  //   if (this.dual_freq) {
  //     return "Dual";
  //   } else if (this.nfc) {
  //     return "NFC";
  //   } else if (this.rfid) {
  //     return "RFID";
  //   }
  // }
  //
  // public get can_share_data(): boolean {
  //   return this._chip.some((chip) =>
  //     chip.magic.invoked_by
  //       ? chip.features.magic.chips.some(
  //           (mag) => mag.features.ndef_capable || mag.features.spark_capable,
  //         )
  //       : chip.features.ndef_capable || chip.features.spark_capable,
  //   );
  // }
  //
  // public get has_chip(): boolean {
  //   return this._chip.length > 0;
  // }
  //
  // public get has_magic(): boolean {
  //   return this._chip.some((chip) => chip.features.magic.invoked_by);
  // }
  //
  // public get is_magnet(): boolean {
  //   return this.mod_type.toLowerCase() === "magnet";
  // }
  //
  // public get is_other_mod(): boolean {
  //   return this.mod_type.toLowerCase() === "other mod";
  // }
  //
  // public get has_smartcard(): boolean {
  //   return this._chip.some((chip) => chip.features.jcop);
  // }
  //
  // public get payment_enabled(): boolean {
  //   return this._chip.some((chip) => chip.features.payment);
  // }
  //
  // public get rfid(): boolean {
  //   if (this._chip.length === 0) return false;
  //
  //   return this._chip.some((ch) =>
  //     ch.features.magic.invoked_by
  //       ? ch.features.magic.chips.some((mag) =>
  //           mag.frequency?.some((f) => freqMap[f].toLowerCase() === "rfid"),
  //         )
  //       : ch.frequency?.some((f) => freqMap[f].toLowerCase() === "rfid"),
  //   );
  // }
  //
  // public get nfc(): boolean {
  //   if (this._chip.length === 0) return false;
  //
  //   return this._chip.some((ch) =>
  //     ch.features.magic.invoked_by
  //       ? ch.features.magic.chips.some((mag) =>
  //           mag.frequency?.some((f) => freqMap[f].toLowerCase() === "nfc"),
  //         )
  //       : ch.frequency?.some((f) => freqMap[f].toLowerCase() === "nfc"),
  //   );
  // }
  //
  // public get dual_freq(): boolean {
  //   return this.nfc && this.rfid;
  // }

  public toString(): string {
    return this.name;
  }

  //   public get summary(): { feature: string; value: string }[] {
  //     const elements: { feature: string; value: string }[] = [
  //       { feature: "type", value: this.mod_type },
  //     ];
  //
  //     switch (this.mod_type.toLowerCase()) {
  //       case "chip":
  //         elements.push({
  //           feature: "frequency",
  //           value: this.frequency as string,
  //         });
  //         if (this.can_share_data) {
  //           elements.push({
  //             feature: "Data Sharing",
  //             value: this.can_share_data.toString(),
  //           });
  //         }
  //         if (this.has_blink) {
  //           elements.push({
  //             feature: "blink",
  //             value: this._chip.length === 1 ? "True" : this.blink.type,
  //           });
  //         }
  //         if (this.has_magic) {
  //           elements.push({ feature: "magic", value: this.has_magic.toString() });
  //         }
  //         if (this.has_smartcard) {
  //           elements.push({
  //             feature: "smartcard",
  //             value: this.has_smartcard.toString(),
  //           });
  //         }
  //         if (this.payment_enabled) {
  //           elements.push({ feature: "payment", value: "True" });
  //         }
  //         break;
  //       case "magnet":
  //         break;
  //       case "other_mod":
  //         break;
  //       case "xled":
  //         elements.push({
  //           feature: "blink",
  //           value: this.blink.type,
  //         });
  //     }
  //     return elements;
  //   }
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
}

/**
 * A single dictionary: product name => ModMetadata
 */
// export const PRODUCT_METADATA: Record<string, ModMetadata> = {
//   "DT flexNT": {
//     name: "DT flexNT",
//     chip: [new NTAG216()],
//     install_method: "Scalpel",
//     form_factor: "flex",
//     mod_type: "Chip",
//   },
//   "DT flexSecure": {
//     name: "DT flexSecure",
//     chip: [new P71()],
//     install_method: "Needle",
//     form_factor: "flex",
//     mod_type: "Chip",
//   },
//   "DT flexUG4": {
//     name: "DT flexUG4",
//     chip: [new UltimateGen4()],
//     install_method: "Needle",
//     form_factor: "flex",
//     mod_type: "Chip",
//   },
//   "DT Payment Conversion": {
//     name: "DT  Payment Conversion",
//     chip: [new PaymentChip()],
//     form_factor: "flex",
//     mod_type: "Chip",
//   },
//   "DT NExT": {
//     name: "DT NExT",
//     chip: [new NTAG216(), new T5577()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//   },
//   "DT xBT": {
//     name: "DT xBT",
//     chip: [new DestronFearing()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//   },
//   "DT xEM": {
//     name: "DT xEM",
//     chip: [new T5577()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//   },
//   "DT xLED HF": {
//     name: "DT xLED HF",
//     blink: { type: "nfc", available_colors: ["red", "green", "blue", "white"] },
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "xLED",
//   },
//   "DT xLED LF": {
//     name: "DT xLED LF",
//     blink: {
//       type: "rfid",
//       available_colors: ["red", "green", "blue", "white"],
//     },
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "xLED",
//   },
//   "DT xHT": {
//     name: "DT xHT",
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//     chip: [new Hitag2048()],
//   },
//   "DT xM1+": {
//     name: "DT xM1+",
//     chip: [new MagicMIFAREg1a()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//   },
//   "DT xNT": {
//     name: "DT xNT",
//     chip: [new NTAG216()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     mod_type: "Chip",
//   },
//   "DT xSIID": {
//     name: "DT xSIID",
//     chip: [new NTAGI2C()],
//     install_method: "Injectable",
//     form_factor: "x-series",
//     blink: {
//       type: "nfc",
//       available_colors: ["red", "green", "blue", "white", "amber"],
//     },
//     mod_type: "Chip",
//   },
//   "DT xG3 v1": {
//     name: "DT xG3 v1",
//     mod_type: "Magnet",
//     install_method: "Injectable",
//     form_factor: "x-series",
//   },
//   "DT xG3 v2": {
//     name: "DT xG3 v2",
//     mod_type: "Magnet",
//     install_method: "Injectable",
//     form_factor: "x-series",
//   },
//   "DT TiTAN": {
//     name: "DT TiTAN",
//     install_method: "Scalpel",
//     form_factor: "other",
//     mod_type: "Magnet",
//   },
//   "VivoKey Apex Flex": {
//     name: "VivoKey Apex Flex",
//     chip: [new FidesmoP71()],
//     install_method: "Needle",
//     form_factor: "flex",
//     mod_type: "Chip",
//   },
// };
//
// /**
//  * Our global map of all Mod objects: product name => single Mod instance
//  */
// export const ALL_MODS: Record<string, Mod> = {};
//
// /**
//  * Build the global Mod objects once.
//  * In a real app, you might call this at startup or simply run it inline.
//  */
// function buildGlobalModMap(): void {
//   for (const [productName, meta] of Object.entries(PRODUCT_METADATA)) {
//     ALL_MODS[productName] = new Mod(meta);
//   }
// }
//
// // Run the builder once (you could also do this in your main entry point).
// buildGlobalModMap();

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
