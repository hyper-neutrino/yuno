codepage  = "ΓΔΘΞΠΣΦΨΩαβγδεζηθικλμξπρςστυφχψω !\"#$%&'()*+,-./0123456789:;<=>?"
codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\n"
codepage += "äæçðøħŋœǂɐɒɓɔɕɖɗɘ¡¿ɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ"
codepage += "‖ᴀʙᴅᴇғɢʜɪᴊᴋʟᴍɴᴘǫʀᴛʏԻԸԹիըթ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”"

let linkref = (arity, offset) => ({
  "condition": x => true,
  "call": (links, outers, index) => ({
    "arity": arity,
    "call": (x, y) => evaluate(outers[modulo(index + offset, outers.length)], arity, x, y)
  })
});

let hyper = x => x.length == 1;

let memoize = x => (cache => ({
  "type": "sequence",
  "length": x.length,
  "call": i => cache[i] === undefined ? cache[i] = x.call(i) : cache[i]
}))({});

var settings = {

};

var print;
var error;
var input;

let fail = x => { throw x; }

let iter_range = x => x.type == "sequence" ? x : x.type == "character" ? list_to_func([x]) : _implicit_range(x);

let depth = x => x.type == "sequence" ? (x.length === undefined ? Infinity : x.length == 0 ? 1 : minimum(func_to_list(x).map(x => depth(x))) + 1) : 0;
let minimum = x => Math.min.apply(null, x);
let modulo = (x, y) => y == 0 ? NaN : y > 0 ? ADD(REM(x, y), LT(x, 0) ? y : 0) : x % y == 0 ? 0 : (modulo(x, -y) + y);
let indexmod = (x, y) => modulo(x - 1, y) + 1;

let nn = f => (x, y) => {
  if (typeof x == "bigint" && typeof y == "number") {
    try {
      y = BigInt(y);
    } catch {
      x = Number(x);
    }
  }

  if (typeof x == "number" && typeof y == "bigint") {
    try {
      x = BigInt(x);
    } catch {
      y = Number(y);
    }
  }

  return f(x, y);
}

let N = f => nn(OP(f));

let OP = x => eval("(a, b) => a " + x + " b");

let ADD = N("+");
let SUB = N("-");
let MUL = N("*");
let DIV = N("/");
let TDV = (x, y) => Number(x) / Number(y);
let FDV = (x, y) => typeof x == "bigint" && typeof y == "bigint" ? y == 0 ? x > 0 ? Infinity : x < 0 ? -Infinity : 1n : y < 0 && x > 0 ? (x - y - 1n) / y : x / y : floor(TDV(x, y));
let REM = N("%");
let MOD = nn(modulo);
let DIVMOD = (x, y) => [FDV(x, y), MOD(x, y)];
let EXP = N("**");

let GT = N(">");
let LT = N("<");
let GE = N(">=");
let LE = N("<=");
let EQ = N("==");
let NE = N("!=");

let _square = x => ({
  "type": "number",
  "value": [SUB(EXP(x.value[0], 2), EXP(x.value[1], 2)), MUL(MUL(x.value[0], x.value[1]), 2)]
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
  "value": [ADD(x.value[0], y.value[0]), ADD(x.value[1], y.value[1])]
});

let _sub = (x, y) => ({
  "type": "number",
  "value": [SUB(x.value[0], y.value[0]), SUB(x.value[1], y.value[1])]
});

let _mul = (x, y) => ({
  "type": "number",
  "value": [SUB(MUL(x.value[0], y.value[0]), MUL(x.value[1], y.value[1])), ADD(MUL(x.value[0], y.value[1]), MUL(x.value[1], y.value[0]))]
});

let _div = (x, y) => ({
  "type": "number",
  "value": y.value[0] == 0 && y.value[1] == 0 ?
    x.value[0] == 0 && x.value[1] == 0 ?
      [1n, 0n]
    : x.value[0] > 0 ?
        [Infinity, 0n]
      : x.value[0] < 0 ?
          [-Infinity, 0n]
        : x.value[1] > 0 ?
            [0n, Infinity]
          : [0n, -Infinity]
    : [
        TDV(ADD(MUL(x.value[0], y.value[0]), MUL(x.value[1], y.value[1])), (SUB(EXP(y.value[0], 2), EXP(y.value[1], 2)))),
        TDV(SUB(MUL(x.value[1], y.value[0]), MUL(x.value[0], y.value[1])), SUB(EXP(y.value[0], 2), EXP(y.value[1], 2)))
      ]
});

let _floordiv = (x, y) => {
  var q = _div(x, y);
  return {
    "type": "number",
    "value": [floor(q.value[0]), floor(q.value[1])]
  };
};

let _mod = (x, y) => ({
  "type": "number",
  "value": [MOD(x.value[0], y.value[0]), 0n]
});

let _exp = (x, y) => {
  if (y.value[0] == 0 && y.value[1] == 0) return yunoify(1);
  if (x.value[0] == 1 && x.value[1] == 0) return yunoify(1);
  if (y.value[0] == 1 && y.value[1] == 0) return x;
  if (x.value[0] == 0 && x.value[1] == 0) return yunoify(0);
  if (x.value[1] == 0 && y.value[1] == 0) {
    if (y.value[0] >= 0) {
      return {
        "type": "number",
        "value": [EXP(x.value[0], y.value[0]), 0n]
      };
    } else {
      return {
        "type": "number",
        "value": [Number(x.value[0]) ** Number(y.value[0]), 0n]
      };
    }
  } else if (y.value[1] == 0 && MOD(y.value[0], 1) == 0 && y.value[0] > 0) {
    var v = x;
    for (var i = 1; LT(i, y.value[0]); i++) v = _mul(v, x);
    return v;
  } else {
    var v = _ln(x);
    var c = _mul(v, y);
    var x = c.value[0];
    var y = c.value[1];
    return _mul({
      "type": "number",
      "value": [EXP(Math.E, x), 0]
    }, {
      "type": "number",
      "value": [Math.cos(Number(y)), Math.sin(Number(y))]
    });
  }
};

let _ln = x => {
  if (x.value[1] == 0) {
    return yunoify(Math.log(Number(x.value[0])));
  } else {
    var r = Math.sqrt(Number(x.value[0]) ** 2 + Number(x.value[1]) ** 2);
    var t = Math.atan2(Number(x.value[1]), Number(x.value[0]));
    return {
      "type": "number",
      "value": [Math.log(r), t]
    };
  }
};

let floor = x => typeof x == "bigint" ? x : Math.floor(Number(x));
let ceil = x => typeof x == "bigint" ? x : Math.ceil(Number(x));

let _neg = x => ({
  "type": "number",
  "value": [-x.value[0], -x.value[1]]
});

let _cpshift = (x, y) => ({
  "type": "character",
  "value": codepage[modulo(codepage.indexOf(x.value) + floor(y.value[0]), 256)]
});

let _padleft = (x, y) => yunoify(" ".repeat(Math.max(0, floor(y.value[0])) - x.length) + to_real_str(x));

let _padright = (x, y) => yunoify(to_real_str(x) + " ".repeat(Math.max(0, floor(y.value[0]) - x.length)));

let _multiline_divide = (x, y, z = floor(y.value[0])) => z ? yunoify(to_real_str(x).split("\n").map(a => {
  var ret = [];
  for (var i = 0; i < a.length; i += z) {
    ret.push(a.substring(i, i + z));
  }
  return ret;
}).map(a => a.join("\n")).join("\n")) : x;

let _range = (x, type) => {
  x = x.value || x;
  if (x[1] == 0) {
    if (x[0] == Infinity) return _inf_range(type == "lower" || type == "outer" ? 0n : 1n);
    if (x[0] == -Infinity) return _neg_inf_range(type == "upper" || type == "outer" ? 0n : -1n);
    if (x[0] >= 1) return yunoify(range(type == "lower" || type == "outer" ? 0n : 1n, BigInt(floor(x[0])) + (type == "upper" || type == "outer" ? 1n : 0n), 1n));
    return yunoify(range(type == "lower" || type == "inner" ? -1n : 0n, BigInt(floor(x[0])) + (type == "lower" || type == "outer" ? -1n : 0n), -1n));
  } else if (x[0] == 0) {
    return _map(_swap_re_im, _range([x[1], x[0]], type));
  } else {
    return _cartesian_product(_range([x[0], 0n], type), _range([0n, x[1]], type), _add);
  }
};

let _implicit_range = x => _range(x, settings.ir_upper ? "upper" : settings.ir_lower ? "lower" : settings.ir_outer ? "outer" : settings.ir_inner ? "inner" : "upper");

let _char_range = (x, y) => {
  x = codepage.indexOf(x.value || x);
  y = codepage.indexOf(y.value || y);
  var r = y < x;
  if (r) { var t = x; x = y; y = t; }
  var out = range(x, y + 1).map(x => ynchar(codepage[x]));
  if (r) out.reverse();
  return yunoify(out);
}

let _inf_range = start => memoize({
  "type": "sequence",
  "call": x => yunoify(ADD(x, SUB(start, 1)))
});

let _neg_inf_range = start => ({
  "type": "sequence",
  "call": x => yunoify(SUB(start, ADD(x, 1)))
});

let _ext_re = x => ({
  "type": "number",
  "value": [(x.value || x)[0], 0n]
});

let _ext_im = x => ({
  "type": "number",
  "value": [0n, (x.value || x)[1]]
});

let _swap_re_im = x => ({
  "type": "number",
  "value": [(x.value || x)[1], (x.value || x)[0]]
});

let _map = (f, s) => memoize({
  "type": "sequence",
  "length": s.length,
  "call": x => f(s.call(x))
});

let _filter = (f, s) => {
  if (s.length === undefined) {
    var record = [];
    var inverted = [];
    var fscan = 1;
    var bscan = 0;
    return {
      "type": "sequence",
      "call": x => {
        if (x >= 1) {
          while (record.length < x) {
            var v = s.call(fscan++);
            if (f(v)) record.push(v);
          }
          return record[x - 1];
        } else {
          while (inverted.length <= x) {
            var v = s.call(bscan--);
            if (f(v)) inverted.push(v);
          }
          return inverted[-x];
        }
      }
    }
  } else {
    return list_to_func(func_to_list(s).filter(x => f(x)));
  }
}

let _reduce = (x, f, d) => {
  if (x.type == "number") x = _implicit_range(x);
  if (x.type == "character") x = list_to_func([x]);
  if (x.length === undefined) {
    throw "can't reduce an infinite sequence"
  } else if (x.length == 0) {
    return d;
  } else {
    var v = x.call(1);
    for (var index = 2; index <= x.length; index++) {
      v = f(v, x.call(index));
    }
    return v;
  }
}

let _cumreduce = (x, f, d) => {
  if (x.type == "number") x = _implicit_range(x);
  if (x.type == "character") x = list_to_func([x]);
  var cache = [];
  return memoize({
    "type": "sequence",
    "length": x.length,
    "call": index => {
      if (index <= 0 && x.length === undefined) throw "cannot get elements left of the origin of infinite-length cumulative reduce sequences";
      index = modulo(index, x.length);
      while (cache.length <= index) {
        cache.push(f(last(cache), x.call(x.length)));
      }
      return cache[index];
    }
  });
};

let _chr = x => ynchar(codepage[floor(Number(x.value[0])) % 256]);

let _cartesian_product = (x, y, f = (a, b) => list_to_func([a, b])) => memoize({
  "type": "sequence",
  "length": x.length,
  "call": i => memoize({
    "type": "sequence",
    "length": y.length,
    "call": j => f(x.call(i), y.call(j))
  })
});

let _from_base = (x, y) => {
  if (x.type != "sequence") {
    console.log(x);
    throw "cannot from-base convert object of type " + x.type + "; check the console";
  } else if (x.length === undefined) {
    throw "cannot from-base convert infinite sequences";
  } else if (y.type != "number") {
    console.log(y);
    throw "cannot convert with base of type " + y.type + "; check the console";
  } else {
    var value = yunoify(0n);
    for (var index = 1; index <= x.length; index++) {
      value = _add(_mul(value, y), x.call(index));
    }
    return value;
  }
};

let _to_base = (x, y, bj = false) => {
  var num = x.value[0];
  var base = y.value[0];
  if (base == 0) throw yunoify([num]);
  if (num == 0) return yunoify([0]);
  if (base == -1) {
    var digits = [...Array(Math.abs(Number(num) * 2))].map((_, i) => 1 - i % 2);
    if (num > 0) digits.pop();
    return yunoify(digits);
  }
  var sign = num < 0 && base > 0 ? -1 : 1;
  num = MUL(num, sign);
  if (base == 1) return yunoify([...Array(Number(num))].map(_ => sign));
  var digits = [];
  while (num) {
    num = SUB(num, bj ? 1 : 0);
    var [num, digit] = DIVMOD(num, base);
    digit = ADD(digit, bj ? 1 : 0);
    if (digit < 0) {
      num = ADD(num, 1);
      digit = SUB(digit, base);
    }
    digits.push(MUL(digit, sign));
  }
  digits.reverse();
  return yunoify(digits);
};

let _to_arbitrary_base = (x, y) => (y => _map(x => yunoify(y[x])), _to_base(yunoify(floor(x.value[0])), yunoify(y.length)))(to_real_str(y));

let _trunc_imag = x => ({
  "type": "number",
  "value": [x.value[0], 0n]
});

let _primeq = x => {
  var F = yunoify(0), T = yunoify(1);
  if (x.value[1]) return F;
  x = x.value[0];
  if (MOD(x, 1)) return F;
  if (LT(x, 2)) return F;
  if (LT(x, 4)) return T;
  if (MOD(x, 2) == 0) return F;
  for (var f = 3; LE(f * f, x); f += 2) {
    if (MOD(x, f) == 0) return F;
  }
  return T;
}

let _EQ = (x, y) => {
  if (x.type === undefined && y.type === undefined) {
    if (Array.isArray(x)) {
      if (Array.isArray(y)) {
        return x.length == y.length && [...Array(x.length)].every((_, i) => _EQ(x[i], y[i]));
      } else {
        return false;
      }
    } else {
      if (Array.isArray(y)) {
        return false;
      } else {
        return x == y;
      }
    }
  } else if (x.type != y.type) {
    return false;
  } else {
    if (x.type == "sequence") {
      if (x.length === undefined || y.length === undefined || x.length != y.length) return false;
      for (var index = 1; index <= x.length; index++) {
        if (!_EQ(x.call(index), y.call(index))) return false;
      }
      return true;
    } else {
      return _EQ(x.value, y.value);
    }
  }
};

let _eq = (x, y) => yunoify(_EQ(x, y) ? 1 : 0);

let _index_of = (x, y) => {
  if (x.type != "sequence") x = list_to_func([x]);
  for (var index = 1; x.length === undefined || index <= x.length; index++) {
    if (_EQ(x.call(index), y)) return yunoify(index);
  }
  return yunoify(0);
}

let _index_into = (x, y) => {
  if (x.type == "number") {
    if (x.value[1]) {
      return x.value.map(k => _index_into(k, y));
    } else {
      return _index_into(x.value[0], y);
    }
  } else {
    if (MOD(x, 1) == 0) {
      return y.call(Number(x));
    } else {
      return [_index_into(floor(x), y), _index_into(ceil(x), y)];
    }
  }
};

let _string_increment = x => {
  return yunoify(string_increment(to_real_str(x)));
}

let _string_decrement = x => {
  return yunoify(string_decrement(to_real_str(x)));
}

function string_increment(x) {
  if (x == "") {
    return "Γ";
  } else if (x[x.length - 1] == "”") {
    return string_increment(x.substring(0, x.length - 1)) + "Γ";
  } else {
    return x.substring(0, x.length - 1) + codepage[codepage.indexOf(x[x.length - 1]) + 1];
  }
}

function string_decrement(x) {
  if (x == "" || x == "Γ") {
    return "";
  } else if (x[x.length - 1] == "Γ") {
    return string_decrement(x.substring(0, x.length - 1)) + "”";
  } else {
    return x.substring(0, x.length - 1) + codepage[codepage.indexOf(x[x.length - 1]) - 1];
  }
}

function to_bool(v) {
  if (v.type == "sequence") {
    return v.length !== 0;
  } else if (v.type == "number") {
    return v.value[0] != 0 || v.value[1] != 0;
  } else if (v.type == "character") {
    return true;
  }
}

function range(start, end, step) {
  if (end === undefined && step === undefined) { end = start; start = 0; step = 1; }
  if (step === undefined) { step = end > start ? 1 : -1; }
  var ret = [];
  for (var x = start; GT(end, start) ? LT(x, end) : GT(x, end); x = ADD(x, step)) {
    ret.push(x);
  }
  return ret;
}

function arbitrary_range(start, end, open_excl, close_excl) {
  start = start.value || start;
  end = end.value || end;

  start = start.map(floor);
  end = end.map(floor);

  if (start[1] == 0 && end[1] == 0) {
    var out = [];
    for (var x = start[0]; x != end[0]; x = ADD(x, LT(start[0], end[0]) ? 1n : -1n)) {
      out.push(x);
    }
    if (open_excl) {
      out.splice(0, 1);
    }
    if (!close_excl) {
      out.push(end[0]);
    }
    return yunoify(out);
  } else if (start[0] == 0 && end[0] == 0) {
    return _map(_swap_re_im, arbitrary_range(_swap_re_im(start), _swap_re_im(end), open_excl, close_excl));
  } else {
    return _cartesian_product(arbitrary_range(_ext_re(start), _ext_re(end), open_excl, close_excl), arbitrary_range(_ext_im(start), _ext_im(end), open_excl, close_excl), _add);
  }
}

let to_real_num = x => x.type == "number" ? x.value[0] : [fail("attempted to convert invalid object to a real number; check the console"), console.log(x)];

let verbs = {
  "Σ": {
    "arity": 1,
    "call": x => _reduce(x, _add, yunoify(0))
  },
  "α": {
    "arity": 0,
    "call": (x, y) => yunoify("yuno by hyper-neutrino")
  },
  "β": {
    "arity": 2,
    "call": vectorized((x, y) => {
      if (x.type == "number") x = list_to_func([x]);
      if (x.type == "character") x = list_to_func([x]);
      if (y.type == "character") y = list_to_func([y]);

      if (x.length && is_string(x)) {
        if (is_string(y)) {
          throw "`β` not implemented on str, str";
        } else {
          return _from_base(yunoify([...to_real_str(x)].map(x => "0123456789abcdefghijklmnopqrstuvwxyz".indexOf(x.toLowerCase())).filter(x => x >= 0)), y);
        }
      } else {
        if (is_string(y)) {
          return _from_base(yunoify([...to_real_str(y)].map(x => "0123456789abcdefghijklmnopqrstuvwxyz".indexOf(x.toLowerCase())).filter(x => x >= 0)), x);
        } else {
          return _from_base(x, y);
        }
      }
    }, {
      "dostring": false,
      "invdepthl": 1
    })
  },
  "ι": {
    "arity": 0,
    "call": (x, y) => _inf_range(1n)
  },
  "ω": {
    "arity": 0,
    "call": (x, y) => list_to_func([])
  },
  "!": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? yunoify(math.gamma(Number(x.value[0]) + 1)) : fail("`!` not implemented on str"), {
      "dostring": false
    })
  },
  "%": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _mod(_trunc_imag(x), _trunc_imag(y)) : fail("`%` not implemented on num, str"))
    : (y.type == "number" ? fail("`%` not implemented on str, num") : fail("`%` not implemented on str, str")), {
      "dostring": false
    })
  },
  "*": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _exp(x, y) : fail("`*` not implemented on num, str"))
    : (y.type == "number" ? fail("`*` not implemented on str, num") : fail("`*` not implemented on str, str")), {
      "dostring": false
    })
  },
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
  ":": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _floordiv(x, y) : fail("`:` not implemented on num, str"))
    : (y.type == "number" ? fail("`:` not implemented on str, num") : fail("`:` not implemented on str, str")), {
      "dostring": false
    })
  },
  "A": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ?
      yunoify(x.value[1] == 0 ?
                x.value[0] > 0 ?
                  x.value[0]
                : -x.value[0]
              : x.value[0] == 0 ?
                  x.value[1] > 0 ?
                    x.value[1]
                  : -x.value[1]
                : math.sqrt(Number(x.value[0]) ** 2 + Number(x.value[1]) ** 2))
            : ynchar(x.value.toUpperCase()))
  },
  "B": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? verbs["b"].call(x, yunoify(2)) : fail("`B` not implemented on str"), {
      "dostring": false
    })
  },
  "C": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _sub(yunoify(1), x) : ynchar(x.value == x.value.toUpperCase() ? x.value.toLowerCase() : x.value.toUpperCase()))
  },
  "D": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? verbs["b"].call(x, yunoify(10)) : fail("`D` not implemented on str"), {
      "dostring": false
    })
  },
  "L": {
    "arity": 1,
    "call": x => x.type == "sequence" ? yunoify(x.length === undefined ? Infinity : BigInt(x.length)) : yunoify(BigInt(to_real_str(x).length))
  },
  "P": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _primeq(x) : fail("`P` not implemented on chr"))
  },
  "R": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _range(x, "upper") : _char_range("A", x))
  },
  "_": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _sub(x, y) : _cpshift(y, x))
    : (y.type == "number" ? _cpshift(x, _neg(y)) : fail("`_` not implemented on chr, chr")))
  },
  "b": {
    "arity": 2,
    "call": vectorized((x, y) => {
      if (x.type == "character") x = list_to_func([x]);
      if (y.type == "character") y = list_to_func([y]);
      if (x.type == "number") {
        if (y.type == "number") {
          var df = SUB(x.value[0], floor(x.value[0]));
          x.value[0] = floor(x.value[0]);
          var dg = _to_base({
            "type": "number",
            "value": [x.value[0], 0n]
          }, {
            "type": "number",
            "value": [y.value[0], 0n]
          });
          if (df) dg = (p => memoize({
            "type": "sequence",
            "length": dg.length,
            "call": x => _add(p.call(x), yunoify((modulo(x, dg.length) == 0 ? df : 0)))
          }))(dg);

          return dg;
        } else {
          return _to_arbitrary_base(x, y);
        }
      } else {
        if (y.type == "number") {
          return _to_arbitrary_base(y, x);
        } else {
          throw "`b` not implemented on str, str";
        }
      }
    }, {
      "dostring": false
    })
  },
  "i": {
    "arity": 2,
    "call": _index_of
  },
  "r": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? arbitrary_range(x, y, false, false) : fail("`r` not implemented on num, chr"))
    : (y.type == "number" ? fail("`r` not implemented on chr, num") : _map(_chr, arbitrary_range(yunoify(codepage.indexOf(x.value)), yunoify(codepage.indexOf(y.value))))))
  },
  "ɨ": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ? _index_into(x, y.type == "sequence" ? y : list_to_func([y])) : fail("`ɨ` not implemented for chr, any"), {
      "maxdepthr": 0
    })
  },
  "ɲ": {
    "arity": 2,
    "call": (x, y) => x
  },
  "ɳ": {
    "arity": 2,
    "call": (x, y) => y
  },
  "ɵE": {
    "arity": 0,
    "call": () => evaluate(last(parse(tokenize(input()))), 0)
  },
  "ɵI": {
    "arity": 0,
    "call": () => yunoify(input())
  },
  "ɵN": {
    "arity": 1,
    "call": x => (yuno_output(x, "\n"), x)
  },
  "ɵ_": {
    "arity": 1,
    "call": x => (yuno_output(x), x)
  },
  "ɹ": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? arbitrary_range(x, y, true, true) : fail("`r` not implemented on num, chr"))
    : (y.type == "number" ? fail("`r` not implemented on chr, num") : ((x, y) => _map(_chr, arbitrary_range(yunoify(x > y ? x : x + 256), yunoify(x > y ? y + 256 : y))))(codepage.indexOf(x.value), codepage.indexOf(y.value))))
  },
  "ɻ": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? arbitrary_range(x, y, true, false) : fail("`r` not implemented on num, chr"))
    : (y.type == "number" ? fail("`r` not implemented on chr, num") : ((x, y) => _map(_chr, arbitrary_range(yunoify(x > y ? x : x + 256), yunoify(y))))(codepage.indexOf(x.value), codepage.indexOf(y.value))))
  },
  "ɽ": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? arbitrary_range(x, y, false, true) : fail("`r` not implemented on num, chr"))
    : (y.type == "number" ? fail("`r` not implemented on chr, num") : ((x, y) => _map(_chr, arbitrary_range(yunoify(x), yunoify(x > y ? y + 256 : y))))(codepage.indexOf(x.value), codepage.indexOf(y.value))))
  },
  "ɾ": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _range(x, "outer") : _char_range("Γ", x))
  },
  "ʁ": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _range(x, "inner") : _char_range("!", x))
  },
  "ᴀA": {
    "arity": 2,
    "call": (x, y) => memoize({
      "type": "sequence",
      "call": i => verbs["+"].call(x, verbs["×"].call(y, {
        "type": "number",
        "value": [SUB(i, 1), 0n]
      }))
    })
  },
  "ᴀG": {
    "arity": 2,
    "call": (x, y) => memoize({
      "type": "sequence",
      "call": i => verbs["×"].call(x, verbs["*"].call(y, {
        "type": "number",
        "value": [SUB(i, 1), 0n]
      }))
    })
  },
  "ᴍI": {
    "arity": 0,
    "call": () => ({
      "type": "number",
      "value": [Infinity, 0n]
    })
  },
  "ᴅ": {
    "arity": 1,
    "call": x => yunoify(depth(x))
  },
  "ᴘ": {
    "arity": 1,
    "call": x => _reduce(x, _mul, yunoify(1))
  },
  "ʀ": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _range(x, "lower") : _char_range("a", x))
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
  },
  "÷": {
    "arity": 2,
    "call": vectorized((x, y) => x.type == "number" ?
      (y.type == "number" ? _div(x, y) : _multiline_divide(y, x))
    : (y.type == "number" ? _multiline_divide(x, y) : yunoify(to_real_str(x).match(to_real_str(y)) || "")), {
      "dostring": false
    })
  },
  "¬": {
    "arity": 1,
    "call": vectorized(x => yunoify(to_bool(x) ? 0 : 1))
  },
  "Ϩ": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _exp(x, yunoify(0.5)) : (y => yunoify([y.substring(0, Math.ceil(y.length / 2)), y.substring(Math.floor(y.length / 2))]))(to_real_str(x)), {
      "dostring": false
    })
  },
  "‘": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _sub(x, yunoify(1)) : _string_decrement(x), {
      "dostring": false
    })
  },
  "’": {
    "arity": 1,
    "call": vectorized(x => x.type == "number" ? _add(x, yunoify(1)) : _string_increment(x), {
      "dostring": false
    })
  }
}

let absref = arity => ({
  "condition": hyper,
  "call": (links, outers, index) => ({
    "arity": Math.max(links[0].arity, arity),
    "call": (x, y) => evaluate(outers[(x => x >= index ? x + 1 : x)(modulo(floor(Number(to_real_num(evaluate([links[0]], links[0].arity, x, y)))) - 1, outers.length - 1))], arity, x, y)
  })
});

let _while_loop = (links, keep = false) => links.length == 2 ? {
  "arity": Math.max(links[0].arity, links[1].arity),
  "call": (x, y) => {
    var v = x;
    var o = [];
    while (to_bool(links[1].call(v, y))) {
      if (keep) o.push(v);
      v = links[0].call(v, y);
    }
    return keep ? list_to_func(o) : v;
  }
} : {
  "arity": links[0].arity,
  "call": (x, y) => {
    var v = x;
    var o = [];
    while (true) {
      var k = links[0].call(v, y);
      if (!to_bool(k)) return keep ? list_to_func(o) : v;
      o.push(v);
      v = k;
    }
  }
}

let _if_else = links => {
  if (links.length == 0) {
    links = [l2v(yunoify(1)).value, l2v(yunoify(0)).value, verbs["¹"]];
  } else if (links.length == 1) {
    links = [l2v(yunoify(1)).value, l2v(yunoify(0)).value, links[0]];
  } else if (links.length == 2) {
    links = [links[0], verbs["¹"], links[1]];
  }

  return {
    "arity": links.map(x => x.arity).reduce((x, y) => Math.max(x, y)),
    "call": (x, y) => (to_bool(links[2].call(x, y)) ? links[0] : links[1]).call(x, y)
  };
};

let adverbs = {
  "Ξ": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": Math.max(links[0].arity, 1),
      "call": (x, y) => _filter(a => to_bool(links[0].call(a, y)), iter_range(x))
    })
  },
  "φ": absref(0),
  "χ": absref(1),
  "ψ": absref(2),
  "?": {
    "condition": x => x.length == 3,
    "call": (links, outers, index) => _if_else(links),
    "fail": (links, outers, index) => _if_else(links)
  },
  "@": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": 2,
      "call": (x, y) => links[0].call(y, x)
    })
  },
  "/": {
    "condition": x => x.length == 2 || x.length == 1 && x[0].arity != 0,
    "call": (links, outers, index) => {
      if (links.length == 2) {
        throw "n-wise reduce has not been implemented yet";
      } else {
        return {
          "arity": 1,
          "call": (x, y) => _reduce(x, links[0].call, yunoify(0))
        };
      }
    }
  },
  "\\": {
    "condition": x => x.length == 2 || x.length == 1 && x[0].arity != 0,
    "call": (links, outers, index) => {
      if (links.length == 2) {
        throw "n-wise overlapping reduce has not been implemented yet";
      } else {
        return {
          "arity": 1,
          "call": (x, y) => _cumreduce(x, links[0].call, yunoify(0))
        };
      }
    }
  },
  "`": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": links[0].arity == 1 ? 2 : 1,
      "call": (x, y) => links[0].call(x, x)
    })
  },
  "¿": {
    "condition": x => x.length == 2,
    "call": (links, outers, index) => _while_loop(links),
    "fail": (links, outers, index) => _while_loop(links)
  },
  "ʔ": {
    "condition": x => x.length == 2,
    "call": (links, outers, index) => _while_loop(links, true),
    "fail": (links, outers, index) => _while_loop(links, true)
  },
  "‖": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": Math.max(links[0].arity, 1),
      "call": (x, y) => _filter(a => !to_bool(links[0].call(a, y)), iter_range(x))
    })
  },
  "ᴀS": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": links[0].arity,
      "call": (x, y) => {
        var cache = [x];
        return memoize({
          "type": "sequence",
          "call": index => {
            if (index <= 0) throw "cannot get elements left of the origin of mono-directional recursive sequences";
            while (cache.length < index) {
              cache.push(links[0].call(last(cache), y));
            }
            return cache[index - 1];
          }
        });
      }
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
  "թ": linkref(2, 1),
  "Ͼ": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": Math.max(1, links[0].arity),
      "call": (x, y) => _map(a => links[0].call(a, y), iter_range(x))
    })
  },
  "Ͽ": {
    "condition": hyper,
    "call": (links, outers, index) => ({
      "arity": 2,
      "call": (x, y) => _map(b => links[0].call(x, b), iter_range(y))
    })
  }
}

function from_base(x, b) {
  var v = 0;
  for (var k of x) {
    v = ADD(MUL(v, b), k);
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

  var maxdepthl = elvis(config.maxdepthl, -1);
  var maxdepthr = elvis(config.maxdepthr, -1);
  var invdepthl = elvis(config.invdepthl, -1);
  var invdepthr = elvis(config.invdepthr, -1);
  var strategy = elvis(elvis(config.strategy, settings.vectorization_strategy), "default");
  var dostringl = elvis(config.dostringl, elvis(config.dostring, true));
  var dostringr = elvis(config.dostringr, elvis(config.dostring, true));

  var do_left = left && left.type == "sequence" && (dostringl || !is_string(left)) && maxdepthl != 0 && depth(left) > invdepthl;
  var do_right = right && right.type == "sequence" && (dostringr || !is_string(right)) && maxdepthr != 0 && depth(right) > invdepthr;

  var new_config = clone(config); new_config.maxdepthl = maxdepthl ? maxdepthl - 1 : 0; new_config.maxdepthr = maxdepthr ? maxdepthr - 1 : 0;

  if (do_left) {
    if (do_right) {
      if (strategy == "default") {
        return ((x, y, call, config, length = x.length === undefined || y.length === undefined ? undefined : Math.max(x.length, y.length)) => memoize({
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
        return ((x, y, call, config, length = x.length === undefined ? y.length === undefined ? undefined : y.length : y.length === undefined ? x.length : Math.min(x.length, y.length)) => memoize({
          "type": "sequence",
          "call": index => {
            if (length !== undefined) index = indexmod(index, length);
            return vectorize(call, x.call(index), y.call(index), config);
          },
          "length": length
        }))(left, right, call, new_config);
      } else if (strategy == "wrap") {
        return ((x, y, call, config, length = x.length === undefined || y.length === undefined ? undefined : Math.max(x.length, y.length)) => memoize({
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
      return ((x, y, call, config) => memoize({
        "type": "sequence",
        "call": index => vectorize(call, x.call(index), y, config),
        "length": x.length
      }))(left, right, call, new_config);
    }
  } else {
    if (do_right) {
      return ((x, y, call, config) => memoize({
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
  return memoize({
    "type": "sequence",
    "length": x.length,
    "call": (a => i => a[MOD(i - 1, a.length)])(x)
  })
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
  if (x.type == "number") return unparse_number(x);
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

  if (x.type) return x;

  if (typeof x == "number") try { x = BigInt(x); } catch {}

  if (typeof x == "string") {
    return list_to_func([...x].map(ynchar));
  } else if (typeof x == "number" || typeof x == "bigint") {
    return {
      "type": "number",
      "value": [x, 0n]
    };
  } else if (Array.isArray(x)) {
    return list_to_func(x.map(x => yunoify(x, deep)));
  }
  throw "failed to convert object to yuno-type: this error should be caught - if you are seeing this, something went wrong";
}

function tryeval(x) {
  try {
    C = (x, y) => ({
      "type": "number",
      "value": y === undefined ? [0n, x] : [x, y]
    });
    return yunoify(eval(x));
  } catch {
    return yunoify(x);
  }
}

function ynround(x) {
  if (typeof x == "bigint") return x;
  if (settings.round_thousandth) {
    return Math.round(Number(x) * 1000) / 1000;
  } else {
    return x;
  }
}

function unparse_number(x) {
  x = x.value || x;
  a = ynround(x[0]);
  b = ynround(x[1]);
  if (b == 0 || isNaN(Number(a))) {
    return a.toString();
  } else {
    if (a == 0) {
      if (b == 1) {
        return "ɪ";
      } else if (b == -1) {
        return "-ɪ";
      } else {
        return b.toString() + "ɪ";
      }
    } else {
      if (b == 1) {
        return a.toString() + "+ɪ";
      } else if (b == -1) {
        return a.toString() + "-ɪ";
      } else if (b > 0) {
        return a.toString() + "+" + b.toString() + "ɪ";
      } else {
        return a.toString() + b.toString() + "ɪ";
      }
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
  } else if (x.indexOf("ᴇ") != -1) {
    var a = x.split("ᴇ");
    a[0] = a[0] || "1";
    a[1] = a[1] || "3";
    return [MUL(parse_number(a[0])[0], EXP(10n, parse_number(a[1])[0])), 0n];
  } else if (x.indexOf("ʙ") != -1) {
    var a = x.split("ʙ");
    a[0] = a[0] || "1";
    a[1] = a[1] || "4";
    return [MUL(parse_number(a[0])[0], EXP(2n, parse_number(a[1])[0])), 0n];
  } else if (x.indexOf("ғ") != -1) {
    var a = x.split("ғ");
    a[0] = a[0] || "1";
    a[1] = a[1] || "3";
    return [Number(parse_number(a[0])[0]) / Number(parse_number(a[1])[0]), 0]
  } else if (x[0] == "-") {
    return [-parse_number(x.substring(1) || "1")[0], 0];
  } else if (x.indexOf(".") != -1) {
    var a = x.split(".");
    return [parseFloat((a[0] == "" ? "0" : a[0]) + "." + (a[1] == "" ? "5" : a[1])), 0];
  } else {
    return [BigInt(x), 0];
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
          var nums = literal.map(x => from_base([...x].map(x => codepage.indexOf(x) + 1), 250n));
          literal = nums.map(x => {
            var dc = "";
            while (x) {
              var [x, m] = DIVMOD(x, 3n);
              if (m == 0) {
                var [x, c] = DIVMOD(x, 96n);
                dc += codepage[c + 32n];
              } else {
                f_sw = false;
                f_sp = dc != "";
                if (m == 2) {
                  var [x, f] = DIVMOD(x, 3n);
                  f_sw = f != 1;
                  f_sp ^= f != 0;
                }
                var [x, s] = DIVMOD(x, 2n);
                dict = s ? dictionary.short : dictionary.long;
                var [x, n] = DIVMOD(x, dict.length);
                var w = dict[n];
                if (f_sw) w = (w[0] == w[0].toUpperCase() ? w[0].toLowerCase() : w[0].toUpperCase()) + w.substring(1);
                if (f_sp) w = " " + w;
                dc += w;
              }
            }
            return dc;
          });
          break;
        } else if (code[index] == "‘") {
          literal = literal.map(x => [...x].map(x => codepage.indexOf(x)));
          break;
        } else if (code[index] == "’") {
          literal = literal.map(x => from_base([...x].map(x => codepage.indexOf(x) + 1), 250n));
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
    } else if ("0123456789-.ɪʙᴇғ".indexOf(code[index]) != -1) {
      var re = "-?\\d*(\\.\\d*)?";
      var fr = "(" + re + "(ғ" + re + ")?)";
      var bn = "(" + fr + "(ʙ" + fr + ")?)";
      var xp = "(" + bn + "(ᴇ" + bn + ")?)";
      var im = "(" + xp + "(ɪ" + xp + ")?)";
      var item = code.substring(index).match("^" + im)[0]
      index += item.length - 1;
      literal = parse_number(item);
      last(lines).push({
        "type": "literal",
        "value": {
          "type": "number",
          "value": literal
        }
      });
    } else if (code[index] == "ˌ") {
      last(lines).push({
        "type": "literal",
        "value": yunoify((code[++index] || " ") + (code[++index] || " "))
      });
    } else if (code[index] == "‼") {
      var v = from_base([codepage.indexOf(code[++index] || "Γ") + 1, codepage.indexOf(code[++index] || "Γ") + 1], 256n) + 744n;
      if (v > 33318n) {
        v -= 66637n;
      }
      last(lines).push({
        "type": "literal",
        "value": yunoify(v)
      });
      console.log(v);
    } else if (code[index] == "ᴋ") {
      if (code[++index] == " ") break;
      var v = k_digraphs["ᴋ" + (code[index] || "H")];
      if (v === 0) {
        error("warning: literal digraph `ᴋ" + (code[index] || "H") + "` doesn't appear to have been defined yet, so 0 has been returned\n");
      }
      last(lines).push({
        "type": "literal",
        "value": yunoify(v)
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
  var stack = stack === undefined ? links[outerindex] : stack;
  for (var index = 0; index < chain.length; index++) {
    if (chain[index].type == "verb") {
      var verb = chain[index].value || chain[index];
      verb.type = "verb";
      stack.push(verb);
    } else if (chain[index].type == "adverb") {
      var adverb = chain[index].value;
      var inner = [];
      while (stack.length && !adverb.condition(inner)) {
        inner.splice(0, 0, stack.pop());
      }
      if (adverb.condition(inner)) {
        var verbs = adverb.call(inner, links, outerindex);
        if (!Array.isArray(verbs)) verbs = [verbs];
        verbs.forEach(verb => {
          verb.type = "verb";
          stack.push(verb);
        })
      } else if (adverb.fail) {
        var verbs = adverb.fail(inner, links, outerindex);
        if (!Array.isArray(verbs)) verbs = [verbs];
        verbs.forEach(verb => {
          verb.type = "verb";
          stack.push(verb);
        })
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
        var subchain = stack.splice(0, stack.length);
        var arity = chain[index].arity;
        stack.push({
          "type": "verb",
          "arity": arity,
          "call": ((chain, arity) => (x, y) => evaluate(chain, arity, x, y))(parse_chain(subchain, chains, links, outerindex, []), arity)
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

function yuno_output(val, end = "", force = false, fstring = false) {
  if (is_string(val)) {
    if (force || fstring) {
      print(JSON.stringify(to_real_str(val)));
    } else {
      if (val.length == 0 && (force || settings.forcelist)) print("[]")
      else print(to_real_str(val));
    }
  } else if (val.type == "sequence") {
    if (val.length == 1 && !settings.forcelist && !force) {
      yuno_output(val.call(1), end, force, fstring);
    } else if (val.length === undefined) {
      var max = settings.capten ? 10 : Infinity;
      print("[");
      for (var index = 1; index <= max; index++) {
        yuno_output(val.call(index), end, true, true);
        print(", ");
      }
      print("...]");
    } else {
      print("[");
      for (var index = 1; index < val.length; index++) {
        yuno_output(val.call(index), end, force, true);
        print(", ");
      }
      if (val.length > 0) {
        yuno_output(val.call(val.length), end, force, true);
      }
      print("]");
    }
  } else if (val.type == "number") {
    print(unparse_number(val));
  } else if (val.type == "character") {
    if (!force && !fstring) {
      print(val.value);
    } else if (val.value == "'") {
      print("'\\''");
    } else if (val.value == "\n") {
      print("'\n''");
    } else if (val.value == "\\") {
      print("'\\\\'");
    } else {
      print("'" + val.value + "'");
    }
  } else {
    print("<unknown value>");
  }
  print(end);
}

function evaluate(chain, arity, x, y) {
  verbs["α"].call = (x => () => x)(x === undefined ? yunoify("yuno by hyper-neutrino") : x);
  verbs["ω"].call = (x => () => x)(y === undefined ? yunoify([]) : y);

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

function execute(code, args, input_func, print_func, error_func, flags = {}) {
  if (flags.help) {
    print_func("L - force list display (don't print singleton lists as just its element)\n"
             + "T - cap infinite sequence output at 10 elements\n"
             + "U - implicit range uses the upper strategy\n"
             + "D - implicit range uses the lower strategy\n"
             + "O - implicit range uses the outer strategy\n"
             + "I - implicit range uses the inner strategy\n"
             + "j - final implicit output joins on newlines\n"
             + "k - final implicit output joins on spaces\n"
             + "d - disable implicit output\n"
             + "t - round all numbers to the nearest thousandth\n",
             + "M - don't memoize sequence calls (warning: severe performance degradation is possible)\n"
             + "_ - don't cap output (warning: program may freeze)\n"
             + "W - cap output at 10 000 characters\n"
             + "h - show this help message");
    return;
  }
  settings = flags;
  print = print_func;
  error = error_func;
  input = input_func;
  args = args.map(tryeval);
  var defaults = [ynchar("\n"), ynchar(" "), yunoify(64n), yunoify(32n), yunoify(100n), yunoify(256n), yunoify(10n)];
  for (var index = 0; index < 7; index++) {
    verbs["³⁴⁵⁶⁷⁸⁹"[index]].call = (x => () => x)(index < args.length ? args[index] : defaults[index]);
  }
  filtered = "";
  for (var char of code) {
    if (char == "¶") char = "\n";
    if (codepage.indexOf(char) != -1) {
      filtered += char;
    } else {
      error("`" + char + "` is not in the codepage and has been removed\n");
    }
  }
  try {
    var chains = tokenize(filtered);
    var parsed = parse(chains);
    var result = evaluate(last(parsed), Math.min(args.length, 2), args[0], args[1]);
    if (settings.ioj_off) {

    } else if (settings.ioj_newline) {
      if (result.type != "sequence") result = yunoify([...to_real_str(result)]);
      var max = result.length === undefined ? settings.capten ? 11 : Infinity : result.length;
      for (var x = 1; x < max; x++) {
        yuno_output(result.call(x));
        print("\n");
      }
      if (result.length) {
        yuno_output(result.call(result.length));
      } else if (result.length === undefined) {
        print("...");
      }
    } else if (settings.ioj_space) {
      if (result.type != "sequence") result = yunoify([...to_real_str(result)]);
      var max = result.length === undefined ? settings.capten ? 11 : Infinity : result.length;
      for (var x = 1; x < max; x++) {
        yuno_output(result.call(x));
        print(" ");
      }
      if (result.length) {
        yuno_output(result.call(result.length));
      } else if (result.length === undefined) {
        print("...");
      }
    } else {
      yuno_output(result);
    }
  } catch (e) {
    error(e.toString() + "\n");
    throw e;
  }
}
