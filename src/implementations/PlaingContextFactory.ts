import { PlaingContextLike } from "../interfaces/PlaingContextLike";
import { MusicContext, PlaingContextParameterObject, SoundContext } from "./PlaingContext";

export class ContextFactory {
	static create(type: string, param: PlaingContextParameterObject): PlaingContextLike {
		if (type === "music") {
			return new MusicContext(param);
		} else {
			return new SoundContext(param);
		}
	}
}
