import { FeatureSupportedInterface, FeatureType, ModType } from "~/models/mod";

export type Frequency = "13.56 MHz" | "125 kHz" | "134 kHz";
export type ChipUID = "4B" | "7B" | "8B" | "26b" | "37b" | "40b" | "64b";
export type ISOStandards =
  | "14443a"
  | "14443b"
  | "15693"
  | "11784"
  | "11785"
  | "7816"
  | "18000-3";

export const FREQ_MAP: Record<string, string> = {
  "13.56 MHz": "hf",
  "125 kHz": "lf",
  "134 kHz": "lf",
};

export interface ChipCryptographicInteface extends FeatureSupportedInterface {
  auth_methods?: string[];
  encryption_algorithms?: string[];
  secure_messaging?: boolean;
  signature_support?: boolean;
  key_management?: "N/A" | "Static" | "Dynamic diversified keys";
  clone_protection?: boolean;
}

export interface JCOPInterface extends FeatureSupportedInterface {
  version?: string;
}

export interface NDEFInterface extends FeatureSupportedInterface {
  capacity?: string;
}

export interface MagicInterface extends FeatureSupportedInterface {
  invoked_by?: ("wake up" | "direct write")[];
  chips?: ChipInterface[];
}

export interface PaymentInterface extends FeatureSupportedInterface {
  enabled?: boolean;
}

export interface ChipFeaturesInterface {
  payment: PaymentInterface;
  ndef: NDEFInterface;
  power_harvesting: FeatureType;
  jcop: JCOPInterface;
  temperature: FeatureType;
  spark: FeatureType;
  cryptographic: ChipCryptographicInteface;
  iso: ISOStandards[];
  magic: MagicInterface;
}

export interface ChipInterface {
  name: string;
  uid_length: ChipUID[];
  frequency: Frequency[];
  features: ChipFeaturesInterface;
}

export class Chip implements ChipInterface {
  protected _name: string;
  protected _uid_length: ChipUID[];
  protected _frequency: Frequency[];
  protected _features: ChipFeaturesInterface;

  constructor(
    name: string,
    uidLength: ChipUID[] | ChipUID,
    frequency: Frequency[] | Frequency,
    features?: Partial<ChipFeaturesInterface>,
  ) {
    this._name = name;
    this._uid_length = Array.isArray(uidLength) ? uidLength : [uidLength];
    this._frequency = Array.isArray(frequency) ? frequency : [frequency];

    this._features = {
      iso: [],
      payment: { supported: false },
      ndef: { supported: false },
      power_harvesting: { supported: false },
      jcop: { supported: false },
      temperature: { supported: false },
      spark: { supported: false },
      cryptographic: { supported: false },
      magic: { supported: false },
      ...features, // Override defaults with provided values
    };
  }

  public get name(): string {
    return this._name;
  }

  public get uid_length(): ChipUID[] {
    return this._uid_length;
  }

  public get frequency(): Frequency[] {
    return this.magic.supported
      ? (this.magic.chips
          ?.map((c) => c.frequency)
          .flat(Infinity) as Frequency[])
      : this._frequency;
  }

  public get features(): ChipFeaturesInterface {
    return this._features;
  }

  public get magic(): MagicInterface {
    return this._features.magic;
  }
}

// TODO: Refactor these to be less dumb--as I did in chip_implant

/****************************************/
/* LF Chips                             */
/****************************************/

export class USPetChip extends Chip implements ChipInterface {
  constructor() {
    super("US Pet Chip", "64b", "134 kHz", { iso: ["11784", "11785"] });
  }
}

export class DestronFearing extends Chip implements ChipInterface {
  constructor() {
    super("Destron Fearing", "64b", "134 kHz", {
      iso: ["11784", "11785"],
      temperature: { supported: true },
    });
  }
}

export class EM410x extends Chip implements ChipInterface {
  constructor() {
    super("EM410x", "64b", "134 kHz");
  }
}

export class HIDProx extends Chip implements ChipInterface {
  constructor() {
    super("HIDProx", "64b", "134 kHz");
  }
}

export class AWID extends Chip implements ChipInterface {
  constructor() {
    super("AWID", "64b", "134 kHz");
  }
}

export class Hitag2048 extends Chip implements ChipInterface {
  constructor() {
    super("Hitag 2048", ["64b"], ["125 kHz"], {
      cryptographic: {
        supported: true,
        auth_methods: ["Proprietary"],
        encryption_algorithms: ["Proprietary"],
        secure_messaging: false,
        signature_support: false,
        key_management: "Static",
        clone_protection: true,
      },
    });
  }
}

export class Indala extends Chip implements ChipInterface {
  constructor() {
    super("Indala", "26b", "125 kHz");
  }
}

export class Keri extends Chip implements ChipInterface {
  constructor() {
    super("Keri", "26b", "125 kHz");
  }
}

export class T5577 extends Chip implements ChipInterface {
  constructor() {
    super("T5577", [], []);
    this._name = "T5577";
    this._features.magic.supported = true;
    this._features.magic.invoked_by = ["wake up"];
    this._features.magic.chips = [
      new EM410x(),
      new HIDProx(),
      new AWID(),
      new Indala(),
      new Keri(),
      new USPetChip(),
    ];
  }
}

// NFC Chips

// ISO 14443

export class NTAG216 extends Chip implements ChipInterface {
  constructor() {
    super("NTAG216", "7B", "13.56 MHz", {
      ndef: { supported: true, capacity: "888 B" },
    });
  }
}

export class NTAGI2C extends Chip implements ChipInterface {
  constructor() {
    super("NTAGI2C", "7B", "13.56 MHz", {
      ndef: { supported: true, capacity: "1 kB" },
      iso: ["14443a"],
      power_harvesting: { supported: true },
    });
  }
}

export class P71 extends Chip implements ChipInterface {
  constructor(name: string = "P71", features?: Partial<ChipFeaturesInterface>) {
    super(name, "7B", "13.56 MHz", {
      ndef: { supported: true, capacity: "32 kB" },
      jcop: { supported: true, version: "3.0.5" },
      iso: ["14443a", "7816"],
      cryptographic: {
        supported: true,
        auth_methods: [
          "Proprietary",
          "Secure Channel Protocol",
          "UserID Session",
        ],
        encryption_algorithms: ["Proprietary", "RSA", "ECC", "AES", "3DES"],
        secure_messaging: true,
        signature_support: true,
        key_management: "Dynamic diversified keys",
        clone_protection: true,
      },
      ...features,
    });
  }
}

export class FidesmoP71 extends P71 {
  constructor() {
    super("Fidesmo P71", {
      spark: { supported: true },
      payment: { supported: true, enabled: false },
    });
  }
}

export class MIFAREClassic4B extends Chip implements ChipInterface {
  constructor() {
    super("MIFARE Classic (4-byte NUID)", "4B", "13.56 MHz", {
      iso: ["14443a"],
    });
  }
}

export class MIFAREClassic7B extends Chip implements ChipInterface {
  constructor() {
    super("MIFARE Classic (7-byte UID)", "7B", "13.56 MHz", {
      iso: ["14443a"],
    });
  }
}

export class DESFireEV1 extends Chip implements ChipInterface {
  constructor(ev: string = "1", features?: Partial<ChipFeaturesInterface>) {
    super(`MIFARE DESFire EV${ev}`, "7B", "13.56 MHz", {
      iso: ["14443a", "7816"],
      ndef: { supported: true, capacity: "8 kB" },
      cryptographic: {
        supported: true,
        auth_methods: ["DES", "2K3DES", "3K3DES", "AES"],
        encryption_algorithms: ["DES", "3DES", "AES"],
        secure_messaging: true,
        signature_support: false,
        key_management: "Dynamic diversified keys",
        clone_protection: true,
      },
      ...features,
    });
  }
}

export class DESFireEV2 extends DESFireEV1 implements ChipInterface {
  constructor() {
    super("2");
  }
}

export class DESFireEV3 extends DESFireEV1 implements ChipInterface {
  constructor() {
    super("3");
  }
}

// ISO 15693 Chips

export class ICODESLIX2 extends Chip {
  constructor() {
    super("ICODE SLIX2", "8B", "13.56 MHz", {
      ndef: { supported: true, capacity: "320 B" },
      iso: ["15693", "18000-3"],
    });
  }
}

export class ICODEDNA extends Chip {
  constructor(spark: boolean = true) {
    super("ICODE DNA", "8B", "13.56 MHz", {
      ndef: { supported: !spark },
      cryptographic: {
        supported: true,
        auth_methods: ["AES mutual authentication"],
        encryption_algorithms: ["AES-128"],
        secure_messaging: true,
        signature_support: true,
        key_management: "Dynamic diversified keys",
        clone_protection: true,
      },
      iso: ["15693", "18000-3"],
      spark: { supported: spark },
    });
  }
}

// Chinesium Magic Chips

export class UltimateGen4 extends Chip implements ChipInterface {
  constructor() {
    super("Ultimate Gen4", [], [], {
      magic: {
        supported: true,
        invoked_by: ["wake up", "direct write"],
        chips: [
          new NTAG216(),
          new NTAGI2C(),
          new MIFAREClassic4B(),
          new MIFAREClassic7B(),
        ],
      },
    });
  }
}

export class MagicMIFAREg1a extends Chip implements ChipInterface {
  constructor() {
    super("Magic MIFARE Classic gen1a", [], [], {
      magic: {
        supported: true,
        invoked_by: ["wake up"],
        chips: [new MIFAREClassic4B()],
      },
    });
  }
}

// Generic

export class PaymentChip extends Chip implements ChipInterface {
  constructor() {
    super("Payment Chip", [], ["13.56 MHz"], {
      payment: { supported: true, enabled: true },
      iso: ["14443a", "7816"],
    });
  }
}

export const CHIP_MAP = {
  // LF Chips
  T5577: () =>
    new Chip("T5577", [], [], {
      magic: {
        supported: true,
        invoked_by: ["wake up"],
        chips: [
          new EM410x(),
          new HIDProx(),
          new AWID(),
          new Indala(),
          new Keri(),
          new USPetChip(),
        ],
      },
    }),

  // HF Chips
  "Magic MIFARE Classic G2": () =>
    new Chip("Magic MIFARE Classic G2", [], [], {
      magic: {
        supported: true,
        chips: [new MIFAREClassic4B()],
        invoked_by: ["wake up"],
      },
    }),
};

export interface ModMetadata {
  /** e.g., "DT NExT" */
  name: string;
  /** etc. for all boolean properties... */
  mod_type: ModType;
  /** "Injectable", "Needle", "Scalpel", or "Unknown" */
  install_method?: string;
  /** "flex", "x-series", "other", or "Unknown" */
}
