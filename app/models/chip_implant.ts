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
  PaymentInterface,
  NTAG5Boost,
  T5577,
} from "~/models/chip";

export type ChipImplantType = "Chip" | "xLED";
export type ChipImplantInstallationMethodType =
  | "Injection"
  | "4g Needle"
  | "Scalpel";
export type FormFactorType = "x-Series" | "flex";

export type BlinkColors = "red" | "green" | "blue" | "white" | "amber";
export interface BlinkType extends FeatureSupportedInterface {
  type?: "HF" | "LF";
  available_colors?: BlinkColors[];
  color?: BlinkColors;
}

export interface SensorInterface extends FeatureSupportedInterface {
  temperature?: boolean;
  pulse_ox?: boolean;
}

export type ChipImplantFeaturesType = {
  smartphone: FeatureSupportedInterface;
  legacy_access_control: FeatureSupportedInterface;
  digital_security: FeatureSupportedInterface;
  blink: BlinkType;
  cryptography: ChipCryptographicInteface;
  ndef: NDEFInterface;
  data_sharing: FeatureSupportedInterface;
  spark: FeatureSupportedInterface;
  jcop: JCOPInterface;
  sensors: SensorInterface;
  payment: PaymentInterface;
  magic: MagicInterface;
};

export type ChipImplantDetailsType = {
  smartphone: string[]; // 14443a, 14443b, 15693
  legacy_access_control: {};
  digital_security: {
    jcop: JCOPInterface;
  };
  cryptography: ChipCryptographicInteface;
  data_sharing: {
    spark: boolean;
    ndef: NDEFInterface;
  };
  sensors: {
    temperature?: boolean;
    pulse_ox?: boolean;
  };
  magic: MagicInterface;
  payment: PaymentInterface;
};

export interface ChipImplantInterface extends ModInterface {
  mod_type: ChipImplantType;
  frequency: string[];
  uid_length: string[];
  chip: ChipInterface[];
  form_factor: FormFactorType;
  install_method: ChipImplantInstallationMethodType;
  features: Partial<ChipImplantFeaturesType>;
  first_offered: number;
}

export class ChipImplant extends Mod implements ChipImplantInterface {
  readonly chip: ChipInterface[];
  readonly form_factor: FormFactorType;

  constructor(meta: Partial<ChipImplantInterface>) {
    const {
      name,
      mod_type,
      chip,
      install_method,
      form_factor,
      features,
      description,
      first_offered,
    } = meta;

    if (!name) {
      throw new Error("Chip Implant name required");
    }

    super(
      {
        name,
        mod_type: mod_type ?? "Chip",
        install_method: (install_method ?? "Injection") as string,
        description: (description as string | undefined) ?? "",
        first_offered: first_offered,
      },
      {
        blink: { supported: false },
        cryptography: { supported: false },
        ndef: { supported: false },
        spark: { supported: false },
        jcop: { supported: false },
        // temperature: { supported: false },
        // pulse_ox: { supported: false },
        sensors: { supported: false, temperature: false, pulse_ox: false },

        ...(features ?? {}),
      } as ChipImplantFeaturesType,
    );

    this.chip = chip ?? [];
    this.form_factor = form_factor ?? "x-Series";

    this.chip.forEach((c) => {
      Object.keys(c.features).forEach((key) => {
        // @ts-expect-error
        if (c?.features[key]?.supported) {
          // @ts-expect-error
          this._features[key] = { ...this._features[key], ...c.features[key] };
        }
      });
    });
    if (this._features.ndef.supported || this._features.spark.supported) {
      this._features.data_sharing = { supported: true };
    }
  }

  get uid_length(): string[] {
    return [];
  }

  // @ts-expect-error Override is intentional
  get mod_type(): ChipImplantType {
    // @ts-expect-error Override is intentional
    return "";
  }

  // @ts-expect-error Override is intentional
  get install_method(): ChipImplantInstallationMethodType {
    // @ts-expect-error Override is intentional
    return {};
  }

  get features(): ChipImplantFeaturesType {
    let smartphone = false;
    let legacyAccessControl = false;
    if (this.summary_frequency) {
      smartphone = ["HF", "Dual"].includes(this.summary_frequency["value"]);
      legacyAccessControl = this.frequency.includes("125 kHz");
    }
    return {
      smartphone: {
        supported: smartphone,
      },
      legacy_access_control: {
        supported: legacyAccessControl,
      },
      digital_security: (this._features.jcop as FeatureSupportedInterface) ?? {
        supported: false,
      },
      data_sharing: (this._features
        .data_sharing as FeatureSupportedInterface) ?? { supported: false },
      blink: (this._features.blink as FeatureSupportedInterface) ?? {
        supported: false,
      },
      cryptography: (this._features
        .cryptography as FeatureSupportedInterface) ?? { supported: false },
      ndef: (this._features.ndef as FeatureSupportedInterface) ?? {
        supported: false,
      },
      spark: (this._features.spark as FeatureSupportedInterface) ?? {
        supported: false,
      },
      jcop: (this._features.jcop as FeatureSupportedInterface) ?? {
        supported: false,
      },
      sensors: { ...this._features.sensors },
      payment: (this._features.payment as FeatureSupportedInterface) ?? {
        supported: false,
      },
      magic: (this._features.magic as MagicInterface) ?? { supported: false },
    };
  }

  get options() {
    return {
      smartphone: {
        iso: this.chip
          .filter((c) => c.frequency.includes("13.56 MHz"))
          .map((c) => c.features.iso)
          .flat(),
      },
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
      .filter((c) => c.features.cryptography.supported)
      .map((c) => c.features.cryptography);
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
    return [...new Set(this.chip.map((c) => c.frequency).flat())];
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

  get temperature(): FeatureSupportedInterface | null {
    const chipFeature = {
      supported: this.features.sensors.temperature ?? false,
    };

    return chipFeature;
  }

  get summary_sensors(): SummaryLine | null {
    if (this.features.sensors.supported) {
      if (this.features.sensors.temperature && this.features.sensors.pulse_ox) {
        return {
          feature: "Sensors",
          value: "Has pulse ox and temperature sensors",
        };
      } else if (this.features.sensors.temperature) {
        return {
          feature: "Sensors",
          value: "Has a temperature sensor",
        };
      } else if (this.features.sensors.pulse_ox) {
        return {
          feature: "Sensors",
          value: "Has a pulse oximetry sensor",
        };
      } else {
        return null;
      }
    } else if (this.temperature?.supported) {
      return { feature: "Sensors", value: "Has temperature sensor" };
    } else {
      return null;
    }
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
      this.summary_cryptography,
      this.summary_magic,
      this.summary_payment,
      this.summary_sensors,
    ];

    features.forEach((feature) => {
      const data = feature;
      if (data) {
        lines.push(data);
      }
    });

    return lines;
  }

  get details(): ChipImplantDetailsType {
    // const isos = [...new Set(this.chip.map((c) => c.features.iso).flat())];
    const smartphoneDetails: any = {
      chip: this.chip
        .filter((c) => c.frequency.includes("13.56 MHz"))
        .map((c) => c.name),
      iso: [],
    };
    const hfISOs = ["14443a-3", "14443a-4", "14443b-3", "15693"];
    this.chip.forEach((c) => {
      c.features.iso.forEach((iso) => {
        if (hfISOs.includes(iso)) {
          smartphoneDetails["iso"].push(iso);
        }
      });
    });

    const serializedDetails = {
      smartphone: smartphoneDetails.chip
        ? smartphoneDetails
        : { supported: false },
      legacy_access_control: {
        chip:
          this.chip.find((chip) => chip.frequency.some((f) => f === "125 kHz"))
            ?.name ?? null,
      },
      digital_security: { jcop: { ...this.features.jcop } },
      cryptography: { ...this.features.cryptography },
      data_sharing: {
        spark: this.features.spark.supported,
        ndef: { ...this.features.ndef },
      },
      magic: {},
      blink: { ...this.features.blink },
      sensors: { ...this.features.sensors },
      payment: { ...this.features.payment },
    };

    this.chip.forEach((chip) => {
      if (chip.features.magic.supported) {
        serializedDetails.magic = {
          ...serializedDetails.magic,
          [chip.name]: { ...chip.features.magic },
        };
      }
    });

    // Object.keys(serializedDetails).forEach((key) => {
    //   if (serializedDetails[key].hasOwnProperty("supported")) {
    //     delete serializedDetails[key]["supported"];
    //   }
    // });

    return serializedDetails;
  }
}

export const CHIP_IMPLANT_MAP: Record<string, () => ModInterface> = {
  // TODO: FlexClass
  FlexClass: () =>
    new ChipImplant({
      name: "FlexClass",
      chip: [],
      description:
        "The FlexClass is only option for iClass credentials. It relies on the legacy PicoPass chip.",
    }),
  "DT flexEM": () =>
    new ChipImplant({
      name: "DT flexEM",
      chip: [CHIP_MAP["T5577"]()],
      install_method: "Scalpel",
      form_factor: "flex",
      description:
        "The flexEM is disc of wound enamel wire around a t5577. The undisputed king of LF range in the implant world.",
    }),
  "DT flexDF": () =>
    new ChipImplant({
      name: "DT flexDF",
      chip: [new DESFireEV1()],
      install_method: "4g Needle",
      description:
        "The first flex DESFire offering was an EV1 with 8 kB of storage.",
    }),
  "DT flexDF2": () =>
    new ChipImplant({
      name: "DT flexDF2",
      chip: [new DESFireEV2()],
      install_method: "4g Needle",
      description: "DESFire EV2 in a narrow flex with 8 kB of storage.",
    }),
  "DT flexM1 G1a": () =>
    new ChipImplant({
      name: "DT flexM1 G1a",
      chip: [new MagicMIFAREg1a()],
      install_method: "4g Needle",
      form_factor: "flex",
      description:
        "A flex format magic MIFARE gen1a. It can have 4-byte MIFARE Classic 1k credentials cloned to it using magic backdoor commands.",
    }),
  "DT flexM1 G2": () =>
    new ChipImplant({
      name: "DT flexM1 G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"]()],
      install_method: "4g Needle",
      form_factor: "flex",
      description:
        "A flex format magic MIFARE gen2. It can have 4-byte MIFARE Classic 1k credentials to it using direct write.",
    }),
  "DT flexNT": () =>
    new ChipImplant({
      name: "DT flexNT",
      chip: [new NTAG216()],
      install_method: "Scalpel",
      form_factor: "flex",
      description: "DT's first flex offering: a high performance NTAG216.",
    }),
  "DT flexSecure": () =>
    new ChipImplant({
      name: "DT flexSecure",
      chip: [new P71()],
      install_method: "4g Needle",
      form_factor: "flex",
      mod_type: "Chip",
      description: "A factory open smart card implant that uses NXP's P71.",
    }),
  "DT flexUG4": () =>
    new ChipImplant({
      name: "DT flexUG4",
      chip: [new UltimateGen4()],
      install_method: "4g Needle",
      form_factor: "flex",
      mod_type: "Chip",
      description:
        "The Ultimate gen4 in an implant. It's capable of emulating a large number of HF transponders.",
    }),
  "DT Payment Conversion": () =>
    new ChipImplant({
      name: "DT Payment Conversion",
      chip: [new PaymentChip()],
      form_factor: "flex",
      install_method: "4g Needle",
      mod_type: "Chip",
      description:
        "A payment device converted to an implant. These come in a variety of flavors and formats.",
    }),
  "DT NExT": () =>
    new ChipImplant({
      name: "DT NExT",
      chip: [new NTAG216(), new T5577()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      description:
        "DT's first dual-frequency implant! This offers all features of the NTAG216 (data sharing, limited access control compatibility) with a T5577 to allow low frequency transponder emulation!",
    }),
  "DT xBT": () =>
    new ChipImplant({
      name: "DT xBT",
      chip: [new DestronFearing()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      features: {
        sensors: { supported: true, temperature: true },
      },
      description:
        "This 134 kHz implant features a temperature sensor. It can be read with Halo readers, a Flipper Zero, or a Proxmark.",
    }),
  "DT xEM": () =>
    new ChipImplant({
      name: "DT xEM",
      chip: [CHIP_MAP["T5577"]()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      description:
        "DT's first 'magic' offering featuring the versatile t5577, capable of emulating nearly all LF transponders.",
    }),
  "DT xLED HF": () =>
    new ChipImplant({
      name: "DT xLED HF",
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "xLED",
      features: {
        blink: {
          supported: true,
          type: "HF",
          available_colors: ["red", "green", "blue", "white"],
        },
      },
      description:
        "The HF version of the OG blink was brought by the chipless xLED. Originally toted as an in vivo field detector.",
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
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "xLED",
      description:
        "The LF version of the OG blink was brought by the chipless xLED. Originally toted as an in vivo field detector.",
    }),
  "DT xHT": () =>
    new ChipImplant({
      name: "DT xHT",
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      chip: [new HitagS2048()],
      description:
        "The HITAG2048 is one of the few secure options in the LF world.",
    }),
  "DT xM1+": () =>
    new ChipImplant({
      name: "DT xM1+",
      chip: [new MagicMIFAREg1a()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      description:
        "The first magic HF offering of DT. It uses a gen1 magic MIFARE Classic 1k chip.",
    }),
  "DT xM1 G2": () =>
    new ChipImplant({
      name: "DT xM1 G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"]()],
      description: "",
    }),
  "DT xMagic G1a": () =>
    new ChipImplant({
      name: "DT xMagic G1a",
      chip: [new MagicMIFAREg1a(), CHIP_MAP["T5577"]()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xMagic G2": () =>
    new ChipImplant({
      name: "DT xMagic G2",
      chip: [CHIP_MAP["Magic MIFARE Classic G2"](), CHIP_MAP["T5577"]()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
    }),
  "DT xNT": () =>
    new ChipImplant({
      name: "DT xNT",
      chip: [new NTAG216()],
      install_method: "Injection",
      form_factor: "x-Series",
      mod_type: "Chip",
      first_offered: 2013,
    }),
  "DT xSIID": () =>
    new ChipImplant({
      name: "DT xSIID",
      chip: [new NTAGI2C()],
      mod_type: "Chip",
      install_method: "Injection",
      form_factor: "x-Series",
      features: {
        blink: {
          supported: true,
          type: "HF",
          available_colors: ["red", "green", "blue", "white", "amber"],
        },
      },
      first_offered: 2019,
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
      description:
        "The long awaited Apex is a smartcard that runs JCOP. It can install various JavaCard applets most of which are geared around digital security.",
      first_offered: 2021,
    }),
  "VivoKey Apex Mega": () =>
    new ChipImplant({
      name: "VivoKey Apex Mega",
      chip: [new FidesmoP71()],
      install_method: "Scalpel",
      form_factor: "flex",
      mod_type: "Chip",
      first_offered: 2021,
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
  "DT NExT v2": () =>
    new ChipImplant({
      name: "DT NExT v2",
      chip: [new NTAGI2C(), CHIP_MAP["T5577"]()],
      features: {
        blink: {
          type: "HF",
          supported: true,
          available_colors: ["green", "blue", "white"],
        },
      },
      description:
        "The successor to DT's first dual-frequency implant has all the same features of the NExT with the addition of an LED.",
      first_offered: 2025,
    }),
  "VivoKey Thermo": () =>
    new ChipImplant({
      name: "VivoKey Thermo",
      chip: [new NTAG5Boost([])],
      features: {
        sensors: {
          supported: true,
          temperature: true,
        },
      },
      description: "Coming Soon™",
    }),
  "VivoKey Pulse": () =>
    new ChipImplant({
      name: "VivoKey Pulse",
      chip: [new NTAG5Boost([])],
      features: {
        sensors: {
          supported: true,
          pulse: true,
          temperature: true,
        },
      },
      description: "Coming Soon™",
    }),
};
