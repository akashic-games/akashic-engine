import * as pdi from "@akashic/pdi-types";
import { SurfaceAtlas } from "./SurfaceAtlas";

export interface Glyph extends pdi.Glyph {
	/**
	 * @ignore
	 * `pdi.Glyph` で `unknown` として予約してあるため、値に型をつける。
	 */
	_atlas: SurfaceAtlas | null;
}
