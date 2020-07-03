import * as pdi from "@akashic/pdi-types";
import { SurfaceAtlas } from ".";

export interface Glyph extends pdi.Glyph {
	/**
	 * @ignore
	 */
	_atlas: SurfaceAtlas | null;
}
