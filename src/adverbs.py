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

@Adverb("φ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_nilad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 0, call = lambda: trampoline(links[position], []))

@Adverb("χ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_monad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 1, call = lambda x: trampoline(links[position], [x]))

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

@Adverb("ψ", lambda x: len(x) == 1, fail = lambda inner, links, outerindex: nth_link_nilad([attrdict(arity = 0, call = lambda: 1)], links, outerindex))
def nth_link_dyad(inner, links, outerindex):
    position = (inner[0].call(*map(lambda k: verbs[k].call(), ["α", "ω"][:inner[0].arity])) - 1) % (len(links) - 1)
    if position >= outerindex:
        position += 1
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[position], [x, y]))

@Hyper("@", ",")
def swap_arguments(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: link.call())
    elif link.arity == 1:
        return attrdict(arity = 2, call = lambda x, y: link.call(y))
    else:
        return attrdict(arity = 2, call = lambda x, y: link.call(y, x))

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

@Adverb("ի", lambda x: True)
def next_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[(outerindex + 1) % len(links)], []))

@Adverb("ը", lambda x: True)
def next_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[(outerindex + 1) % len(links)], [x]))

@Adverb("թ", lambda x: True)
def next_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[(outerindex + 1) % len(links)], [x, y]))
