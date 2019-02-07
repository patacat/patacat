type CatTypeProps = {
	asset: AssetImg
	name: string
}

class CatType {

	asset: AssetImg;
	name: string;
	sourceW: number;
	sourceH: number;
	drawHeight: number;

	static allTypes: CatType[] = [];

	constructor(props: CatTypeProps) {
		this.asset = props.asset;
		this.name = props.name;

		this.sourceW = this.asset.w;
		this.sourceH = this.asset.h;

		this.drawHeight = 200 * (this.sourceH / this.sourceW);
	}
}
