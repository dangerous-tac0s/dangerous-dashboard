import {
  FeatureSupportedInterface,
  FeatureType,
  Mod,
  ModInterface,
  SummaryLine,
} from "./mod";
import {
  ChipCryptographicInteface,
  ChipInterface,
  DESFireEV1,
  DESFireEV2,
  DESFireEV3,
  DestronFearing,
  FidesmoP71,
  FREQ_MAP,
  ICODEDNA,
  ICODESLIX2,
  MagicMIFAREg1a,
  NDEFInterface,
  NTAG216,
  NTAGI2C,
  P71,
  PaymentChip,
  UltimateGen4,
  CHIP_MAP,
  MagicInterface,
  JCOPInterface,
  HitagS2048,
  NTAG413DNA,
} from "~/models/chip";

export type ChipImplantType = "Chip" | "xLED";
export type ChipImplantInstallationMethodType =
  | "Injectable"
  | "4g Needle"
  | "Scalpel";
export type FormFactorType = "x-Series" | "flex";

export type BlinkColors = "red" | "green" | "blue" | "white" | "amber";
export interface BlinkType extends FeatureSupportedInterface {
  type?: "HF" | "LF";
  available_colors?: BlinkColors[];
  color?: BlinkColors;
}

export type ChipImplantFeaturesType = {
  smartphone: FeatureSupportedInterface;
  legeacy_access_control: FeatureSupportedInterface;
  blink: BlinkType;
  cryptography: ChipCryptographicInteface;
  ndef: NDEFInterface;
  jcop: JCOPInterface;
  temperature: FeatureSupportedInterface;
};

export interface ChipImplantInterface extends ModInterface {
  mod_type: ChipImplantType;
  frequency: string[];
  uid_length: string[];
  chip: ChipInterface[];
  form_factor: FormFactorType;
  install_method: ChipImplantInstallationMethodType;
  features: Partial<ChipImplantFeaturesType>;
}

export class ChipImplant extends Mod implements ChipImplantInterface {
  readonly chip: ChipInterface[];
  readonly form_factor: FormFactorType;

  constructor(meta: Partial<ChipImplantInterface>) {
    const { name, mod_type, chip, install_method, form_factor, features } =
      meta;

    if (!name) {
      throw new Error("Chip Implant name required");
    }

    super(
      {
        name,
        mod_type: mod_type ?? "Chip",
        install_method: (install_method ?? "Injectable") as string,
      },
      {
        blink: { supported: false },
        cryptography: { supported: false },
        ndef: { supported: false },
        jcop: { supported: false },
        temperature: { supported: false },

        ...(features ?? {}),
      } as ChipImplantFeaturesType,
    );

    this.chip = chip ?? [];
    this.form_factor = form_factor ?? "x-Series";

    this.chip.forEach((c) => {
      Object.keys(c.features).forEach((key) => {
        if (c?.features[key]?.supported) {
          this._features[key] = { ...this._features[key], ...c.features[key] };
        }
      });
    });
  }

  get uid_length(): string[] {
    return [];
  }

  // @ts-expect-error Override is intentional
  get mod_type(): ChipImplantType {
    return this.mod_type;
  }

  // @ts-expect-error Override is intentional
  get install_method(): ChipImplantInstallationMethodType {
    return this.install_method;
  }

  get features(): ChipImplantFeaturesType {
    let smartphone = false;
    let legacyAccessControl = false;
    if (this.summary_frequency) {
      smartphone = ["HF", "Dual"].includes(this.summary_frequency["value"]);
      legacyAccessControl = ["LF", "Dual"].includes(
        this.summary_frequency["value"],
      );
    }
    return {
      smartphone: {
        supported: smartphone,
      },
      legacy_access_control: {
        supported: legacyAccessControl,
      },
      digital_security: { ...this._features.jcop } ?? { supported: false },
      data_sharing: {
        supported:
          this._features?.ndef?.supported || this._features?.spark?.supported,
      },
      blink: { ...this._features.blink },
      cryptography: { ...this._features.cryptography } ?? { supported: false },
      ndef: { ...this._features.ndef } ?? { supported: false },
      jcop: { ...this._features.jcop } ?? { supported: false },
      temperature: { ...this._features.temperature },
      payment: { ...this._features.payment },
      magic: { ...this._features.magic },
    };
  }

  get summary_blink(): SummaryLine | null {
    if (this.features.blink.supported) {
      return {
        feature: "Blink",
        value:
          this.chip.length === 2
            ? (this.chip.find((c) => c.features.power_harvesting)
                ?.name as string)
            : "Yes",
      };
    }
    return null;
  }

  get cryptography(): ChipCryptographicInteface[] {
    return this.chip
      .filter((c) => c.features.cryptographic.supported)
      .map((c) => c.features.cryptographic);
  }

  get summary_cryptography(): SummaryLine | null {
    if (this.cryptography.length > 0) {
      return {
        feature: "Cryptography",
        value: this.cryptography.length > 0 ? "Yes" : "No",
      };
    }
    return null;
  }

  get frequency() {
    return this.chip.map((c) => c.frequency).flat();
  }

  get summary_frequency(): SummaryLine | null {
    const freqs = { hf: false, lf: false };
    this.frequency.forEach((f) => {
      freqs[FREQ_MAP[f] as "hf" | "lf"] = true;
    });
    const summary = { feature: "Frequency", value: "" };

    if (freqs["lf"] && !freqs["hf"]) {
      summary["value"] = "LF";
    }
    if (freqs["hf"] && !freqs["lf"]) {
      summary["value"] = "HF";
    }
    if (freqs["hf"] && freqs["lf"]) {
      summary["value"] = "Dual";
    }
    return summary.value.length > 0 ? summary : null;
  }

  get ndef(): NDEFInterface[] {
    return this.chip
      .filter((c) => c.features.ndef.supported)
      .map((c) => c.features.ndef);
  }

  get summary_data_sharing(): SummaryLine | null {
    if (
      this.ndef.length > 0 ||
      this.chip.find((c) => c.features.spark.supported)
    ) {
      const rows: string[] = [];
      this.chip.forEach((c) => {
        if (c.features.spark.supported) {
          rows.push("Spark");
        }
        if (c.features.ndef.supported) {
          rows.push(c.features.ndef.capacity ?? ("Yes" as string));
        }
      });
      rows.sort();

      return {
        feature: "Data Sharing",
        value: (rows.length === 1
          ? rows[0]
          : `${rows[0]} / ${rows[1]}`) as string,
      };
    }

    return null;
  }

  get summary_digital_security(): SummaryLine | null {
    if (this.chip.some((c) => c.features.jcop.supported)) {
      return { feature: "Digital Security", value: "Yes" };
    }
    return null;
  }

  get magic(): MagicInterface[] | null {
    const magic = this.chip
      .filter((c) => c.features.magic.supported)
      .map((c) => c.features.magic);
    return magic.length > 0 ? magic : null;
  }

  get summary_magic(): SummaryLine | null {
    if (!this.magic) {
      return null;
    }
    const magic: {
      hf: ChipInterface[];
      lf: ChipInterface[];
    } = { hf: [], lf: [] };

    this.magic?.forEach((m) => {
      if (Array.isArray(m.chips)) {
        m.chips.forEach((c) => {
          c.frequency.forEach((f) => {
            magic[FREQ_MAP[f] as "hf" | "lf"].push(c);
          });
        });
      }
    });

    const summary: { hf: string; lf: string } = { lf: "", hf: "" };

    Object.keys(magic).forEach((k) => {
      // @ts-expect-error Key is either "hf" or "lf"
      if (magic[k].length === 1) {
        // @ts-expect-error Key is either "hf" or "lf"
        summary[k] = magic[k][0].name;
        // @ts-expect-error Key is either "hf" or "lf"
      } else if (magic[k].length > 1) {
        // @ts-expect-error Key is either "hf" or "lf"
        summary[k] = "Many";
      }
    });

    if (magic["hf"].length > 0 && summary["lf"] === summary["hf"]) {
      return { feature: "Magic", value: "Many LF and HF" };
    }

    if (magic["lf"].length > 0 && magic["hf"].length > 0) {
      return {
        feature: "Magic",
        value: `${summary["lf"]} LF,\n ${summary["hf"]} HF`,
      };
    }
    if (this.chip.length > 1 && magic["lf"].length > 0) {
      summary["lf"] += " LF";
    }
    if (this.chip.length > 1 && summary["hf"].length > 0) {
      summary["hf"] += " HF";
    }
    return {
      feature: "Magic",
      value: magic["lf"].length > 0 ? summary["lf"] : summary["hf"],
    };
  }

  get summary_payment(): SummaryLine | null {
    const payment = { supported: false, enabled: false };
    this.chip.forEach((c) => {
      if (c.features.payment.supported) {
        payment["supported"] = true;
        if (c.features.payment.enabled) {
          payment["enabled"] = true;
        }
      }
    });
    if (!payment.supported) {
      return null;
    }

    return { feature: "Payment", value: payment.enabled ? "Yes" : "Disabled" };
  }

  get temperature(): FeatureType | null {
    return (
      this.chip.find((c) => c.features.temperature.supported)?.features
        .temperature ?? null
    );
  }

  // TODO: Add other things from the legend... Currently, smartphone/legacy access control is inferred from frequency...
  //  Which is imperfect because of pet chips
  get summary(): SummaryLine[] {
    const lines: SummaryLine[] = [];

    const features: (SummaryLine | null)[] = [
      this.summary_frequency,
      this.summary_data_sharing,
      this.summary_blink,
      this.summary_digital_security,
      this.summary_magic,
      this.summary_payment,
      this.temperature ? { feature: "Temperature", value: "Yes" } : null,
      this.summary_cryptography,
    ];

    features.forEach((feature) => {
      const data = feature;
      if (data) {
        lines.push(data);
      }
    });

    return lines;
  }
}

export const CHIP_IMPLANT_MAP: Record<string, () => ModInterface> = {
  // TODO: FlexClass
  FlexClass: () =>
    new ChipImplant({
      name: "FlexClass",
      chip: [],
    }),
  "DT flexEM": () =>
    new ChipImplant({
      name: "DT flexEM",
      chip: [CHIP_MAP["T5577"]()],
      install_method: "Scalpel",
      form_factor: "flex",
    }),
  "DT flexDF": () =>
    new ChipImplant({
      name: "DT flexDF",
      chip: [new DESFireEV1()],
      install_method: "4g Needle",
    }),
  "DT flexDF2": () =>
    new ChipImplant({
      name: "DT flexDF2",
      chip: [new DESFireEV2()],
      install_method: "4g Needle",
    }),
  "DT flexM1 G1a": () =>
    new ChipImplant({
      name: "DT flexM1 G1a",
      chip: [new MagicMIFAREg1a()],
      install_method: "4g Needle",
      form_factor: "flex",
    }),
  "DT flexM1 G2": () =>
    new ChipImplant({
      name: "DT flexM1 G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"]()],
      install_method: "4g Needle",
      form_factor: "flex",
    }),
  "DT flexNT": () =>
    new ChipImplant({
      name: "DT flexNT",
      chip: [new NTAG216()],
      install_method: "Scalpel",
      form_factor: "flex",
    }),
  "DT flexSecure": () =>
    new ChipImplant({
      name: "DT flexSecure",
      chip: [new P71()],
      install_method: "4g Needle",
      form_factor: "flex",
      mod_type: "Chip",
    }),
  "DT flexUG4": () =>
    new ChipImplant({
      name: "DT flexUG4",
      chip: [new UltimateGen4()],
      install_method: "4g Needle",
      form_factor: "flex",
      mod_type: "Chip",
    }),
  "DT Payment Conversion": () =>
    new ChipImplant({
      name: "DT Payment Conversion",
      chip: [new PaymentChip()],
      form_factor: "flex",
      mod_type: "Chip",
    }),
  "DT NExT": () =>
    new ChipImplant({
      name: "DT NExT",
      chip: [new NTAG216(), CHIP_MAP["T5577"]()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xBT": () =>
    new ChipImplant({
      name: "DT xBT",
      chip: [new DestronFearing()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xEM": () =>
    new ChipImplant({
      name: "DT xEM",
      chip: [CHIP_MAP["T5577"]()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xLED HF": () =>
    new ChipImplant({
      name: "DT xLED HF",
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "xLED",
      features: {
        blink: {
          supported: true,
          type: "HF",
          available_colors: ["red", "green", "blue", "white"],
        },
      },
    }),
  "DT xLED LF": () =>
    new ChipImplant({
      name: "DT xLED LF",
      features: {
        blink: {
          supported: true,
          type: "LF",
          available_colors: ["red", "green", "blue", "white"],
        },
      },
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "xLED",
    }),
  "DT xHT": () =>
    new ChipImplant({
      name: "DT xHT",
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
      chip: [new HitagS2048()],
    }),
  "DT xM1+": () =>
    new ChipImplant({
      name: "DT xM1+",
      chip: [new MagicMIFAREg1a()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xM1 G2": () =>
    new ChipImplant({
      name: "DT xM1 G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"]()],
    }),
  "DT xMagic G1a": () =>
    new ChipImplant({
      name: "DT xMagic G1a",
      chip: [new MagicMIFAREg1a(), CHIP_MAP["T5577"]()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xMagic G2": () =>
    new ChipImplant({
      name: "DT xMagic G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"](), CHIP_MAP["T5577"]()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xNT": () =>
    new ChipImplant({
      name: "DT xNT",
      chip: [new NTAG216()],
      install_method: "Injectable",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xSIID": () =>
    new ChipImplant({
      name: "DT xSIID",
      chip: [new NTAGI2C()],
      mod_type: "Chip",
      install_method: "Injectable",
      form_factor: "x-Series",
      features: {
        blink: {
          supported: true,
          type: "HF",
          available_colors: ["red", "green", "blue", "white", "amber"],
        },
      },
    }),
  "DT xSLX": () =>
    new ChipImplant({
      name: "DT xSLX",
      chip: [new ICODESLIX2()],
    }),
  "DT xDF": () =>
    new ChipImplant({
      name: "DT xDF",
      chip: [new DESFireEV1()],
    }),
  "DT xDF2": () =>
    new ChipImplant({
      name: "DT xDF2",
      chip: [new DESFireEV2()],
    }),
  "DT xDF3": () =>
    new ChipImplant({
      name: "DT xDF3",
      chip: [new DESFireEV3()],
    }),
  "VivoKey Apex Flex": () =>
    new ChipImplant({
      name: "VivoKey Apex Flex",
      chip: [new FidesmoP71()],
      install_method: "4g Needle",
      form_factor: "flex",
      mod_type: "Chip",
    }),
  "VivoKey Apex Mega": () =>
    new ChipImplant({
      name: "VivoKey Apex Mega",
      chip: [new FidesmoP71()],
      install_method: "Scalpel",
      form_factor: "flex",
      mod_type: "Chip",
    }),
  "VivoKey Spark1": () =>
    new ChipImplant({
      name: "VivoKey Spark1",
      chip: [new ICODEDNA()],
    }),
  // TODO: Spark2 Chip
  "VivoKey Spark2": () =>
    new ChipImplant({
      name: "VivoKey Spark2",
      chip: [new NTAG413DNA()],
    }),
};
