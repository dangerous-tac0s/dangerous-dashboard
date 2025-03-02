import { Mod } from "~/models/mod";

export interface OtherModInterface {}

abstract class OtherMod extends Mod implements OtherModInterface {}

class Tattoo extends OtherMod {}

class Piercing extends OtherMod {}

class Scarification extends OtherMod {}

export const OtherMods = { Tattoo, Piercing, Scarification };
