@Hyper("@", ",")
def swap_arguments(link):
    if link.arity == 0:
        return attrdict(arity = 1, call = lambda x: link.call())
    elif link.arity == 1:
        return attrdict(arity = 2, call = lambda x, y: link.call(y))
    else:
        return attrdict(arity = 2, call = lambda x, y: link.call(y, x))
