class CatType {

	asset: any;
	name: string;
	sourceW: number;
	sourceH: number;
	drawHeight: number;

	static allTypes: CatType[] = [];

	constructor(props) {
		this.asset = props.asset;
		this.name = props.name;

		this.sourceW = this.asset["w"];
		this.sourceH = this.asset["h"];

		this.drawHeight = 200 * (this.sourceH / this.sourceW);
	}
}
