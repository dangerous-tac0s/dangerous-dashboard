import { ALL_MODS, Mod } from "~/resources/mod";

export class Member {
  public name?: string;
  // actual references to the global Mod objects
  private _mods: Mod[] = [];

  // Example caches
  private _implantsCache: Mod[] | null = null;
  private _duplicateImplantsCache: Record<string, number> | null = null;

  constructor(modNames: string[], name?: string) {
    if (name) {
      this.name = name;
    }
    // Reuse from ALL_MODS
    // If a name is unknown (not in ALL_MODS), handle gracefully
    this._mods = modNames.map(
      (nm) =>
        ALL_MODS[nm] ||
        new Mod({
          name: nm,
          chip: [],
          mod_type: "Other Mod",
          install_method: "Unknown",
        }),
    );
  }

  // Direct array of Mod objects
  public get mods(): Mod[] {
    return this._mods;
  }

  // Example: number_of_mods
  public get number_of_mods(): number {
    return this._mods.length;
  }

  // An "implants" array that excludes other_mod
  public get implants(): Mod[] {
    // caching example
    if (this._implantsCache !== null) {
      return this._implantsCache;
    }
    // compute once
    const result = this._mods.filter((m) => m.mod_type !== "other_mod");
    this._implantsCache = result;
    return result;
  }

  // duplicates example
  public get duplicate_implants(): Record<string, number> {
    if (this._duplicateImplantsCache !== null) {
      return this._duplicateImplantsCache;
    }
    const freq: Record<string, number> = {};
    for (const imp of this.implants) {
      freq[imp.name] = (freq[imp.name] || 0) + 1;
    }

    const duplicates: Record<string, number> = {};
    for (const productName of Object.keys(freq)) {
      if (freq[productName] > 1) {
        duplicates[productName] = freq[productName];
      }
    }
    this._duplicateImplantsCache = duplicates;
    return duplicates;
  }
}
