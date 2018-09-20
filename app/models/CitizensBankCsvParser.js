const papa = require("papaparse");
module.exports = class CitizensBankCsvParser {

	constructor(buffer){
		this.buffer = buffer;
		this._cursor = 0;
	}

	parseBuffer(){
		return papa.parse(this.buffer.toString());
	}

	parseRow(row){
	}

	reset(){
		this._cursor = 0;
		return this;
	}

	sliceToModel(buffer,start,end){
		let safeEnd = Math.min(end,this.buffer.length - 1);
		let slice = buffer.slice(start,safeEnd);
		this._cursor = end;
		return this.lineToObject(slice.toString());
	}

	lineToObject(line){
		return line;
	}

}
