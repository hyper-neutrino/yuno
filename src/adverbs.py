@Hyper("Ξ", "¹")
def filter_over(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: filter(lambda a: ut(link.call)(), make_iterable(x, make_range = True)))
    elif link.arity == 1:
        return attrdict(arity = 1, call = lambda x: filter(ut(link.call), make_iterable(x, make_range = True)))
    else:
        return attrdict(arity = 2, call = lambda x, y: filter(lambda a: ut(link.call)(a, y), make_iterable(x, make_range = True)))

@Hyper("υ", "Σ")
def deep_recurse(link):
    def _inner(*x):
        if isinstance(x[0], (list, sequence)):
            return ut(link.call)(map(lambda a: _inner(a, *x[1:]), x[0]), *x[1:])
        return x[0]
    return attrdict(arity = max(link.arity, 1), call = _inner)

@Hyper('"')
def vectorize_once(link):
    if link.arity == 0:
        raise RuntimeError("cannot vectorize a nilad")
    elif link.arity == 1:
        return attrdict(arity = 1, call = lambda x: map(ut(link.call), x) if isinstance(x, (list, sequence)) else ut(link.call)(x))
    else:
        return attrdict(arity = 2, call = lambda x, y: (vjoin(ut(link.call), x, y) if isinstance(y, (list, sequence)) else map(lambda a: ut(link.call)(a, y), x)) if isinstance(x, (list, sequence)) else (map(lambda a: ut(link.call)(x, a), y) if isinstance(y, (list, sequence)) else link.call(x, y)))

@Hyper("⁺")
def duplicate_link(link):
    return [link, link]

@Adverb("¡", lambda x: x and (len(x) == 2 or x[0].arity))
def ntimes(inner, links, outerindex):
    rep = int(reim(ut(inner[-1].call)() if len(inner) == 2 else last_input())[0])
    link = inner[0]
    if link.arity == 0:
        return attrdict(arity = 0, call = lambda: [(ut(link.call) if x < rep - 1 else link.call)() for x in range(rep)][-1])
    elif link.arity == 1:
        return attrdict(arity = 1, call = lambda x: Y(lambda f: lambda v, r: v if r == 0 else (ut(link.call) if r < rep else link.call)(f(f)(v, r - 1)))(x, rep))
    else:
        return attrdict(arity = 2, call = lambda x, y: Y(lambda f: lambda v, p, r: v if r == 0 else f(f)(ut(link.call)(v, p), v, r - 1))(x, y, rep))

@Adverb("?", lambda x: len(x) == 3, fail = lambda inner, links, outerindex: conditional(inner, links, outerindex))
def conditional(inner, links, outerindex):
    if len(inner) == 0:
        t, f, c = const(1), const(0), verbs["¹"]
    elif len(inner) == 1:
        t, f, c = inner[0], verbs["¹"], verbs["¹"]
    elif len(inner) == 2:
        t, f, c = inner[0], verbs["¹"], inner[1]
    else:
        t, f, c = inner
        return attrdict(arity = max(t.arity, f.arity, c.arity), call = lambda *a: t.call(*a[:t.arity]) if ut(c.call)(*a[:c.arity]) else f.call(*a[:f.arity]))

@Hyper("@", ",")
def swap_arguments(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: link.call())
    elif link.arity == 1:
        return attrdict(arity = 2, call = lambda x, y: link.call(y))
    else:
        return attrdict(arity = 2, call = lambda x, y: link.call(y, x))

@Adverb("/", lambda x: len(x) == 1 and x[0].arity != 0 or len(x) == 2)
def ynreduce(inner, links, outerindex):
    call = (lambda x, y: ut(inner[0].call)()) if inner[0].arity == 0 else (lambda x, y: ut(inner[0].call)([x, y])) if inner[0].arity == 1 else ut(inner[0].call)
    return attrdict(arity = 1, call = lambda a: reduce(call, a, default = 0, nwise = ut(inner[1].call)() if len(inner) > 1 else None))

@Adverb("\\", lambda x: len(x) == 1 and x[0].arity != 0 or len(x) == 2)
def yncumulative_reduce(inner, links, outerindex):
    call = (lambda x, y: ut(inner[0].call)()) if inner[0].arity == 0 else (lambda x, y: ut(inner[0].call)([x, y])) if inner[0].arity == 1 else ut(inner[0].call)
    return attrdict(arity = 1, call = lambda a: cumulative_reduce(call, a, nwise = ut(inner[1].call)() if len(inner) > 1 else None))

@Hyper("`", ",")
def reflect_arguments(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: link.call())
    elif link.arity == 1:
        return attrdict(arity = 2, call = lambda x, y: link.call(x))
    else:
        return attrdict(arity = 1, call = lambda x: link.call(x, x))

@Adverb("¿", lambda x: len(x) == 2, fail = lambda inner, links, outerindex: while_loop_end_result(inner, links, outerindex))
def while_loop_end_result(inner, links, outerindex):
    if len(inner) == 0:
        raise RuntimeError("`¿` needs at least one link")
    elif len(inner) == 1:
        loop, condition = inner[0], verbs["¹"]
    else:
        loop, condition = inner
    return while_loop(loop, condition)

@Adverb("ʔ", lambda x: len(x) == 2, fail = lambda inner, links, outerindex: while_loop_end_result(inner, links, outerindex))
def while_loop_end_result(inner, links, outerindex):
    if len(inner) == 0:
        raise RuntimeError("`ʔ` needs at least one link")
    elif len(inner) == 1:
        loop, condition = inner[0], verbs["¹"]
    else:
        loop, condition = inner
    return while_loop(loop, condition, keep = True)

@Hyper("‖", "¹")
def filter_against(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: filter(lambda a: not ut(link.call)(), make_iterable(x, make_range = True)))
    elif link.arity == 1:
        return attrdict(arity = 1, call = lambda x: filter(lambda a: not ut(link.call)(a), make_iterable(x, make_range = True)))
    else:
        return attrdict(arity = 2, call = lambda x, y: filter(lambda a: not ut(link.call)(a, y), make_iterable(x, make_range = True)))

@Hyper("ᴀS")
class monodirectional_recursive_sequence(sequence):
    def __init__(self, link):
        sequence.__init__(self, self.func)
        self.f = ut(link.call)
        self.arity = link.arity
        self.found = []
    def call(self, *a):
        self.found = list(a)
        return self
    def func(self, index):
        if index < 0:
            raise RuntimeError("cannot get elements left of the origin of a monodirectional recursive sequence")
        else:
            while len(self.found) <= index:
                if self.arity == 0:
                    self.found.append(self.f())
                else:
                    self.found.append(self.f(*self.found[-self.arity:]))
            return self.found[index]

@Adverb("ᴀs", lambda x: len(x) == 2, fail = lambda inner, links, outerindex: bidirectional_recursive_sequence(inner, links, outerindex))
class bidirectional_recursive_sequence(sequence):
    def __init__(self, inner, links, outerindex):
        sequence.__init__(self, self.func)
        if len(inner) == 0:
            raise RuntimeError("cannot create bidirectional sequence with no verbs")
        elif len(inner) == 1:
            self.backtrack = self.advance = ut(inner.call)
        else:
            self.backtrack, self.advance = ut(inner[0].call), ut(inner[1].call)
        self.arity = max(link.arity for link in inner)
        self.f_arity = inner[-1].arity
        self.b_arity = inner[0].arity
        self.forward = []
        self.backward = []
    def call(self, *a):
        self.forward = list(a)[:self.f_arity]
        self.backward = list(a)[::-1][:self.b_arity]
        return self
    def func(self, index):
        if index < 0:
            while len(self.backward) - self.b_arity < -index:
                if self.b_arity == 0:
                    self.backward.append(self.backtrack())
                else:
                    self.backward.append(self.backtrack(*self.backward[-self.b_arity:]))
            return self.backward[self.b_arity - 1 - index]
        else:
            while len(self.forward) <= index:
                if self.f_arity == 0:
                    self.forward.append(self.advance())
                else:
                    self.forward.append(self.advance(*self.forward[-self.f_arity:]))
            return self.forward[index]

@Adverb("ᴛ", lambda x: x and ((x[-1].arity == 0 and len(x) == int(reim(x[-1].call())[0]) + 1) or (x[-1].arity != 0 and len(x) == 2)))
def tie(inner, links, outerindex):
    if inner[-1].arity == 0:
        inner.pop()
    def _inner(*x):
        inner.append(inner.pop(0))
        return inner[-1].call(*x[:inner[-1].arity])
    return attrdict(arity = max(link.arity for link in inner), call = _inner)

@Adverb("ʈ", lambda x: x and ((x[-1].arity == 0 and len(x) == int(reim(x[-1].call())[0]) + 1) or (x[-1].arity != 0 and len(x) == 2)))
def cleave(inner, links, outerindex):
    if inner[-1].arity == 0:
        inner.pop()
    def _inner(*x):
        return [ut(link.call)(*x[:link.arity]) for link in inner]
    return attrdict(arity = max(link.arity for link in inner), call = _inner)

@Hyper("Ͼ")
def map_over(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: map(lambda a: ut(link.call)(), make_iterable(x, make_range = True)))
    elif link.arity == 1:
        return attrdict(arity = 1, call = lambda x: map(ut(link.call), make_iterable(x, make_range = True)))
    else:
        return attrdict(arity = 2, call = lambda x, y: map(lambda a: ut(link.call)(a, y), make_iterable(x, make_range = True)))

@Hyper("Ͽ")
def map_over_right(link):
    return attrdict(arity = 2, call = lambda x, y: map(lambda a: ut(link.call)(*[x, a][:link.arity]), make_iterable(y, make_range = True)))

@Hyper("ɵϾ")
def deep_map_over(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = Y(lambda f: lambda x: map(f(f), x) if isinstance(x, (list, sequence)) else ut(link.call)()))
    elif link.arity == 1:
        return attrdict(arity = 1, call = Y(lambda f: lambda x: map(f(f), x) if isinstance(x, (list, sequence)) else ut(link.call)(x)))
    else:
        return attrdict(arity = 2, call = Y(lambda f: lambda x, y: map(lambda a: f(f)(a, y), x) if isinstance(x, (list, sequence)) else ut(link.call)(x, y)))

@Hyper("ɵϿ")
def deep_map_over_right(link):
    if link.arity == 0:
        return attrdict(arity = 2, call = Y(lambda f: lambda x, y: map(f(f), y) if isinstance(y, (list, sequence)) else ut(link.call)()))
    elif link.arity == 1:
        return attrdict(arity = 1, call = Y(lambda f: lambda x, y: map(f(f), y) if isinstance(y, (list, sequence)) else ut(link.call)(x)))
    else:
        return attrdict(arity = 2, call = Y(lambda f: lambda x, y: map(lambda a: f(f)(x, a), y) if isinstance(y, (list, sequence)) else ut(link.call)(x, y)))

@Adverb("Ի", lambda x: True)
def last_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[(outerindex - 1) % len(links)], []))

@Adverb("Ը", lambda x: True)
def last_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[(outerindex - 1) % len(links)], [x]))

@Adverb("Թ", lambda x: True)
def last_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[(outerindex - 1) % len(links)], [x, y]))

@Adverb("ɨ", lambda x: True)
def this_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[outerindex], []))

@Adverb("ɫ", lambda x: True)
def this_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[outerindex], [x]))

@Adverb("ɬ", lambda x: True)
def this_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[outerindex], [x, y]))

@Adverb("ɵԻ", lambda x: True)
def next_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[(outerindex + 1) % len(links)], []))

@Adverb("ɵԸ", lambda x: True)
def next_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[(outerindex + 1) % len(links)], [x]))

@Adverb("ɵԹ", lambda x: True)
def next_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[(outerindex + 1) % len(links)], [x, y]))

@Adverb("ɵɨ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_nilad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 0, call = lambda: trampoline(links[position], []))

@Adverb("ɵɫ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_monad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 1, call = lambda x: trampoline(links[position], [x]))

@Adverb("ɵɬ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_dyad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[position], [x, y]))

for symbol, arity, length in zip("$ΦΨχφψ", [1] * 3 + [2] * 3, [2, 3, 4] * 2):
    (lambda symbol = symbol, arity = arity, length = length: Adverb(symbol, lambda x: len(x) - sum(map(isLCC, suffixes(x)[:-1])) >= length)(lambda inner, links, outerindex: attrdict(arity = arity, call = lambda *x: evaluate(inner, arity, *x))))()

@Adverb("°", lambda x: len(x) > 1 and isLCC(x))
def nilad_group(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: evaluate(inner, arity = 0))

@Adverb("'", lambda x: isLCC(x), seek_forward = True)
def LCC_group(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: evaluate(inner, arity = 0))
