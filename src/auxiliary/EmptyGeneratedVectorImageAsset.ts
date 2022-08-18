import { EmptyVectorImageAsset } from "./EmptyVectorImageAsset";

export class EmptyGeneratedVectorImageAsset extends EmptyVectorImageAsset {
	data: string;

	constructor(id: string, path: string, data: string) {
		super(id, path, 0, 0);
		this.data = data;
	}
}
