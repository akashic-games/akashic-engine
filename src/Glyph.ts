import * as pdi from "@akashic/pdi-types";
import { SurfaceAtlas } from "./SurfaceAtlas";

export interface Glyph extends pdi.Glyph {
	/**
	 * @ignore
	 */
	_atlas: SurfaceAtlas | null;
}
