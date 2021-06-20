codepage  = "ΓΔΘΞΠΣΦΨΩαβγδεζηθικλμξπρςστυφχψω !\"#$%&'()*+,-./0123456789:;<=>?"
codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~\n"
codepage += "äæçðøħŋœǂɐɒɓɔɕɖɗɘɛɜɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ"
codepage += "‖ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀᴛᴜᴠᴡʏᴢ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”"

let hyper = x => x.length == 1;

var settings = {

};

verbs = {
  ",": {
    "arity": 2,
    "call": (x, y) => list_to_func([x, y])
  }
}

adverbs = {
  "@": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": 2,
      "call": (x, y) => links[0].call(y, x)
    })
  }
}

let modulo = (x, y) => x % y + (x < 0 ? y : 0);

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

function is_string(x) {
  return x.type == "sequence" && x.length !== undefined && func_to_list(x).every(x => x.type == "character");
}

function yunoify(x, deep = true) {
  if (!Array.isArray(x) && !deep) return x;

  if (typeof x == "string") {
    return list_to_func([...x].map(x => ({
      "type": "character",
      "value": x
    })));
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

function parse_number(x) {
  if (x == "") {
    return 0;
  } else if (x.indexOf("ɪ") != -1) {
    var a = x.split("ɪ");
    return a.map(x => parse_number(x)[0]);
  } else if (x.indexOf("ᴊ") != -1) {
    var a = x.split("ᴊ");
    return [parse_number(a[0])[0] * 10 ** parse_number(a[1])[0], 0];
  } else if (x[0] == "-") {
    return [-parse_number(x.substring(1))[0], 0];
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
      vals.push(collapse(list));
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
        } else if (code[index] == "’") {
          literal = ["TODO - base 250 number"];
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

function parse(chains, print) {
  var links = chains.map(x => []);
  for (var outerindex = 0; outerindex < chains.length; outerindex++) {
    var chain = chains[outerindex];
    var stack = links[outerindex];
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
            "call": ((chain, arity) => (x, y) => evaluate(chain, arity, x, y, print))(parse(inner), arity)
          });
        } else {
          stack.push({
            "type": "verb",
            "arity": chain[index].arity,
            "call": ((chain, arity) => (x, y) => evaluate(chain, arity, x, y, print))(parse(stack.splice(0, stack.length)), chain[index].arity)
          });
        }
      } else {
        console.log(chain[index]);
        throw "unidentified item when parsing the chain; check the console";
      }
    }
  }
  return links;
}

function isLCC(chain) {
  if (chain.length == 0) return false;
  if (chain[0].arity != 0) return false;
  chain = chain.slice(1);
  while (chain) {
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

function yuno_output(val, print, end = "") {
  if (is_string(val)) {
    func_to_list(val).forEach(x => print(x.value));
  } else if (val.type == "sequence") {
    if (val.length == 1 && !settings.forcelist) {
      yuno_output(val.call(1), print);
    } else if (val.length === undefined) {
      print("[");
      for (var index = 1; ; index++) {
        yuno_output(val.call(index), print);
      }
    } else {
      print("[");
      for (var index = 1; index < val.length; index++) {
        yuno_output(val.call(index), print);
        print(", ");
      }
      if (val.length > 0) {
        yuno_output(val.call(val.length), print);
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

function evaluate(chain, arity, x, y, print) {
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
      value = chain.shift.call();
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

function execute(code, args, input, print, error, flags = {}) {
  settings = flags;
  args = args.map(tryeval);
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
    var result = evaluate(last(parsed), Math.min(args.length, 2), args[0], args[1], print);
    yuno_output(result, print);
  } catch (e) {
    error(e.toString());
    throw e;
  }
}
