import math
import random
import re
import sympy
import sys

sys.setrecursionlimit(10 ** 9)

DEFAULT_VECTORIZATION_STRATEGY = "overflow"
SEQUENCE_MEMOIZATION = True

flags = sys.argv[1]

zeroindex = "0" in flags
oneindex = "0" not in flags

infinity = sympy.oo

def debug(*a, **k):
    if "v" in flags:
        print(*a, **k, file = sys.stderr)

class attrdict(dict):
	def __init__(self, *args, **kwargs):
		dict.__init__(self, *args, **kwargs)
		self.__dict__ = self

class trampoline:
    def __init__(self, link, arguments):
        self.link = link
        self.arguments = arguments
    def eval(self):
        return evaluate(self.link, len(self.arguments), *self.arguments)
    def __str__(self):
        print("A trampoline object was stringified. Unless you are debugging, this is likely an error.", file = sys.stderr)
        return "[trampoline - %s]" % " - ".join([str(self.link), *map(str, self.arguments)])

class sequence:
    def __init__(self, func, depth = 1):
        self.func = func
        self.cache = {}
        self.depth = depth
        self.iterpos = 0
    def __getitem__(self, key):
        if isinstance(key, slice):
            start = key.start
            end = key.stop
            step = key.step or 1
            if start is None:
                if end is None:
                    return sequence(lambda x: self.func(x * step))
                else:
                    start = 0
            elif end is None:
                return sequence(lambda x: self.func(start + x * step))
            return map(self, list(range(start, end, step)))
        else:
            return self(key)
    def __call__(self, x):
        if SEQUENCE_MEMOIZATION and x in self.cache:
            return self.cache[x]
        if SEQUENCE_MEMOIZATION:
            self.cache[x] = self.func(x)
            return self.cache[x]
        return self.func(x)
    def __iter__(self):
        return self
    def __next__(self):
        self.iterpos += 1
        return self[self.iterpos - 1]

class flat_sequence(sequence):
    def __init__(self, seq):
        sequence.__init__(self, self.func)
        self.seq = seq
        self.found = []
        self.stack = [[-1, seq]]
    def func(self, index):
        if index < 0:
            raise RuntimeError("cannot get elements left of the origin of a flattened list")
        while len(self.found) <= index:
            if len(self.stack) == 0:
                self.found.append(0)
                continue
            while True:
                self.stack[-1][0] += 1
                while self.stack and isinstance(self.stack[-1][1], list) and self.stack[-1][0] >= len(self.stack[-1][1]):
                    self.stack.pop()
                    if self.stack:
                        self.stack[-1][0] += 1
                if self.stack == []:
                    break
                while isinstance(self.stack[-1][1], (list, sequence)):
                    if isinstance(self.stack[-1][1], list) and len(self.stack[-1][1]) == 0:
                        self.stack.pop()
                        break
                    self.stack.append([0, self.stack[-1][1][self.stack[-1][0]]])
                else:
                    break
            self.found.append(self.stack.pop()[1] if self.stack else 0)
        return self.found[index]

class transform_sequence(sequence):
    def __init__(self, seq, column):
        sequence.__init__(self, self.func)
        self.seq = seq
        self.column = column
        self.forward = []
        self.backward = []
        self.fscan = 0
        self.bscan = -1
    def func(self, index):
        if index < 0:
            while len(self.backward) < -index:
                if isinstance(self.seq[self.bscan], sequence) or 0 <= self.column < len(self.seq[self.bscan]):
                    self.backward.append(self.seq[self.bscan][self.column])
                self.bscan -= 1
            return self.backward[~index]
        else:
            while len(self.forward) <= index:
                if isinstance(self.seq[self.fscan], sequence) or 0 <= self.column < len(self.seq[self.fscan]):
                    self.forward.append(self.seq[self.fscan][self.column])
                self.fscan += 1
            return self.forward[index]

class unique_sequence(sequence):
    def __init__(self, seq):
        sequence.__init__(self, self.func)
        self.seq = seq
        self.found = []
        self.scan = 0
    def func(self, index):
        if index < 0:
            raise RuntimeError("cannot get elements left of the origin of a uniquified sequence")
        while len(self.found) <= index:
            value = self.seq[self.scan]
            if value not in self.found:
                self.found.append(value)
            self.scan += 1
        return self.found[index]

class filter_sequence(sequence):
    def __init__(self, f, seq):
        sequence.__init__(self, self.func)
        self.seq = seq
        self.f = f
        self.forward = []
        self.backward = []
        self.fscan = 0
        self.bscan = -1
    def func(self, index):
        if index < 0:
            while len(self.backward) < -index:
                value = self.seq[self.bscan]
                if self.f(value):
                    self.backward.append(value)
                self.bscan -= 1
            return self.backward[~index]
        else:
            while len(self.forward) <= index:
                value = self.seq[self.fscan]
                if self.f(value):
                    self.forward.append(value)
                self.fscan += 1
            return self.forward[index]

class cumulative_reduce_sequence(sequence):
    def __init__(self, f, seq):
        sequence.__init__(self, self.func)
        self.seq = seq
        self.f = f
        self.found = [seq[0]]
        self.fscan = 1
    def func(self, index):
        if index < 0:
            raise RuntimeError("cannot get elements left of origin of a cumulative reduce sequence")
        else:
            while len(self.found) <= index:
                self.found.append(self.f(self.found[-1], self.seq[self.fscan]))
                self.fscan += 1
            return self.found[index]

def yunoify(value, deep = True):
    if not isinstance(value, list) and not deep or isinstance(value, sympy.Basic):
        return value
    elif isinstance(value, str):
        return list(value)
    elif isinstance(value, int) or isinstance(value, float) and value % 1 == 0:
        return sympy.Integer(value)
    elif isinstance(value, float):
        return sympy.Number(value)
    elif isinstance(value, complex):
        return yunoify(value.real) + yunoify(value.imag) * sympy.I
    elif isinstance(value, (list, tuple, set)):
        return [yunoify(item, deep) for item in value]
    elif isinstance(value, dict):
        return [[yunoify(key, deep), yunoify(value, deep)] for key, value in value.items()]
    else:
        raise RuntimeError("failed to convert object to yuno-type; this error should be caught - if you are seeing this, something went wrong")

def tryeval(string):
    try:
        return yunoify(eval(string))
    except:
        return yunoify(string)

adverbs = {}
verbs = {}

def Adverb(symbol, condition, fail = None, seek_forward = False):
    def _inner(call):
        adverbs[symbol] = attrdict(condition = condition, call = call, fail = fail, seek_forward = seek_forward)
        return adverbs[symbol].call
    return _inner

def Hyper(symbol, default_link = None):
    def _inner(call):
        adverbs[symbol] = attrdict(condition = lambda x: len(x) == 1, call = lambda links, outer, index: call(links[0]), fail = default_link and (lambda links, outer, index: call(verbs[default_link])), seek_forward = False)
        return adverbs[symbol].call
    return _inner

def Verb(symbol, arity, ldepth = None, rdepth = None, lstr_obj = False, rstr_obj = False, strategy = None):
    def _inner(call):
        verbs[symbol] = attrdict(arity = arity, call = vectorize(call, arity, ldepth, rdepth, lstr_obj, rstr_obj, strategy))
        return verbs[symbol].call
    return _inner

def vectorize(f, arity, ldepth, rdepth, lstr_obj, rstr_obj, strategy):
    if strategy is None:
        strategy = DEFAULT_VECTORIZATION_STRATEGY
    def _inner(*a):
        if arity == 0:
            return f()
        elif arity == 1:
            if ldepth is not None and depth(a[0]) > ldepth and not (lstr_obj and is_str(a[0])):
                return map(_inner, a[0])
            else:
                return f(a[0])
        else:
            vecl = not (lstr_obj and is_str(a[0]) or (ldepth is None or depth(a[0]) <= ldepth))
            vecr = not (rstr_obj and is_str(a[1]) or (rdepth is None or depth(a[1]) <= rdepth))
            if vecl:
                if vecr:
                    return vjoin(_inner, a[0], a[1], strategy)
                else:
                    return map(lambda x: _inner(x, a[1]), a[0])
            else:
                if vecr:
                    return map(lambda y: _inner(a[0], y), a[1])
                else:
                    return f(*a)
    return _inner

def vjoin(f, left, right, strategy = None):
    if strategy is None:
        strategy = DEFAULT_VECTORIZATION_STRATEGY
    if isinstance(left, sequence):
        if isinstance(right, sequence):
            return sequence(lambda x: f(left(x), right(x)))
        else:
            if strategy == "overflow":
                return sequence(lambda x: f(left(x), right[x]) if 0 <= x < len(right) else left(x))
            elif strategy == "cut":
                return [f(left(x), right[x]) for x in range(len(right))]
            elif strategy == "wrap":
                return sequence(lambda x: f(left(x), right[x % len(right)]))
    else:
        if isinstance(right, sequence):
            if strategy == "overflow":
                return sequence(lambda x: f(left[x], right(x)) if 0 <= x < len(left) else right(x))
            elif strategy == "cut":
                return [f(left[x], right(x)) for x in range(len(left))]
            elif strategy == "wrap":
                return sequence(lambda x: f(left[x % len(x)], right(x)))
        else:
            length = min(len(left), len(right))
            if strategy == "overflow":
                return [f(left[x], right[x]) for x in range(length)] + left[length:] + right[length:]
            elif strategy == "cut":
                return [f(left[x], right[x]) for x in range(length)]
            elif strategy == "wrap":
                return [f(left[x % len(left)], right[x % len(right)]) for x in range(max(len(left), len(right)))]
    raise "unknown vectorization strategy " + str(strategy)

def is_str(x):
    return isinstance(x, list) and x and all(isinstance(c, str) for c in x)

def unyunoify_strs(x):
    if is_str(x):
        return "".join(x)
    elif isinstance(x, (list, sequence)):
        return map(unyunoify_strs, x)
    else:
        return x

def to_str(x):
    return str(unyunoify_strs(x))

def map(f, x):
    if isinstance(x, list):
        return [f(a) for a in x]
    elif isinstance(x, sequence):
        return sequence(lambda a: f(x(a)))
    else:
        raise RuntimeError(f"cannot map over non-iterable: {x} ({type(x)})")

def filter(f, x):
    if isinstance(x, list):
        return [a for a in x if f(a)]
    elif isinstance(x, sequence):
        return filter_sequence(f, x)
    else:
        raise RuntimeError(f"cannot filter non-iterable: {x} ({type(x)})")

def enumerate(x):
    if isinstance(x, list):
        return [[index + oneindex, x[index]] for index in range(len(x))]
    elif isinstance(x, sequence):
        return sequence(lambda a: [a + oneindex, x[a]], depth = depth(x) + 1)
    else:
        raise RuntimeError(f"cannot enumerate non-iterable: {x} ({type(x)})")

def transform(x):
    x = [x] if isinstance(x, list) and depth(x) == 1 else map(lambda a: make_iterable(a, singleton = True), x)
    if isinstance(x, list):
        if any(isinstance(a, sequence) for a in x):
            return sequence(lambda i: [a[i] for a in x if isinstance(a, sequence) or 0 <= i < len(a)])
        else:
            return [[a[i] for a in x if i < len(a)] for i in range(max(map(len, x)))]
    else:
        return sequence(lambda i: transform_sequence(x, i))

def from_base(x, y):
    total = 0
    for k in x:
        total *= y
        total += k
    return total

def yuno_output(item, end = "", force = False, fstring = False):
    if is_str(item):
        if force or fstring:
            print(repr("".join(item)), end = end)
        elif len(item) == 0 and (force or "L" in flags):
            print("[]", end = end)
        else:
            print("".join(item), end = end)
    elif isinstance(item, sequence):
        limit = 10 if "T" in flags else float("inf")
        print("[", end = "")
        index = 0
        while index < limit:
            yuno_output(item(index), "", True, True)
            print(", ", end = "")
            index += 1
        print("...]", end = end)
    elif isinstance(item, list):
        if len(item) == 1 and not force and "L" not in flags:
            yuno_output(item[0])
        else:
            print("[", end = "")
            for sub in item[:-1]:
                yuno_output(sub, "", True, True)
                print(", ", end = "")
            if item:
                yuno_output(item[-1], "", True, True)
            print("]", end = end)
    else:
        print(str(item), end = end)

def make_iterable(x, singleton = False, make_range = False, string = False, method = None):
    if isinstance(x, (list, sequence)):
        return x
    if singleton:
        return [x]
    if make_range:
        x = numify(x)
        if method == "lower" or "D" in flags:
            return lower_range(x)
        if method == "outer" or "O" in flags:
            return outer_range(x)
        if method == "inner" or "I" in flags:
            return inner_range(x)
        return upper_range(x)
    if string:
        return list(str(x))
    raise "make-iterable received no strategy"

def numify(x):
    return codepage.find(x) if isinstance(x, str) else x

def ch2s(x):
    return [x] if isinstance(x, str) else x

def b2i(x):
    return 1 if x else 0

def real_part(x):
    return x.as_real_imag()[0] if isinstance(x, sympy.Basic) else x.real

def imag_part(x):
    return x.as_real_imag()[1] if isinstance(x, sympy.Basic) else x.imag

def reim(x):
    return list(x.as_real_imag()) if isinstance(x, sympy.Basic) else [x.real, x.imag]

def cpchr(x):
    return codepage[x % 256]

def variadic_call(link, x, y):
    if link.arity == 0:
        return link.call()
    elif link.arity == 1:
        return link.call(x)
    else:
        return link.call(x, y)

def ut(call):
    def inner(*a, **k):
        result = call(*a, **k)
        if isinstance(result, trampoline):
            return result.eval()
        return result
    return inner

def const(x):
    return attrdict(arity = 0, call = lambda: x)

def Y(f):
    return f(f)
