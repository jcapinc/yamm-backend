statement -> trxs:* {% v => v[0] %}

trxs -> header trx {% function(record){
	let results = {};
	record[0].map((fieldname,index) => {
		results[fieldname] = record[1][index];
	});
	return results;
} %}
header -> header_trans header_spl endheader {% v => v[0] %}
header_trans -> "!" trnsline {% v => v[1] %}
header_spl -> "!" spline 
endheader -> "!" endtrx

trx -> trnsline spline endtrx {% v => v[0] %}
trnsline -> trns cell:+ eol {% v => v[1] %}
spline ->  spl not_eol eol {% v => null %}

not_eol -> [\S\t ]:+ {% v => v[0].join('') %}
cell -> sep [^\t\r\n]:* {% v => v[1].join('') %}
spl -> "SPL" {% v => null%}
trns -> "TRNS" {% v => null%}
sep -> "\t"
eol -> "\r\n" {% v => null %} | "\n" {% v => null %}

endtrx -> "ENDTRNS" eol {% v => null %}
