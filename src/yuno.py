codepage  = "ΓΔΞΠΣΦΨ½¦ǂ\nαβγδεζηθιλμπρσςτυφχψω !\"#$%&'()*+,-./0123456789:;<=>?"
codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ä"
codepage += "æçðøħŋœɐɒɓɔɕɖɗɘ¡¿ɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ↑↓"
codepage += "‖ᴀʙᴅᴇғɢʜɪᴊᴋʟᴍɴᴘǫʀᴛʏԻԸԹիըթ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”"

assert len(set(codepage)) == 256, f"codepage has {len(set(codepage))} characters"

def isLCC(chain):
    return chain and [link.arity for link in chain] + [1] < [0, 2] * len(chain)

def evaluate(chain, arity, *args):
    while True:
        verbs["α"].call = (lambda x: lambda: x)(list("yuno by hyper-neutrino") if arity < 1 else args[0])
        verbs["ω"].call = (lambda x: lambda: x)([] if arity < 2 else args[1])

        x = None if arity < 1 else args[0]
        y = None if arity < 2 else args[1]

        chain = chain[:]
        value = None

        if arity == 0:
            if chain and chain[0].arity == 0:
                x = chain.pop(0).call()
            else:
                x = 0
            arity = 1

        if arity == 1:
            if isLCC(chain):
                x = ut(x)
                value = chain.pop(0).call()
            else:
                value = x

            while chain:
                if isinstance(value, trampoline):
                    value = value.eval()
                if len(chain) >= 2:
                    if chain[0].arity == 2 and chain[1].arity == 1:
                        value = chain.pop(0).call(value, ut(chain.pop(0).call)(x))
                        continue
                    if chain[0].arity == 2 and chain[1].arity == 0:
                        value = chain.pop(0).call(value, ut(chain.pop(0).call)())
                        continue
                    if chain[0].arity == 0 and chain[1].arity == 2:
                        value = chain.pop(1).call(ut(chain.pop(0).call)(), value)
                        continue
                if chain[0].arity == 2:
                    value = chain.pop(0).call(value, x)
                    continue
                if chain[0].arity == 1:
                    value = chain.pop(0).call(value)
                    continue
                yuno_output(value)
                value = chain.pop(0).call()

            if isinstance(value, trampoline):
                chain = value.link
                arity = len(value.arguments)
                args = value.arguments
                continue
            else:
                return value

        if arity == 2:
            if len(chain) >= 3 and chain[0].arity == chain[1].arity == chain[2].arity == 2:
                x = ut(x)
                value = chain.pop(0).call(x, y)
            elif isLCC(chain):
                x = ut(x)
                value = chain.pop(0).call()
            else:
                value = x

            while chain:
                if isinstance(value, trampoline):
                    value = value.eval()
                if len(chain) >= 3 and chain[0].arity == chain[1].arity == 2 and isLCC(chain[2:]):
                    value = chain.pop(1).call(ut(chain.pop(0).call)(value, y), ut(chain.pop(1).call)())
                    continue
                if len(chain) >= 2:
                    if chain[0].arity == chain[1].arity == 2:
                        value = chain.pop(0).call(value, ut(chain.pop(0).call)(x, y))
                        continue
                    if chain[0].arity == 2 and chain[1].arity == 0:
                        value = chain.pop(0).call(value, ut(chain.pop(0).call)())
                        continue
                    if chain[0].arity == 0 and chain[1].arity == 2:
                        value = chain.pop(1).call(ut(chain.pop(0).call)(), value)
                        continue
                if chain[0].arity == 2:
                    value = chain.pop(0).call(value, y)
                    continue
                if chain[0].arity == 1:
                    value = chain.pop(0).call(value)
                    continue
                yuno_output(value)
                value = chain.pop(0).call()

            if isinstance(value, trampoline):
                chain = value.link
                arity = len(value.arguments)
                args = value.arguments
                continue
            else:
                return value

        return value

def parse_chain(chain, chains, links, outerindex, stack = None):
    if stack is None:
        stack = links[outerindex]
    index = 0
    while index < len(chain):
        if not hasattr(chain[index], "type"):
            stack.append(chain[index])
        elif chain[index].type == "verb":
            stack.append(chain[index].value)
        elif chain[index].type == "adverb":
            adverb = chain[index].value
            inner = []
            while stack and not adverb.condition(inner):
                inner.insert(0, stack.pop())
            if adverb.condition(inner):
                verbs = adverb.call(inner, links, outerindex)
            elif adverb.fail is not None:
                verbs = adverb.fail(inner, links, outerindex)
            else:
                raise RuntimeError(f"adverb `{chain[index].name}` failed to meet its condition and does not have a default behavior")
            if not isinstance(verbs, list):
                verbs = [verbs]
            for verb in verbs:
                stack.append(verb)
        elif chain[index].type == "bracket":
            if chain[index].open:
                arity = chain[index].arity
                index += 1
                bal = 1
                inner = []
                while bal and index < len(chain):
                    if chain[index].type == "bracket" and chain[index].arity == arity:
                        bal += chain[index].open * 2 - 1
                    if bal:
                        inner.append(chain[index])
                        index += 1
                stack.append(attrdict(arity = arity, call = (lambda chain, arity: lambda *args: evaluate(chain, arity, *args))(parse_chain(inner, chains, links, outerindex, []), arity)))
            else:
                subchain = stack[:]
                stack[:] = []
                arity = chain[index].arity
                stack.append(attrdict(arity = arity, call = (lambda chain, arity: lambda *args: evaluate(chain, arity, *args))(parse_chain(subchain, chains, links, outerindex, []), arity)))
        elif chain[index].type == "breaker":
            pass
        else:
            raise RuntimeError(f"unidentified item when parsing the chain: {chain[index]}")
        index += 1
    return stack

def parse(chains):
    links = [[] for _ in chains]
    for outerindex in range(len(chains)):
        chain = chains[outerindex]
        parse_chain(chain, chains, links, outerindex)
    return links

def lit2verb(literal):
    return attrdict(
        type = "verb",
        value = attrdict(arity = 0, call = (lambda x: lambda: x)(literal))
    )

def collapse(literals, force = False):
    bal = 0
    for lit in literals:
        if lit.value == "open":
            bal += 1
        elif lit.value == "close":
            bal -= 1
    literals = [attrdict(type = "literal", value = "open")] * -bal + literals + [attrdict(type = "bracket", value = "close")] * bal
    values = []
    index = 0
    while index < len(literals):
        if literals[index].value == "open":
            bal = 1
            list = []
            index += 1
            while bal:
                if literals[index].value == "open":
                    bal += 1
                elif literals[index].value == "close":
                    bal -= 1

                if bal:
                    list.append(literals[index])
                    index += 1
            values.append(collapse(list, True))
        else:
            values.append(literals[index].value)
        index += 1
    if not force and len(values) == 1:
        return values[0]
    return values

def strand(line):
    output = []
    literals = []
    for x in line:
        if x.type == "literal":
            literals.append(x)
        else:
            if literals:
                output.append(lit2verb(collapse(literals)))
                literals = []
            output.append(x)
    if literals:
        output.append(lit2verb(collapse(literals)))
    return output

def parse_number(x):
    if x == "":
        return sympy.Integer(0)
    elif "ɪ" in x:
        a, b = x.split("ɪ")
        return parse_number(a or "0") + sympy.I * parse_number(b or "1")
    elif "ᴇ" in x:
        a, b = x.split("ᴇ")
        return parse_number(a or "1") * sympy.Integer(10) ** parse_number(b or "3")
    elif "ʙ" in x:
        a, b = x.split("ʙ")
        return parse_number(a or "1") * sympy.Integer(2) ** parse_number(b or "4")
    elif "ғ" in x:
        a, b = x.split("ғ")
        return parse_number(a or "1") / parse_number(b or "3")
    elif x[0] == "-":
        return -parse_number(x[1:] or "1")
    elif "." in x:
        a, b = x.split(".")
        return sympy.Rational((a or "0") + "." + (b or "5"))
    else:
        return sympy.Integer(x)

def tokenize(code):
    lines = [[]]
    index = 0
    while index < len(code):
        if code[index] == "\n" and (index == 0 or code[index - 1] != "ᴋ"):
            lines.append([])
        elif code[index] in "“”0123456789-.ɪʙᴇғˌ‼[]":
            if code[index] == "“":
                index += 1
                literal = [[]]
                while index < len(code):
                    if code[index] == "“":
                        literal.append([])
                    elif code[index] == "”":
                        break
                    elif code[index] == "«":
                        literal = [list("TODO - figure out what to do with « string terminator")]
                        break
                    elif code[index] == "»":
                        literal = [list(decompress(from_base([codepage.find(char) + 1 for char in line], 256))) for line in literal]
                        break
                    elif code[index] == "‘":
                        offset = "1" in flags
                        literal = [[codepage.find(x) + offset for x in line] for line in literal]
                        break
                    elif code[index] == "’":
                        literal = [from_base([codepage.find(char) + 1 for char in line], 256) for line in literal]
                        break
                    else:
                        literal[-1].append(code[index])
                    index += 1
                literal = [list(item) if isinstance(item, str) else item for item in literal]
                if len(literal) == 1:
                    literal = literal[0]
            elif code[index] == "”":
                index += 1
                literal = code[index] if index < len(code) else " "
            elif code[index] in "0123456789-.ɪʙᴇғ":
                _re = "-?\\d*(\\.\\d*)?"
                _fr = "(" + _re + "(ғ" + _re + ")?)"
                _bn = "(" + _fr + "(ʙ" + _fr + ")?)"
                _xp = "(" + _bn + "(ᴇ" + _bn + ")?)"
                _im = "(" + _xp + "(ɪ" + _xp + ")?)"
                item = re.match("^" + _im, code[index:]).group()
                index += len(item) - 1
                literal = parse_number(item)
            elif code[index] == "ˌ":
                literal = list(code[index + 1:][:2].ljust(2))
                index += 2
            elif code[index] == "‼":
                string = (code[index + 1:] + "ΓΓ")[:2]
                index += 2
                literal = from_base([codepage.find(char) + 1 for char in string], 256) + 744
                if literal > 33318:
                    literal -= 66637
            elif code[index] == "[":
                literal = "open"
            elif code[index] == "]":
                literal = "close"
            lines[-1].append(attrdict(type = "literal", value = literal))
        elif code[index] == "ǂ":
            lines[-1].append(attrdict(type = "breaker"))
        elif code[index] in "(){}┝┥":
            lines[-1].append(attrdict(type = "bracket", open = code[index] in "({┝", arity = "┝({┥)}".find(code[index]) % 3))
        else:
            for type, item in [["verb", verbs], ["adverb", adverbs]]:
                for key in item:
                    if code[index:].startswith(key):
                        index += len(key) - 1
                        lines[-1].append(attrdict(type = type, value = item[key], name = key))
                        break
                else:
                    continue
                break
        index += 1
    return map(strand, lines)

def execute(code, args, flags):
    if "h" in flags:
        print("""
            L - display singleton lists as lists
            T - cap infinite list output at 10 elements
            U - implicit range is upper
            D - implicit range is lower
            O - implicit range is outer
            I - implicit range is inner
            1 - codepage index literals are one-indexed
            0 - everything else is zero-indexed
            P - implicit output uses Python's str function
            j - implicit output joins on newlines
            s - implicit output joins on spaces
            d - disable implicit output
            n - output a newline at the end
            M - don't memoize sequence calls (warning - performance may degrage significantly)
            h - display this help message
        """[1:-9].replace(" " * 12, ""), end = "")
        return

    args = list(map(tryeval, args))
    for symbol, arg in zip("³⁴⁵⁶⁷⁸⁹", args + ["\n", " ", 64, 32, 100, 256, 10][len(args):]):
        verbs[symbol].call = (lambda val: lambda: val)(arg)

    filtered = ""

    for char in code:
        if char == "¶":
            char = "\n"
        if char not in codepage:
            print(f"`{char}` is not in the codepage and has been removed", file = sys.stderr)
        else:
            filtered += char

    chains = tokenize(filtered)
    parsed = parse(chains)
    result = evaluate(parsed[-1], min(len(args), 2), *args[:2])

    if "j" in flags or "s" in flags:
        joiner = "\n" if "j" in flags else " "
        if isinstance(result, list):
            for item in result[:-1]:
                yuno_output(item, joiner)
            if result:
                yuno_output(result[-1])
        elif isinstance(result, sequence):
            max = 10 if "T" in flags else float("inf")
            index = 0
            while index < max:
                yuno_output(result(index), joiner)
                index += 1
            print("...", end = "")
        else:
            yuno_output(result)
    else:
        yuno_output(result)

    if "n" in flags:
        print()

if __name__ == "__main__":
    execute(sys.argv[2], sys.argv[3:], sys.argv[1])
