export type MagnetTypes = "Unknown" | "Neodymium" | "Samarium Cobalt";

export interface MagnetInterface {
  type: MagnetTypes;
  orientation: "Unknown" | "Axial" | "Diametric";
  field_strength: string;
}

export class Magnet implements MagnetInterface {
  readonly type;
  readonly orientation;
  readonly field_strength;

  constructor(meta: Partial<MagnetInterface>) {
    const { type, orientation, field_strength } = meta;

    this.type = type ?? "Unknown";
    this.orientation = orientation ?? "Unknown";
    this.field_strength = field_strength ?? "Unknown";
  }
}
