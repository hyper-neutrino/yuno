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
    return attrdict(arity = 0, call = lambda: trampoline(links[(outerindex - 1) % len(links)], []), chain = True)

@Adverb("Ը", lambda x: True)
def last_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[(outerindex - 1) % len(links)], [x]), chain = True)

@Adverb("Թ", lambda x: True)
def last_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[(outerindex - 1) % len(links)], [x, y]), chain = True)

@Adverb("ɨ", lambda x: True)
def this_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[outerindex], []), chain = True)

@Adverb("ɫ", lambda x: True)
def this_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[outerindex], [x]), chain = True)

@Adverb("ɬ", lambda x: True)
def this_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[outerindex], [x, y]), chain = True)

@Adverb("ի", lambda x: True)
def next_link_nilad(inner, links, outerindex):
    return attrdict(arity = 0, call = lambda: trampoline(links[(outerindex + 1) % len(links)], []), chain = True)

@Adverb("ը", lambda x: True)
def next_link_monad(inner, links, outerindex):
    return attrdict(arity = 1, call = lambda x: trampoline(links[(outerindex + 1) % len(links)], [x]), chain = True)

@Adverb("թ", lambda x: True)
def next_link_dyad(inner, links, outerindex):
    return attrdict(arity = 2, call = lambda x, y: trampoline(links[(outerindex + 1) % len(links)], [x, y]), chain = True)
