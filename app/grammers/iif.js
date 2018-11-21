// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "statement$ebnf$1", "symbols": []},
    {"name": "statement$ebnf$1", "symbols": ["statement$ebnf$1", "trxs"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "statement", "symbols": ["statement$ebnf$1"], "postprocess": v => v[0]},
    {"name": "trxs", "symbols": ["header", "trx"], "postprocess":  function(record){
        	let results = {};
        	record[0].map((fieldname,index) => {
        		results[fieldname] = record[1][index];
        	});
        	return results;
        } },
    {"name": "header", "symbols": ["header_trans", "header_spl", "endheader"], "postprocess": v => v[0]},
    {"name": "header_trans", "symbols": [{"literal":"!"}, "trnsline"], "postprocess": v => v[1]},
    {"name": "header_spl", "symbols": [{"literal":"!"}, "spline"]},
    {"name": "endheader", "symbols": [{"literal":"!"}, "endtrx"]},
    {"name": "trx", "symbols": ["trnsline", "spline", "endtrx"], "postprocess": v => v[0]},
    {"name": "trnsline$ebnf$1", "symbols": ["cell"]},
    {"name": "trnsline$ebnf$1", "symbols": ["trnsline$ebnf$1", "cell"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "trnsline", "symbols": ["trns", "trnsline$ebnf$1", "eol"], "postprocess": v => v[1]},
    {"name": "spline", "symbols": ["spl", "not_eol", "eol"], "postprocess": v => null},
    {"name": "not_eol$ebnf$1", "symbols": [/[\S\t ]/]},
    {"name": "not_eol$ebnf$1", "symbols": ["not_eol$ebnf$1", /[\S\t ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "not_eol", "symbols": ["not_eol$ebnf$1"], "postprocess": v => v[0].join('')},
    {"name": "cell$ebnf$1", "symbols": []},
    {"name": "cell$ebnf$1", "symbols": ["cell$ebnf$1", /[^\t\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "cell", "symbols": ["sep", "cell$ebnf$1"], "postprocess": v => v[1].join('')},
    {"name": "spl$string$1", "symbols": [{"literal":"S"}, {"literal":"P"}, {"literal":"L"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "spl", "symbols": ["spl$string$1"], "postprocess": v => null},
    {"name": "trns$string$1", "symbols": [{"literal":"T"}, {"literal":"R"}, {"literal":"N"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "trns", "symbols": ["trns$string$1"], "postprocess": v => null},
    {"name": "sep", "symbols": [{"literal":"\t"}]},
    {"name": "eol$string$1", "symbols": [{"literal":"\r"}, {"literal":"\n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "eol", "symbols": ["eol$string$1"], "postprocess": v => null},
    {"name": "eol", "symbols": [{"literal":"\n"}], "postprocess": v => null},
    {"name": "endtrx$string$1", "symbols": [{"literal":"E"}, {"literal":"N"}, {"literal":"D"}, {"literal":"T"}, {"literal":"R"}, {"literal":"N"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "endtrx", "symbols": ["endtrx$string$1", "eol"], "postprocess": v => null}
]
  , ParserStart: "statement"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
