"use strict";
var CatType = /** @class */ (function () {
    function CatType(props) {
        this.asset = props.asset;
        this.name = props.name;
        this.sourceW = this.asset["w"];
        this.sourceH = this.asset["h"];
        this.drawHeight = 200 * (this.sourceH / this.sourceW);
    }
    CatType.allTypes = [];
    return CatType;
}());
