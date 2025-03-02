import { Mod, ModInterface, SummaryLine, numberToLocalizedNumber } from "~/models/mod";
import { Magnet, MagnetInterface } from "~/models/magnet";
export interface MagnetImplantFeaturesType {}

export interface MagnetEncapsulationInterface {
  type: "Unknown" | "Casing" | "Coating";
  material: string;
}

export interface MagnetImplantInterface extends ModInterface {
  readonly magnet: MagnetInterface[];
  readonly encapsulation: MagnetEncapsulationInterface;
  field_strength: string[];
}

export class MagnetImplant extends Mod implements MagnetImplantInterface {
  readonly magnet: MagnetInterface[];
  readonly encapsulation: {
    type: "Unknown" | "Casing" | "Coating";
    material: string;
  } = {
    type: "Unknown",
    material: "Unknown",
  };

  constructor(meta: Partial<MagnetImplantInterface>) {
    const { name, magnet = [], encapsulation = {} } = meta;
    if (!name) {
      throw new Error("Chip Implant name required");
    }
    super({
      name: name,
      mod_type: "Magnet",
    });

    this.encapsulation = {
      type: "Unknown",
      material: "Unknown",
      ...(encapsulation ?? {}),
    };
    this.magnet = Array.isArray(magnet) ? magnet : [magnet];
  }

  get field_strength(): string[] {
    return this.magnet.map((m) => m.field_strength);
  }

  get features(): Partial<MagnetImplantFeaturesType> {
    return {
      encapsulation: this.encapsulation,
      field_strength: this.field_strength,
      magnet: this.magnet,
    };
  }

  get summary_encapsulation(): SummaryLine {
    if (
      this.encapsulation.type === "Unknown" &&
      this.encapsulation.material === "Unknown"
    ) {
      return {
        feature: "Encapsulation",
        value: "Unknown",
      };
    }

    if (this.encapsulation.type === "Unknown") {
      return {
        feature: "Encapsulation",
        value: this.encapsulation.material,
      };
    }

    return {
      feature: "Encapsulation",
      value: `${this.encapsulation.material} ${this.encapsulation.type === "Casing" ? " Encased" : " Coated"}`,
    };
  }

  get summary_field_strength(): SummaryLine | null {
    // We don't care if there's no value
    if (this.field_strength.every((v) => v === "Unknown")) {
      return null;
    }

    return {
      feature: "Field Strength",
      value: this.field_strength
        .map((v) => numberToLocalizedNumber(v))
        .join(", "),
    };
  }

  get summary(): SummaryLine[] {
    const features: (SummaryLine | null)[] = [
      {
        feature: "Core",
        value: Array.from(new Set(this.magnet.map((m) => m.type))).join(",\n"),
      },
      this.summary_field_strength,
      this.summary_encapsulation,
    ];
    return features.filter((feature) => feature !== null);
  }
}

export const MAGNET_IMPLANT_MAP: Record<string, () => ModInterface> = {
  "DT xG3 v1": () =>
    new MagnetImplant({
      name: "DT xG3 v1",
      magnet: [new Magnet({ orientation: "Axial", type: "Neodymium" })],
      encapsulation: { type: "Casing", material: "Glass" },
    }),
  "DT xG3 v2": () =>
    new MagnetImplant({
      name: "DT xG3 v2",
      magnet: [new Magnet({ orientation: "Diametric", type: "Neodymium" })],
      encapsulation: { type: "Casing", material: "Glass" },
    }),
  "DT TiTAN": () =>
    new MagnetImplant({
      name: "DT TiTAN",
      magnet: [
        new Magnet({
          orientation: "Axial",
          type: "Neodymium",
          field_strength: "2.9 kG",
        }),
      ],
      encapsulation: { type: "Casing", material: "Titanium" },
    }),
};
