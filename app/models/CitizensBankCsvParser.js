
module.exports = class CitizensBankCsvParser {
	constructor(buffer){
		this.buffer = buffer;
		this._cursor = 0;
	}
	*[Symbol.iterator](){
		if(this._cursor >= this.buffer.length) return null;
		for(let i = 0 ; i < this.buffer.length; i++){
			if( this.buffer[this._cursor + i] !== 10 ) continue;
			yield this.sliceToModel(this.buffer,this._cursor,this._cursor + i);
		}
		yield this.sliceToModel(this.buffer,this._cursor,this._cursor.length);
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