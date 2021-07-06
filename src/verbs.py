@Verb("Σ", arity = 1)
def ysum(x):
    return reduce(verbs["+"].call, make_iterable(x, singleton = True), default = 0)

@Verb("½", arity = 1, ldepth = 1, lstr_obj = True)
def square_root(x):
    if is_str(x):
        raise RuntimeError("`½` not implemented on str")
    return sympy.sqrt(x)

@Verb("β", arity = 2, ldepth = 1, rdepth = 0)
def yfrombase(x, y):
    x = make_iterable(x, singleton = True)
    y = numify(y)
    if x and is_str(x):
        return from_base(["0123456789abcdefghijklmnopqrstuvwxyz".find(v.lower()) for v in x], y)
    else:
        return from_base(x, y)

@Verb("ι", arity = 1, ldepth = 0)
def upper_range(x):
    if isinstance(x, str):
        return char_range("A", x)
    return ynrange(x, "upper")

@Verb("!", arity = 1, ldepth = 0, lstr_obj = True)
def factorial(x):
    if is_str(x):
        length = math.ceil(math.sqrt(len(x)))
        x += [" "] * (length ** 2 - len(x))
        result = []
        for i in range(0, length ** 2, length):
            result.append(x[i:i + length])
        return result
    return sympy.gamma(x + 1)

@Verb("%", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def modulo(x, y):
    x = numify(x)
    y = numify(y)
    if is_str(x):
        if is_str(y):
            raise RuntimeError("`%` not implemented on str, str")
        else:
            raise RuntimeError("`%` not implemented on num, str")
    else:
        if is_str(y):
            raise RuntimeError("`%` not implemented on str, num")
        else:
            return x % y

@Verb("&", arity = 2, ldepth = 0, rdepth = 0)
def bitwise_and(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            raise RuntimeError("`&` not implemented on chr, chr")
        else:
            raise RuntimeError("`&` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`&` not implemented num, chr")
        else:
            x = int(reim(x)[0])
            y = int(reim(y)[0])
            return x & y

@Verb("*", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def exponentiate(x, y):
    x = numify(x)
    y = numify(y)
    if is_str(x):
        if is_str(y):
            raise RuntimeError("`*` not implemented on str, str")
        else:
            raise RuntimeError("`*` not implemented on num, str")
    else:
        if is_str(y):
            raise RuntimeError("`*` not implemented on str, num")
        else:
            return x ** y

@Verb("+", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def add(x, y):
    x = numify(x)
    y = numify(y)
    if is_str(x):
        if is_str(y):
            return x + y
        else:
            return x + list(str(y))
    else:
        if is_str(y):
            return list(str(x)) + y
        else:
            return x + y

@Verb(",", arity = 2)
def pair(x, y):
    return [x, y]

@Verb(":", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def exponentiate(x, y):
    x = numify(x)
    y = numify(y)
    if is_str(x):
        if is_str(y):
            raise RuntimeError("`:` not implemented on str, str")
        else:
            raise RuntimeError("`:` not implemented on num, str")
    else:
        if is_str(y):
            raise RuntimeError("`:` not implemented on str, num")
        else:
            if y == 0:
                return 1 if x == 0 else 0
            return x // y

@Verb(";", arity = 2)
def concatenate(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    if isinstance(x, sequence):
        return x # we can just pretend to concatenate because you can't access beyond infinity anyway
    if isinstance(y, sequence):
        return sequence(lambda i: y(i) if i < 0 else x[i] if i < len(x) else y(i - len(x)))
    return x + y

@Verb("<", arity = 2, ldepth = 0, rdepth = 0)
def less_than(x, y):
    return b2i(numify(x) < numify(y))

@Verb("=", arity = 2, ldepth = 0, rdepth = 0)
def is_equal(x, y):
    return b2i(x == y)

@Verb(">", arity = 2, ldepth = 0, rdepth = 0)
def greater_than(x, y):
    return b2i(numify(x) > numify(y))

@Verb("A", arity = 1, ldepth = 0)
def absolute_value(x):
    if isinstance(x, str):
        return x.upper()
    return abs(x)

@Verb("B", arity = 1, ldepth = 0, lstr_obj = True)
def to_binary(x):
    if isinstance(x, str):
        raise RuntimeError("`B` not implemented on str")
    return to_base(x, sympy.Integer(2))

@Verb("ɮ", arity = 1, ldepth = 1)
def from_binary(x):
    if any(isinstance(k, str) for k in x):
        raise RuntimeError("`ɮ` not implemented on str")
    return from_base(x, sympy.Integer(2))

@Verb("C", arity = 1, ldepth = 0)
def complement(x):
    if isinstance(x, str):
        return x.swapcase()
    return 1 - x

@Verb("D", arity = 1, ldepth = 0, lstr_obj = True)
def to_decimal(x):
    if isinstance(x, str):
        raise RuntimeError("`D` not implemented on str")
    return to_base(x, sympy.Integer(10))

@Verb("E", arity = 1)
def all_equal(x):
    x = make_iterable(x, string = True)
    return b2i(x == [] or all(k == x[0] for k in x[1:]))

@Verb("F", arity = 1)
def flatten(x):
    if not isinstance(x, (list, sequence)):
        return [x]
    return reduce(concatenate, map(flatten, x), []) if isinstance(x, list) else flat_sequence(x)

@Verb("G", arity = 1)
def group_indices(x):
    x = make_iterable(x, singleton = True)
    if isinstance(x, list):
        groups = []
        groupkeys = []
        for i, k in enumerate(x):
            if k in groupkeys:
                groups[groupkeys.index(k)].append(i)
            else:
                groupkeys.append(k)
                groups.append([i])
        return groups
    else:
        raise RuntimeError("`G` not implemented on sequence")

@Verb("H", arity = 1, ldepth = 0, lstr_obj = True)
def halve(x):
    if isinstance(x, list):
        return [x[:-(-len(x) // 2)], x[len(x) // 2:]]
    return x / sympy.Integer(2)

@Verb("I", arity = 1, ldepth = 1)
def increments(x):
    return pairwise(lambda x, y: verbs["_"].call(y, x), x)

@Verb("J", arity = 1)
def length_range(x):
    if isinstance(x, list):
        return list(range(oneindex, len(x) + oneindex))
    elif isinstance(x, sequence):
        return sequence(lambda x: x + oneindex)
    else:
        return [b2i(oneindex)]

@Verb("L", arity = 1)
def length_range(x):
    if isinstance(x, list):
        return len(x)
    elif isinstance(x, sequence):
        return infinity
    else:
        return 1

@Verb("N", arity = 1, ldepth = 0)
def negate(x):
    if isinstance(x, str):
        raise RuntimeError("`N` not implemented on chr")
    return -x

@Verb("O", arity = 1, ldepth = 0)
def ordchr(x):
    if isinstance(x, str):
        return ord(x)
    else:
        return chr(int(real_part(x)))

@Verb("P", arity = 1, ldepth = 0)
def primeq(x):
    if isinstance(x, str):
        raise RuntimeError("`P` not implemented on chr")
    return b2i(sympy.isprime(x))

@Verb("Q", arity = 1)
def uniquify(x):
    x = make_iterable(x, singleton = True)
    if isinstance(x, list):
        output = []
        for a in x:
            if a not in output:
                output.append(a)
        return output
    else:
        return unique_sequence(x)

@Verb("R", arity = 1)
def flat_reverse(x):
    return make_iterable(x, singleton = True)[::-1]

@Verb("T", arity = 1)
def truthy_indices(x):
    x = make_iterable(x, make_range = True, method = "lower")
    return map(lambda a: a[0], filter(lambda a: a[1], enumerate(x)))

@Verb("U", arity = 1, ldepth = 1)
def upend(x):
    x = make_iterable(x, singleton = True)
    return x[::-1]

@Verb("W", arity = 1)
def wrap(x):
    return [x]

@Verb("Z", arity = 1)
def matrix_transform(x):
    if isinstance(x, (list, sequence)):
        return transform(x)
    else:
        return [[x]]

@Verb("^", arity = 2, ldepth = 0, rdepth = 0)
def bitwise_xor(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            raise RuntimeError("`^` not implemented on chr, chr")
        else:
            raise RuntimeError("`^` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`^` not implemented num, chr")
        else:
            x = int(reim(x)[0])
            y = int(reim(y)[0])
            return x ^ y

@Verb("|", arity = 2, ldepth = 0, rdepth = 0)
def bitwise_or(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            raise RuntimeError("`|` not implemented on chr, chr")
        else:
            raise RuntimeError("`|` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`|` not implemented num, chr")
        else:
            x = int(reim(x)[0])
            y = int(reim(y)[0])
            return x | y

@Verb("~", arity = 1, ldepth = 0)
def bitwise_not(x):
    if isinstance(x, str):
        raise RuntimeError("`~` not implemented on chr")
    return -1 - x

@Verb("_", arity = 2, ldepth = 0, rdepth = 0)
def subtract(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            return codepage.find(x) - codepage.find(y)
        else:
            return cpchr(codepage.find(x) - y)
    else:
        if isinstance(y, str):
            return cpchr(codepage.find(y) + x)
        else:
            return x - y

@Verb("a", arity = 2, ldepth = 0, rdepth = 0)
def logical_and(x, y):
    return x and y

@Verb("b", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def ytobase(x, y):
    if isinstance(x, str):
        x = [x]
    if isinstance(y, str):
        y = [y]
    if isinstance(x, list):
        if isinstance(y, list):
            raise RuntimeError("`b` not implemented on str, str")
        else:
            return ytobase(y, x)
    else:
        if isinstance(y, list):
            return map(lambda a: y[int(a)], to_base(x, len(y)))
        else:
            return to_base(x, y)

@Verb("c", arity = 2)
def count_occurrences(x, y):
    x = make_iterable(x, singleton = True)
    if isinstance(x, list):
        return x.count(y)
    else:
        raise RuntimeError("cannot count occurrences in an infinite sequence")

@Verb("ɔ", arity = 2)
def advanced_count(x, y, k = 1):
    if isinstance(x, (list, sequence)):
        return x.count(y) + max(advanced_count(k, y, 0) for k in x)
    else:
        return k

@Verb("d", arity = 2, ldepth = 0, rdepth = 0)
def div_mod(x, y):
    return [verbs[":"].call(x, y), verbs["%"].call(x, y)]

@Verb("e", arity = 2)
def occurs_in(x, y):
    y = make_iterable(y, singleton = True)
    return b2i(x in y)

@Verb("f", arity = 2)
def filter_positive(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    return filter(lambda k: k in y, x)

@Verb("ɟ", arity = 2)
def filter_negative(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    return filter(lambda k: k not in y, x)

@Verb("g", arity = 2, ldepth = 0, rdepth = 0)
def gcd_dyad(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            raise RuntimeError("`g` not implemented on chr, chr")
        else:
            raise RuntimeError("`g` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`g` not implemented num, chr")
        else:
            return sympy.gcd(x, y)

@Verb("i", arity = 2)
def index_of(x, y):
    for index, element in enumerate(x):
        if element == y:
            return index
    return oneindex - 1

@Verb("j", arity = 2)
def join(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    if isinstance(x, list):
        if isinstance(y, list):
            output = make_iterable(x[0], singleton = True)
            for k in x[1:]:
                output.extend(y)
                output.extend(make_iterable(k, singleton = True))
            return output
        else:
            return verbs[";"].call(x[0], y)
    else:
        return join_sequence(x, y)

@Verb("l", arity = 2, ldepth = 0, rdepth = 0)
def lcm_dyad(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            raise RuntimeError("`l` not implemented on chr, chr")
        else:
            raise RuntimeError("`l` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`l` not implemented num, chr")
        else:
            return sympy.lcm(x, y)

@Verb("m", arity = 2, rdepth = 0)
def modular(x, y):
    x = make_iterable(x, singleton = True)
    if isinstance(y, str):
        raise RuntimeError("`m` not implemented on any, chr")
    else:
        y = int(reim(y)[0])
        return x[::y]

@Verb("n", arity = 2, ldepth = 0, rdepth = 0)
def is_unequal(x, y):
    return b2i(x != y)

@Verb("o", arity = 2, ldepth = 0, rdepth = 0)
def logical_or(x, y):
    return x or y

@Verb("p", arity = 2)
def cproduct_dyad(x, y):
    x = make_iterable(x, make_range = True)
    y = make_iterable(y, make_range = True)
    if isinstance(x, list):
        if isinstance(y, list):
            return [[a, b] for a in x for b in y]
        else:
            return sequence(lambda i: [x[i % len(x)], y[i // len(x)]])
    else:
        if isinstance(y, list):
            return sequence(lambda i: [x[i // len(y)], y[i % len(y)]])
        else:
            return sequence(lambda i: (lambda a, b: [x[a], y[b]])(*cantor_unpair(i)))

@Verb("r", arity = 2, ldepth = 0, rdepth = 0)
def inclusive_range(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            return map(cpchr, arbitrary_range(codepage.find(x), codepage.find(y), False, False))
        else:
            raise RuntimeError("`r` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`r` not implemented on num, chr")
        else:
            return arbitrary_range(x, y, False, False)

@Verb("s", arity = 2, rdepth = 0)
def slice_into_length(x, y):
    x = make_iterable(x, make_range = True)
    y = int(reim(y)[0])
    if isinstance(y, str):
        raise RuntimeError("`s` not implemented on any, chr")
    else:
        if isinstance(x, list):
            if y > 0:
                return [x[i:i + y] for i in range(0, len(x), y)]
            elif y < 0:
                return [x[:i] + x[i - y:] for i in range(0, len(x), -y)]
            else:
                raise RuntimeError("cannot slice list into blocks of length 0")
        else:
            if y > 0:
                return sequence(lambda i: x[i * y:i * y + y])
            elif y < 0:
                return sequence(lambda i: sequence(lambda j: x[j] if j < i * -y else j - y + 1))
            else:
                raise RuntimeError("cannot slice infinite sequence into blocks of length 0")

@Verb("u", arity = 2)
def jelly_mapping(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    if isinstance(x, sequence) or any(isinstance(k, sequence) for k in x[::2]):
        raise RuntimeError("cannot use a sequence as the source in a mapping")
    filter_out = []
    mapsrc = []
    mapdes = []
    nms = []
    nmd = []
    if len(x) % 2:
        filter_out = make_iterable(x[-1], singleton = True)
    for i in range(len(x) // 2):
        i *= 2
        src = make_iterable(x[i], singleton = True)
        des = make_iterable(x[i + 1], singleton = True)
        if isinstance(des, sequence):
            des = [des]
        if len(des) == 0:
            raise RuntimeError("cannot map into a blank destination")
        for a, b in zip(src, des + [des[-1]] * (len(src) - len(des))):
            if a in mapdes:
                mapdes[mapdes.index(a)] = b
            nms.append(a)
            nmd.append(b)
        mapsrc += nms
        mapdes += nmd
    if isinstance(y, list):
        return [mapdes[mapsrc.index(k)] if k in mapsrc else k for k in y]
    else:
        if filter_out:
            return map(lambda k: mapdes[mapsrc.index(k)] if k in mapsrc else k, filter(lambda k: k not in filter_out, y))

@Verb("v", arity = 2)
def sublist_mapping(x, y):
    x = make_iterable(x, singleton = True)
    y = make_iterable(y, singleton = True)
    if isinstance(x, sequence) or any(isinstance(k, sequence) for k in x[::2]):
        raise RuntimeError("cannot use a sequence as the source in a mapping")
    filter_out = []
    mapsrc = []
    mapdes = []
    if len(x) % 2:
        filter_out = make_iterable(x[-1], singleton = True)
    for i in range(len(x) // 2):
        i *= 2
        mapsrc.append(make_iterable(x[i], singleton = True))
        mapdes.append(make_iterable(x[i + 1], singleton = True))
    if isinstance(y, list):
        output = []
        while y:
            if filter_out and y[:len(filter_out)] == filter_out:
                y = y[:len(filter_out)]
            else:
                for i in range(len(mapsrc)):
                    k = mapsrc[i]
                    if y[:len(k)] == k:
                        output = verbs[";"].call(output, mapdes[i])
                        y = y[len(k):]
                        break
                else:
                    output.append(y.pop(0))
            if isinstance(output, sequence):
                break
        return output
    else:
        raise RuntimeError("sublist filter/mapping for infinite sequences is annoying. if you really need this, go bug hyper-neutrino to implement it; I'm too lazy")

@Verb("x", arity = 2, rdepth = 0)
def inplace_repeat(x, y):
    x = make_iterable(x, make_range = True)
    y = int(reim(y)[0])
    if isinstance(x, list):
        output = []
        for k in x:
            if isinstance(k, (list, sequence)):
                output.append(inplace_repeat(k, y))
            else:
                output.extend([k] * y)
        return output
    else:
        return repeater_sequence(x, y)

@Verb("z", arity = 2)
def zip_with_filler(x, y):
    x = map(lambda k: make_iterable(k, singleton = True), make_iterable(x, singleton = True))
    if isinstance(x, list):
        if all(isinstance(k, list) for k in x):
            ml = max(map(len, x))
            x = [k + [y] * (ml - len(k)) for k in x]
            return transform(x)
        else:
            x = [(lambda a = a: sequence(lambda i: a[i] if isinstance(a, sequence) or 0 <= i < len(a) else y))() for a in x]
            return transform(x)

@Verb("⁼", arity = 2)
def equal_flat(x, y):
    return b2i(x == y)

@Verb("⁻", arity = 2)
def unequal_flat(x, y):
    return b2i(x != y)

@Verb("ɐ", arity = 2)
def sublist_index(x, y):
    x = make_iterable(x, make_range = True)
    y = make_iterable(y, make_range = True)

    if isinstance(y, sequence):
        raise RuntimeError("cannot sublist index find a sequence")

    if isinstance(x, list) and len(y) > len(x):
        return 0

    block = x[:len(y)]
    index = 0

    for k in x[len(y):]:
        if block == y:
            return index + oneindex
        block.pop(0)
        block.append(k)
        index += 1

    if block == y:
        return index + oneindex

    return oneindex - 1

@Verb("ɨ", arity = 2, ldepth = 0)
def index_into(x, y):
    if isinstance(x, str):
        raise RuntimeError("`ɨ` not implemented for chr, any")
    y = make_iterable(y, singleton = True)
    re, im = reim(x)
    if im == 0:
        if re % 1 == 0:
            if isinstance(y, list):
                return y[(int(re) - oneindex) % len(y)]
            return y[int(re) - oneindex]
        k = float(re)
        return [index_into(math.floor(k), y), index_into(math.ceil(k), y)]
    else:
        return [index_into(re, y), index_into(im, y)]

@Verb("ɲ", arity = 2)
def left_argument(x, y):
    return x

@Verb("ɳ", arity = 2)
def right_argument(x, y):
    return y

@Verb("ɵE", arity = 0)
def yuno_eval_input():
    return evaluate(parse(tokenize(input()))[-1], 0)

@Verb("ɵG", arity = 1)
def format_grid_multiline_right(x):
    return format_grid(x, True, True)

@Verb("ɵH", arity = 1)
def format_grid_multiline_left(x):
    return format_grid(x, True, True, True)

@Verb("ɵI", arity = 0)
def raw_input():
    return list(input())

@Verb("ɵK", arity = 1)
def join_on_space(x):
    if isinstance(x, list):
        return list(" ".join(map(to_str, x)))
    elif isinstance(x, sequence):
        raise RuntimeError("cannot join infinite sequences")
    else:
        return list(to_str(x))

@Verb("ɵN", arity = 1)
def output_with_newline(x):
    yuno_output(x, end = "\n")
    return x

@Verb("ɵV", arity = 1)
def yneval(x):
    chains = tokenize(to_str(x))
    parsed = parse(chains)
    return evaluate(parsed[-1], 0)

@Verb("ɵX", arity = 1)
def ynrandom(x):
    if isinstance(x, str):
        raise RuntimeError("`ɵX` not implemented on chr")
    elif isinstance(x, list):
        return random.choice(x)
    elif isinstance(x, sequence):
        return map(ynrandom, x)
    else:
        x = int(reim(x)[0])
        if x > 0:
            return random.randint(1, x)
        else:
            return random.randint(x, 0)

@Verb("ɵY", arity = 1)
def join_on_newline(x):
    if isinstance(x, list):
        return list("\n".join(map(to_str, x)))
    elif isinstance(x, sequence):
        raise RuntimeError("cannot join infinite sequences")
    else:
        return list(to_str(x))

@Verb("ɵ_", arity = 1)
def output_without_newline(x):
    yuno_output(x)
    return x

@Verb("ɵʛ", arity = 1)
def format_grid_rows_right(x):
    return format_grid(x, True, False)

@Verb("ɵɢ", arity = 1)
def format_grid_matrix_right(x):
    return format_grid(x, False, False)

@Verb("ɵʜ", arity = 1)
def format_grid_matrix_left(x):
    return format_grid(x, False, False, True)

@Verb("ɵի", arity = 1)
def format_grid_rows_left(x):
    format_grid(x, True, False, True)

@Verb("ɹ", arity = 2, ldepth = 0, rdepth = 0)
def exclusive_range(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            x = codepage.find(x)
            y = codepage.find(y)
            return map(cpchr, arbitrary_range(x if x > y else x + 256, y + 256 if x > y else y, False, False))
        else:
            raise RuntimeError("`ɹ` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`ɹ` not implemented on num, chr")
        else:
            return arbitrary_range(x, y, True, True)

@Verb("ɻ", arity = 2, ldepth = 0, rdepth = 0)
def left_exclusive_range(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            x = codepage.find(x)
            y = codepage.find(y)
            return map(cpchr, arbitrary_range(x if x > y else x + 256, y, False, False))
        else:
            raise RuntimeError("`ɻ` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`ɻ` not implemented on num, chr")
        else:
            return arbitrary_range(x, y, True, False)

@Verb("ɽ", arity = 2, ldepth = 0, rdepth = 0)
def right_exclusive_range(x, y):
    if isinstance(x, str):
        if isinstance(y, str):
            x = codepage.find(x)
            y = codepage.find(y)
            return map(cpchr, arbitrary_range(x, y + 256 if x > y else y, False, False))
        else:
            raise RuntimeError("`ɽ` not implemented on chr, num")
    else:
        if isinstance(y, str):
            raise RuntimeError("`ɽ` not implemented on num, chr")
        else:
            return arbitrary_range(x, y, False, True)

@Verb("ɾ", arity = 1, ldepth = 0)
def outer_range(x):
    if isinstance(x, str):
        return char_range("Γ", x)
    return ynrange(x, "outer")

@Verb("ʁ", arity = 1, ldepth = 0)
def inner_range(x):
    if isinstance(x, str):
        return char_range("!", x)
    return ynrange(x, "inner")

@Verb("ᴀ<", arity = 2)
def flat_lt(x, y):
    return b2i(x < y)

@Verb("ᴀ>", arity = 2)
def flat_gt(x, y):
    return b2i(x > y)

@Verb("ᴀM", arity = 1)
def max_mask(x):
    x = make_iterable(x, make_range = True)
    if isinstance(x, sequence):
        raise RuntimeError("cannot get maximum of an infinite sequence")
    maximum = max(x)
    return [1 if k == maximum else 0 for k in x]

@Verb("ᴀR", arity = 1, ldepth = 0)
def mirrored_range(x):
    if isinstance(x, str):
        raise RuntimeError("`ᴀR` not implemented on chr")
    return arbitrary_range(-x, x, False, False)

@Verb("ᴀa", arity = 2)
class arithmetic_sequence(sequence):
    def __init__(self, x, y):
        sequence.__init__(self, self.func)
        self.x = x
        self.y = y
        self.forward = [x]
        self.backward = [x]
    def func(self, index):
        if index < 0:
            while len(self.backward) <= -index:
                self.backward.append(verbs["_"].call(self.backward[-1], self.y))
            return self.backward[-index]
        else:
            while len(self.forward) <= index:
                self.forward.append(verbs["+"].call(self.forward[-1], self.y))
            return self.forward[index]

@Verb("ᴀg", arity = 2)
class geometric_sequence(sequence):
    def __init__(self, x, y):
        sequence.__init__(self, self.func)
        self.x = x
        self.y = y
        self.forward = [x]
        self.backward = [x]
    def func(self, index):
        if index < 0:
            while len(self.backward) <= -index:
                self.backward.append(verbs["÷"].call(self.backward[-1], self.y))
            return self.backward[-index]
        else:
            while len(self.forward) <= index:
                self.forward.append(verbs["×"].call(self.forward[-1], self.y))
            return self.forward[index]

@Verb("ᴀᴍ", arity = 1)
def min_mask(x):
    x = make_iterable(x, make_range = True)
    if isinstance(x, sequence):
        raise RuntimeError("cannot get minimum of an infinite sequence")
    minimum = min(x)
    return [1 if k == minimum else 0 for k in x]

@Verb("ᴀ«", arity = 2)
def flat_le(x, y):
    return b2i(x <= y)

@Verb("ᴀ»", arity = 2)
def flat_ge(x, y):
    return b2i(x >= y)

@Verb("ᴍ<", arity = 2, ldepth = 0, rdepth = 0)
def leq(x, y):
    return b2i(x <= y)

@Verb("ᴍ>", arity = 2, ldepth = 0, rdepth = 0)
def geq(x, y):
    return b2i(x >= y)

@Verb("ᴍC", arity = 1, ldepth = 0)
def force_chr(x):
    if isinstance(x, str):
        return x
    return cpchr(x)

@Verb("ᴍO", arity = 1, ldepth = 0)
def force_ord(x):
    if isinstance(x, str):
        return codepage.find(x)
    return x

@Verb("ᴍX", arity = 0)
def randfloat():
    return sympy.Rational(random.random())

@Verb("ᴅ", arity = 1)
def depth(x):
    if isinstance(x, sequence):
        return x.depth if "depth" in dir(x) else 1
    elif isinstance(x, list):
        return 1 + max(map(depth, x), default = 0)
    else:
        return 0

@Verb("ᴘ", arity = 1)
def yproduct(x):
    return reduce(verbs["×"].call, make_iterable(x, singleton = True), default = 1)

@Verb("ʀ", arity = 1, ldepth = 0)
def lower_range(x):
    if isinstance(x, str):
        return char_range("a", x)
    return ynrange(x, "lower")

@Verb("¹", arity = 1)
def identity(x):
    return x

@Verb("²", arity = 1, ldepth = 0, lstr_obj = True)
def square(x):
    if is_str(x):
        length = -(-len(x) // 4)
        result = [[" "] * (length + 1) for _ in range(length + 1)]
        x += [" "] * 3
        for i in range(length):
            result[0][i] = x[i]
        for i in range(length):
            result[i][-1] = x[i + length]
        for i in range(length):
            result[-1][~i] = x[i + length * 2]
        for i in range(length):
            result[~i][0] = x[i + length * 3]
        return list("\n".join(map("".join, result)))
    return x ** 2

@Verb("×", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def mul(x, y):
    x = numify(x)
    y = numify(y)
    if is_str(x):
        if is_str(y):
            return [a + y for a in x]
        else:
            return x + [" "] * (y - len(x))
    else:
        if is_str(y):
            return [" "] * (x - len(y)) + y
        else:
            return x * y

@Verb("÷", arity = 2, ldepth = 0, rdepth = 0, lstr_obj = True, rstr_obj = True)
def div(x, y):
    x = ch2s(x)
    y = ch2s(y)
    if is_str(x):
        if is_str(y):
            match = re.match("".join(y), "".join(x))
            return match.group() if match else []
        else:
            x = "".join(x).split("\n")
            result = []
            for a in x:
                for i in range(0, len(a), y):
                    result.append(list(a[i:i + y]))
            return result
    else:
        if is_str(y):
            return div(y, x)
        else:
            return x / y

@Verb("¬", arity = 1, ldepth = 0)
def logical_not(x):
    return b2i(not x)

@Verb("‘", arity = 1, ldepth = 0, lstr_obj = True)
def decrement(x):
    if isinstance(x, str):
        return cpchr(codepage.find(x) - 1)
    elif is_str(x):
        if x == ["Γ"]:
            return []
        elif x[-1] == "Γ":
            return decrement(x[:-1], True) + ["”"]
        else:
            return x[:-1] + [cpchr(codepage.find(x[-1]) - 1)]
    else:
        return x - 1

@Verb("’", arity = 1, ldepth = 0, lstr_obj = True)
def increment(x):
    if isinstance(x, str):
        return cpchr(codepage.find(x) + 1)
    elif is_str(x):
        if x == ["”"]:
            return ["Γ", "Γ"]
        elif x[-1] == "”":
            return increment(x[:-1], True) + ["Γ"]
        else:
            return x[:-1] + [cpchr(codepage.find(x[-1]) + 1)]
    else:
        return x + 1

@Verb("«", arity = 2, ldepth = 0, rdepth = 0)
def minimum_between(x, y):
    return min(x, y)

@Verb("»", arity = 2, ldepth = 0, rdepth = 0)
def maximum_between(x, y):
    return max(x, y)

for x in "³⁴⁵⁶⁷⁸⁹αω":
    Verb(x, arity = 0)(lambda: 0)
