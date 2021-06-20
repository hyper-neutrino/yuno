codepage  = "ΓΔΘΞΠΣΦΨΩαβγδεζηθικλμξπρςστυφχψω !\"#$%&'()*+,-./0123456789:;<=>?"
codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\n"
codepage += "äæçðøħŋœǂɐɒɓɔɕɖɗɘɛɜɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ"
codepage += "‖ᴀʙᴅᴇғɢʜɪᴊᴋʟᴍɴᴘǫʀᴛʏԻԸԹիըթ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”"

let linkref = (arity, offset) => ({
  "condition": x => true,
  "call": (links, outers, index) => ({
    "arity": arity,
    "call": (x, y) => evaluate(outers[modulo(index + offset, outers.length)], arity, x, y)
  })
});

let hyper = x => x.length == 1;

var settings = {

};

var print;

let fail = x => { throw x; }

let _square = x => ({
  "type": "number",
  "value": [x.value[0] ** 2 - x.value[1] ** 2, 2 * x.value[0] * x.value[1]]
});

let _format_square = x => {
  x = to_real_str(x);
  var result = [];
  var length = Math.ceil(Math.sqrt(x.length));
  x += " ".repeat(length ** 2 - x.length);
  for (var i = 0; i < length; i++) {
    result.push(x.substr(i * length, i * length + length));
  }
  return yunoify(result);
}

let _add = (x, y) => ({
  "type": "number",
  "value": [x.value[0] + y.value[0], x.value[1] + y.value[1]]
});

let _sub = (x, y) => ({
  "type": "number",
  "value": [x.value[0] - y.value[0], x.value[1] - y.value[1]]
});

let _mul = (x, y) => ({
  "type": "number",
  "value": [x.value[0] * y.value[0] - x.value[1] * y.value[1], x.value[0] * y.value[1] + x.value[1] * y.value[0]]
});

let _neg = x => ({
  "type": "number",
  "value": [-x.value[0], -x.value[1]]
});

let _cpshift = (x, y) => ({
  "type": "character",
  "value": codepage[modulo(codepage.indexOf(x.value) + y.value[0], 256)]
});

let _padleft = (x, y) => yunoify(" ".repeat(Math.max(0, y.value[0] - x.length)) + to_real_str(x));

let _padright = (x, y) => yunoify(to_real_str(x) + " ".repeat(Math.max(0, y.value[0] - x.length)));

verbs = {
  "+": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _add(x, y) : yunoify(unparse_number(x) + to_real_str(y)))
    : (y.type == "number" ? yunoify(to_real_str(x) + unparse_number(y)) : yunoify(to_real_str(x) + to_real_str(y))), {
      "dostring": false
    })
  },
  ",": {
    "arity": 2,
    "call": (x, y) => list_to_func([x, y])
  },
  "_": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _sub(x, y) : _cpshift(y, x))
    : (y.type == "number" ? _cpshift(x, _neg(y)) : fail("`_` not implemented on chr, chr")))
  },
  "¹": {
    "arity": 1,
    "call": x => x
  },
  "²": {
    "arity": 1,
    "call": vectorized(x => is_string(x) ? _format_square(x) : _square(x), {
      "dostring": false
    })
  },
  "³": {
    "arity": 0,
    "call": () => 0
  },
  "⁴": {
    "arity": 0,
    "call": () => 0
  },
  "⁵": {
    "arity": 0,
    "call": () => 0
  },
  "⁶": {
    "arity": 0,
    "call": () => 0
  },
  "⁷": {
    "arity": 0,
    "call": () => 0
  },
  "⁸": {
    "arity": 0,
    "call": () => 0
  },
  "⁹": {
    "arity": 0,
    "call": () => 0
  },
  "×": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _mul(x, y) : _padleft(y, x))
    : (y.type == "number" ? _padright(x, y) : yunoify([...to_real_str(x)].map(a => a + to_real_str(y)))), {
      "dostring": false
    })
  }
}

adverbs = {
  "@": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": 2,
      "call": (x, y) => links[0].call(y, x)
    })
  },
  "Ի": linkref(0, -1),
  "Ը": linkref(1, -1),
  "Թ": linkref(2, -1),
  "ɨ": linkref(0, 0),
  "ɫ": linkref(1, 0),
  "ɬ": linkref(2, 0),
  "ի": linkref(0, 1),
  "ը": linkref(1, 1),
  "թ": linkref(2, 1)
}

let depth = x => x.type == "sequence" ? (x.length === undefined || x.length == 0 ? 1 : minimum(func_to_list(x).map(x => depth(x))) + 1) : 0;
let minimum = x => Math.min.apply(null, x);
let modulo = (x, y) => x % y + (x < 0 ? y : 0);
let indexmod = (x, y) => modulo(x - 1, y) + 1;

function from_base(x, b) {
  var v = 0;
  for (var k of x) {
    v *= b;
    v += k;
  }
  return v;
}

function elvis(x, y) {
  return x === undefined ? y : x;
}

function vectorized(call, config) {
  return (left, right) => vectorize(call, left, right, config);
}

/*
vectorization strategies:

[1, 2] + [3, 4, 5]:
default: [1 + 3, 2 + 4, 5]
cut: [1 + 3, 2 + 4]
wrap: [1 + 3, 2 + 4, 1 + 5]

these don't apply when one side is not vectorized
*/
function vectorize(call, left, right, config) {
  config = elvis(config, {});

  var maxdepth = elvis(config.maxdepth, -1);
  var invdepth = elvis(config.invdepth, -1);
  var strategy = elvis(elvis(config.strategy, settings.vectorization_strategy), "default");
  var dostring = elvis(config.dostring, true);

  var should_vectorize = x => x && x.type == "sequence" && (dostring || !is_string(x)) && maxdepth != 0 && depth(x) > invdepth;

  var do_left = should_vectorize(left);
  var do_right = should_vectorize(right);

  var new_config = clone(config); new_config.maxdepth = maxdepth - 1;

  if (do_left) {
    if (do_right) {
      if (strategy == "default") {
        return ((x, y, call, config, length = x.length === undefined || y.length === undefined ? undefined : Math.max(x.length, y.length)) => ({
          "type": "sequence",
          "call": index => {
            if (length === undefined) {
              var l = x.length === undefined || 0 < index && index <= x.length ? x.call(index) : undefined;
              var r = y.length === undefined || 0 < index && index <= y.length ? y.call(index) : undefined;
              if (l === undefined) return r;
              if (r === undefined) return l;
              return vectorize(call, l, r, config);
            } else {
              index = indexmod(index, length);
              var l = index <= x.length ? x.call(index) : undefined;
              var r = index <= y.length ? y.call(index) : undefined;
              if (l === undefined) return r;
              if (r === undefined) return l;
              return vectorize(call, l, r, config);
            }
          },
          "length": length
        }))(left, right, call, new_config);
      } else if (strategy == "cut") {
        return ((x, y, call, config, length = x.length === undefined ? y.length === undefined ? undefined : y.length : y.length === undefined ? x.length : Math.min(x.length, y.length)) => ({
          "type": "sequence",
          "call": index => {
            if (length !== undefined) index = indexmod(index, length);
            return vectorize(call, x.call(index), y.call(index), config);
          },
          "length": length
        }))(left, right, call, new_config);
      } else if (strategy == "wrap") {
        return ((x, y, call, config, length = x.length === undefined || y.length === undefined ? undefined : Math.max(x.length, y.length)) => ({
          "type": "sequence",
          "call": index => {
            if (length !== undefined) index = indexmod(index, length);
            return vectorize(call, x.call(index), y.call(index), config);
          },
          "length": length
        }))(left, right, call, new_config);
      } else {
        throw "unknown vectorization strategy \"" + strategy + "\"";
      }
    } else {
      return ((x, y, call, config) => ({
        "type": "sequence",
        "call": index => vectorize(call, x.call(index), y, config),
        "length": x.length
      }))(left, right, call, new_config);
    }
  } else {
    if (do_right) {
      return ((x, y, call, config) => ({
        "type": "sequence",
        "call": index => vectorize(call, x, y.call(index), config),
        "length": y.length
      }))(left, right, call, new_config);
    } else {
      return call(left, right);
    }
  }
}

function clone(a) {
  var copy = {};
  for (var key in a) {
    copy[key] = a[key];
  }
  return copy;
}

function list_to_func(x) {
  return {
    "type": "sequence",
    "length": x.length,
    "call": (a => i => a[modulo(i - 1, a.length)])(x)
  }
}

function func_to_list(x) {
  var list = [];
  for (var i = 1; i <= x.length; i++) {
    list.push(x.call(i));
  }
  return list;
}

function to_real_str(x) {
  if (x.type == "character") return x.value;
  if (x.type == "number") return unparse(x);
  return func_to_list(x).map(x => x.value).join("");
}

function is_string(x) {
  return x.type == "sequence" && x.length !== undefined && func_to_list(x).every(x => x.type == "character");
}

function ynchar(x) {
  return {
    "type": "character",
    "value": x
  };
}

function yunoify(x, deep = true) {
  if (!Array.isArray(x) && !deep) return x;

  if (typeof x == "string") {
    return list_to_func([...x].map(ynchar));
  } else if (typeof x == "number") {
    return {
      "type": "number",
      "value": [x, 0]
    };
  } else if (Array.isArray(x)) {
    return list_to_func(x.map(x => yunoify(x, deep)));
  }
  throw "failed to convert object to yuno-type: this error should be caught - if you are seeing this, something went wrong";
}

function tryeval(x) {
  try {
    return yunoify(eval(x));
  } catch {
    return yunoify(x);
  }
}

function unparse_number(x) {
  x = x.value;
  if (x[1] == 0) {
    return x[0].toString();
  } else {
    if (x[0] == 0) {
      return x[1].toString() + "ɪ";
    } else {
      return x[0].toString() + "+" + x[1].toString() + "ɪ";
    }
  }
}

function parse_number(x) {
  if (x == "") {
    return 0;
  } else if (x.indexOf("ɪ") != -1) {
    var a = x.split("ɪ");
    a[0] = a[0] || "0";
    a[1] = a[1] || "1";
    return a.map(x => parse_number(x)[0]);
  } else if (x.indexOf("ᴊ") != -1) {
    var a = x.split("ᴊ");
    a[0] = a[0] || "1";
    a[1] = a[1] || "3";
    return [parse_number(a[0])[0] * 10 ** parse_number(a[1])[0], 0];
  } else if (x[0] == "-") {
    return [-parse_number(x.substring(1) || "1")[0], 0];
  } else if (x.indexOf(".") != -1) {
    var a = x.split(".");
    return [parseFloat((a[0] == "" ? "0" : a[0]) + "." + (a[1] == "" ? "5" : a[1])), 0];
  } else {
    return [parseInt(x), 0];
  }
}

function last(list) {
  return list[list.length - 1];
}

function ynformat(x) {
  if (Array.isArray(x)) {
    return yunoify(x.map(x => ynformat(x)), false);
  } else {
    return x.value;
  }
}

function collapse(lits, force = false) {
  var bal = 0;
  for (var lit of lits) {
    if (lit.special == "open")  bal++;
    if (lit.special == "close") bal--;
  }
  while (bal < 0) {
    lits.splice(0, 0, {
      "type": "literal",
      "special": "open"
    });
    bal++;
  }
  while (bal > 0) {
    lits.push({
      "type": "literal",
      "special": "close"
    });
    bal--;
  }

  var vals = [];
  for (var index = 0; index < lits.length; index++) {
    if (lits[index].special == "open") {
      var bal = 1;
      var list = [];
      index++;
      while (bal) {
        if (lits[index].special == "close") {
          bal--;
        } else if (lits[index].special == "open") {
          bal++;
        }

        if (bal) {
          list.push(lits[index]);
          index++;
        }
      }
      vals.push(collapse(list, true));
    } else {
      vals.push(lits[index]);
    }
  }

  if (!force && vals.length == 1) return vals[0];
  return vals;
}

function l2v(lit) {
  return {
    "type": "verb",
    "value": {
      "arity": 0,
      "call": (x => (a, b) => x)(lit)
    },
    "name": "<literal>"
  };
}

function strand(line) {
  var output = [];
  var lits = [];
  for (var x of line) {
    if (x.type == "literal") {
      lits.push(x);
    } else {
      if (lits.length) {
        output.push(l2v(ynformat(collapse(lits))));
        lits = [];
      }
      output.push(x);
    }
  }
  if (lits.length) {
    output.push(l2v(ynformat(collapse(lits))));
  }
  return output;
}

function tokenize(code) {
  var lines = [[]];
  for (var index = 0; index < code.length; index++) {
    if (code[index] == "\n") {
      lines.push([]);
    } else if (code[index] == "“") {
      index++;
      literal = [""];
      while (index < code.length) {
        if (code[index] == "“") {
          literal.push("");
        } else if (code[index] == "”") {
          break;
        } else if (code[index] == "«") {
          literal = ["TODO - figure out what to do with this"];
          break;
        } else if (code[index] == "»") {
          literal = ["TODO - dictionary compression"];
          break;
        } else if (code[index] == "‘") {
          literal = literal.map(x => [...x].map(x => codepage.indexOf(x)));
          break;
        } else if (code[index] == "’") {
          literal = literal.map(x => from_base([...x].map(x => codepage.indexOf(x)), 250));
          break;
        } else {
          literal[literal.length - 1] += code[index];
        }
        index++;
      }
      if (literal.length == 1) literal = literal[0];
      last(lines).push({
        "type": "literal",
        "value": yunoify(literal)
      });
    } else if (code[index] == "”") {
      index++;
      literal = index < code.length ? code[index] : " ";
      last(lines).push({
        "type": "literal",
        "value": {
          "type": "character",
          "value": literal
        }
      });
    } else if ("0123456789-.ɪᴊ".indexOf(code[index]) != -1) {
      var item = code.substring(index).match(/((-?[0-9]*(\.[0-9]*)?)?(ᴊ(-?[0-9]*(\.[0-9]*)?)?)?)?(ɪ((-?[0-9]*(\.[0-9]*)?)?(ᴊ(-?[0-9]*(\.[0-9]*)?)?)?)?)?/)[0];
      index += item.length - 1;
      literal = parse_number(item);
      last(lines).push({
        "type": "literal",
        "value": {
          "type": "number",
          "value": literal
        }
      });
    } else if (code[index] == "[") {
      last(lines).push({
        "type": "literal",
        "special": "open"
      });
    } else if (code[index] == "]") {
      last(lines).push({
        "type": "literal",
        "special": "close"
      });
    } else if ("(){}┝┥".indexOf(code[index]) != -1) {
      last(lines).push({
        "type": "bracket",
        "open": "({┝".indexOf(code[index]) != -1,
        "arity": "┝({┥)}".indexOf(code[index]) % 3,
        "name": code[index]
      });
    } else {
      outer: for (var config of [["verb", verbs], ["adverb", adverbs]]) {
        for (var key of Object.keys(config[1])) {
          if (code.substring(index).startsWith(key)) {
            index += key.length - 1;
            last(lines).push({
              "type": config[0],
              "value": config[1][key],
              "name": key
            });
            break outer;
          }
        }
      }
    }
  }
  return lines.map(line => strand(line));
}

function parse_chain(chain, chains, links, outerindex, stack) {
  var stack = stack || links[outerindex];
  for (var index = 0; index < chain.length; index++) {
    if (chain[index].type == "verb") {
      stack.push(chain[index].value);
    } else if (chain[index].type == "adverb") {
      var adverb = chain[index].value;
      var inner = [];
      while (stack.length && !adverb.condition(inner)) {
        inner.splice(0, 0, stack.pop());
      }
      if (adverb.condition(inner)) {
        stack.push(adverb.call(inner, links, outerindex));
      } else if (chain[index].fail) {
        stack.push(adverb.fail(inner, links, outerindex));
      } else {
        throw "adverb failed to meet its condition and does not have a default behavior: `" + chain[index].name + "`";
      }
    } else if (chain[index].type == "bracket") {
      if (chain[index].open) {
        var arity = chain[index].arity;
        index++;
        var bal = 1;
        var inner = [];
        while (bal && index < chain.length) {
          if (chain[index].type == "bracket" && chain[index].arity == arity) {
            bal += chain[index].open ? 1 : -1;
          }
          if (bal) {
            inner.push(chain[index]);
            index++;
          }
        }
        stack.push({
          "type": "verb",
          "arity": arity,
          "call": ((chain, arity) => (x, y) => evaluate(chain, arity, x, y))(parse_chain(inner, chains, links, outerindex, []), arity)
        });
      } else {
        stack.push({
          "type": "verb",
          "arity": chain[index].arity,
          "call": ((chain, arity) => (x, y) => evaluate(chain, arity, x, y))(parse_chain(stack.splice(0, stack.length), chains, links, outerindex, []), chain[index].arity)
        });
      }
    } else {
      console.log(chain[index]);
      throw "unidentified item when parsing the chain; check the console";
    }
  }
  return stack;
}

function parse(chains) {
  var links = chains.map(x => []);
  for (var outerindex = 0; outerindex < chains.length; outerindex++) {
    var chain = chains[outerindex];
    parse_chain(chain, chains, links, outerindex);
  }
  return links;
}

function isLCC(chain) {
  if (chain.length == 0) return false;
  if (chain[0].arity != 0) return false;
  chain = chain.slice(1);
  while (chain.length) {
    if (chain[0].arity == 1) {
      chain = chain.slice(1);
    } else if (chain.length >= 2 && chain[0].arity + chain[1].arity == 2) {
      chain = chain.slice(2);
    } else {
      return false;
    }
  }
  return true;
}

function yuno_output(val, end = "", force = false) {
  if (is_string(val)) {
    if (force) {
      print(JSON.stringify(to_real_str(val)));
    } else {
      print(to_real_str(val));
    }
  } else if (val.type == "sequence") {
    if (val.length == 1 && !settings.forcelist && !force) {
      yuno_output(val.call(1), end, force);
    } else if (val.length === undefined) {
      print("[");
      for (var index = 1; ; index++) {
        yuno_output(val.call(index), end, true);
      }
    } else {
      print("[");
      for (var index = 1; index < val.length; index++) {
        yuno_output(val.call(index), end, true);
        print(", ");
      }
      if (val.length > 0) {
        yuno_output(val.call(val.length), end, true);
      }
      print("]");
    }
  } else if (val.type == "number") {
    if (val.value[1] == 0) {
      print(val.value[0].toString());
    } else if (val.value[0] == 0) {
      print(val.value[1].toString() + "ɪ");
    } else {
      print(val.value[0].toString() + "+" + val.value[1].toString() + "ɪ");
    }
  } else {
    print("<unknown value>");
  }
  print(end);
}

function evaluate(chain, arity, x, y) {
  chain = chain.slice();
  var value;

  if (arity == 0) {
    if (chain.length && chain[0].arity == 0) {
      x = chain.shift().call();
    } else {
      x = {
        "type": "number",
        "value": [0, 0]
      };
    }
    arity = 1;
  }

  if (arity == 1) {
    if (isLCC(chain)) {
      value = chain.shift().call();
    } else {
      value = x;
    }

    while (chain.length) {
      if (chain.length >= 2 && chain[0].arity == 2 && chain[1].arity == 1) {
        var dyad = chain.shift();
        var monad = chain.shift();
        value = dyad.call(value, monad.call(x));
      } else if (chain.length >= 2 && chain[0].arity == 2 && chain[1].arity == 0) {
        var dyad = chain.shift();
        var nilad = chain.shift();
        value = dyad.call(value, nilad.call());
      } else if (chain.length >= 2 && chain[0].arity == 0 && chain[1].arity == 2) {
        var nilad = chain.shift();
        var dyad = chain.shift();
        value = dyad.call(nilad.call(), value);
      } else if (chain[0].arity == 2) {
        var dyad = chain.shift();
        value = dyad.call(value, x);
      } else if (chain[0].arity == 1) {
        var monad = chain.shift();
        value = monad.call(value);
      } else {
        var nilad = chain.shift();
        yuno_output(value);
        value = nilad.call();
      }
    }

    return value;
  }

  if (arity == 2) {
    if (chain.length >= 3 && chain[0].arity == 2 && chain[1].arity == 2 && chain[2].arity == 2) {
      value = chain.shift().call(x, y);
    } else if (isLCC(chain)) {
      value = chain.shift().call();
    } else {
      value = x;
    }

    while (chain.length) {
      if (chain.length >= 3 && chain[0].arity == 2 && chain[1].arity == 2 && isLCC(chain.slice(2))) {
        var dyad1 = chain.shift();
        var dyad2 = chain.shift();
        var nilad = chain.shift();
        value = dyad2.call(dyad1.call(value, y), nilad.call());
      } else if (chain.length >= 2 && chain[0].arity == 2 && chain[1].arity == 2) {
        var dyad1 = chain.shift();
        var dyad2 = chain.shift();
        value = dyad1.call(value, dyad2.call(x, y));
      } else if (chain.length >= 2 && chain[0].arity == 2 && chain[1].arity == 0) {
        var dyad = chain.shift();
        var nilad = chain.shift();
        value = dyad.call(value, nilad.call());
      } else if (chain.length >= 2 && chain[0].arity == 0 && chain[1].arity == 2) {
        var nilad = chain.shift();
        var dyad = chain.shift();
        value = dyad.call(nilad.call(), value);
      } else if (chain[0].arity == 2) {
        var dyad = chain.shift();
        value = dyad.call(value, y);
      } else if (chain[0].arity == 1) {
        var monad = chain.shift();
        value = monad.call(value);
      } else {
        var nilad = chain.shift();
        yuno_output(value);
        value = nilad.call();
      }
    }

    return value;
  }
}

function execute(code, args, input, print_func, error, flags = {}) {
  settings = flags;
  print = print_func;
  args = args.map(tryeval);
  var defaults = [yunoify(16), yunoify(100), yunoify(10), yunoify(64), yunoify(256), ynchar("\n"), ynchar(" ")];
  for (var index = 0; index < 7; index++) {
    verbs["³⁴⁵⁶⁷⁸⁹"[index]].call = (x => () => x)(index < args.length ? args[index] : defaults[index]);
  }
  filtered = "";
  for (var char of code) {
    if (char == "¶") char = "\n";
    if (codepage.indexOf(char) != -1) {
      filtered += char;
    } else {
      error("`" + char + "` is not in the codepage and has been removed.");
    }
  }
  try {
    var chains = tokenize(filtered);
    var parsed = parse(chains);
    var result = evaluate(last(parsed), Math.min(args.length, 2), args[0], args[1]);
    yuno_output(result);
  } catch (e) {
    error(e.toString());
    throw e;
  }
}
