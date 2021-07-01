def reduce(function, iterable, initial = None, default = None):
    if isinstance(iterable, list):
        if iterable == []:
            if initial is None:
                return default
            return initial
        if initial is None:
            initial = iterable[0]
            for item in iterable[1:]:
                initial = function(initial, item)
        else:
            for item in iterable:
                initial = function(initial, item)
        return initial
    else:
        raise RuntimeError("cannot reduce non-list or infinite list")

def pairwise(function, iterable, arity = 2):
    f = (lambda x: function(*x)) if arity == 2 else function if arity == 1 else (lambda x: function())
    if isinstance(iterable, list):
        return map(f, transform([iterable[:-1], iterable[1:]]))
    else:
        return sequence(lambda i: f([iterable[i], iterable[i + 1]]))

def cartesian_product(x, y, f):
    x = make_iterable(x, make_range = True)
    y = make_iterable(y, make_range = True)
    return map(lambda a: map(lambda b: f(a, b), y), x)

def _to_base(x, y, bijective = False):
    if y == 0:
        return [x]
    if x == 0:
        return [0]
    if y == -1:
        digits = [1, 0] * x
        return digits[:-1] if x > 0 else digits
    sign = -1 if x < 0 and y > 0 else 1
    x *= sign
    if y == 1:
        return [sign] * x
    digits = []
    while x:
        x -= bijective
        x, digit = divmod(x, y)
        digit += bijective
        if digit < 0:
            x += 1
            digit -= y
        digits.append(sign * digit)
    return digits[::-1]

def to_base(x, y, bijective = False):
    x = real_part(x)
    y = real_part(y)
    partial = _to_base(int(x), y, bijective)
    partial[-1] += x - int(x)
    return partial

def ynrange(x, method = None):
    if method is None:
        method = "lower" if "D" in flags else "outer" if "O" in flags else "inner" if "I" in flags else "upper"
    re, im = map(int, reim(x))
    if im == 0:
        if   re ==  sympy.oo: return sequence(lambda x:  x) if method in ["lower", "outer"] else sequence(lambda x:  x + 1)
        elif re == -sympy.oo: return sequence(lambda x: -x) if method in ["upper", "outer"] else sequence(lambda x: -x - 1)
        elif re >= 1        : return list(range( 0 if method in ["lower", "outer"] else 1, int(re) + ( 1 if method in ["upper", "outer"] else 0)    ))
        else                : return list(range(-1 if method in ["lower", "inner"] else 0, int(re) + (-1 if method in ["lower", "outer"] else 0), -1))
    elif re == 0:
        return [sympy.I * a for a in ynrange(im)]
    else:
        return cartesian_product(ynrange(re), ynrange(im * sympy.I), add)

def char_range(x, y):
    return map(cpchr, arbitrary_range(codepage.find(x), codepage.find(y), False, False))

def arbitrary_range(x, y, exclude_left, exclude_right):
    a, b = map(int, reim(x))
    x, y = map(int, reim(y))
    if b == y:
        r = list(range(a, x, 1 if x > a else -1))
        if exclude_left:
            r.pop(0)
        if not exclude_right:
            r.append(x)
        return [k + b * sympy.I for k in r]
    elif a == x:
        r = list(range(b, y, 1 if y > b else -1))
        if exclude_left:
            r.pop(0)
        if not exclude_right:
            r.append(y)
        return [k * sympy.I + a for k in r]
    return cartesian_product(arbitrary_range(a, x, exclude_left, exclude_right), arbitrary_range(b, y, exclude_left, exclude_right), verbs["+"].call)

def format_grid(x, join_lines, join_rows, left = False):
    x = make_iterable(x, singleton = True)
    if isinstance(x, list):
        if all(isinstance(a, list) for a in x):
            lines = []
            maxlength = 0
            flat = True
            for y in x:
                if isinstance(y, list):
                    flat = False
                    lines.append([])
                    for z in map(to_str, y):
                        maxlength = max(maxlength, len(z))
                        lines[-1].append(z)
                else:
                    z = str(y)
                    maxlength = max(maxlength, len(z))
                    lines.append([z])
            lines = [[(lambda fill: val + fill if left else fill + val)(" " * (maxlength - len(val))) for val in line] for line in lines]
            if join_lines:
                lines = map(" ".join, lines)
                if join_rows:
                    return list((" " if flat else "\n").join(lines))
                return map(list, lines)
            return [map(list, line) for line in lines]

    raise RuntimeError("Cannot format infinite sequences into grids")
