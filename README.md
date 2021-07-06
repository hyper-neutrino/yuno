# yuno
yuno is a tacit golfing language inspired by other array languages and tacit languages like APL and Jelly.

## stage 1 - tokenization

These tokens can be matched greedily. Characters that are not in the codepage should be removed. If a line ends with `ᴋ`, it should continue to the next line, even in line comments.

If the first character is `“`, begin reading a string literal. Any character other than `«»‘’“”` should be appended to the string literal.
- if `“` is encountered, the literal now becomes a list of strings
- if `”` is encountered, end the string literal
- if `«` is encountered, (TODO - define what this means)
- if `»` is encountered, terminate a dictionary-compressed string literal (decoding is up to the interpreter - the default is a jelly clone with the local codepage)
- if `‘` is encountered, terminate a code-page index list
- if `’` is encountered, terminate a base-250 number

If the first character is `”`, the next character is a character literal (space should be used if EOF is reached).

If the first character is `ˌ`, the next two characters are a string literal (spaces should be used if EOF is reached).

If the first character is `‼`, the next two characters are a base-256 number literal (`Γ` should be used if EOF is reached).

If the first character is `ᴋ`, this and the next character form a literal digraph (check `constdigraphs.js`) (default `ᴋH`). If `ᴋ` is followed by a space, instead start a line comment.

If the first character is any of `0123456789-.ɪʙᴇғ`, begin reading a number literal.
- `-?[0-9]*(\.[0-9]*)?` is a number (of course this cannot be empty) - `-` is `-1`, `[x].` is `[x].5`
- `{number: numerator}ғ{number: denominator}` is a fraction literal (default `1ғ3`)
- `{number: mantissa}ʙ{number: exponent}` is a binary exponential literal - `mantissa * 2 ^ exponent` (default `1ʙ4`)
- `{number: mantissa}ᴇ{number: exponent}` is an exponential literal - `mantissa * 10 ^ exponent` (default `1ᴇ3`)
- `{number: real}ɪ{number: imaginary}` is a complex literal - `real + imaginary * i` (default `0ɪ1`)

List literals are parsed via stranding - that is, placing multiple literals one after another joins them into a list. `[` and `]` should auto-balance via prepending or appending matching brackets if necessary. `ǂ` should break literals apart but otherwise do nothing in the code.

If a verb or adverb is identified, add it as a token.

If any of `(){}┝┥` are seen, keep them around as brackets - we'll get to that later.

Otherwise, if nothing is recognized (this includes spaces), discard one character and continue trying. This should not error but should break the current token. Also, newlines should split links. Tokenizing should return a list of lines, each line being a list of tokens.

Literals should be parsed into niladic verbs at this point. Everything other than brackets should be verbs or adverbs.

## stage 2 - parsing

Parsing can be done via maintaining a stack. When you encounter a verb, push it to the stack. When you encounter an adverb, keep popping from the stack until the condition for the adverb is met.

If you encounter a closing bracket, take the whole stack, load it into a subroutine, and push just one item to the stack. The arity depends on the bracket: `┥` is niladic, `)` is monadic, and `}` is dyadic.

If you encounter an opening bracket, find the matching closing bracket (ignoring other bracket types when scanning for bracket balancing), parse the items between the brackets, and push just one item to the stack. The same arity rules as above apply.

Finally, return the whole stack. At this point, the stack should consist of a list of functions each with an arity and a call.

## stage 3 - evaluation

You can pre-parse the chains to save time on subroutines if you wish, but the performance difference should be quite minor and the implementation difficulty will be significantly higher.

To evaluate a chain, we step through groups of links. The chaining depends on the arity - by default, a chain is variadic; it is up to the caller to decide what arity to use.

In the following guide, `λ` represents the current value, `κ` is the argument to a monadic chain, and `α` and `ω` are the left and right arguments to a dyadic chain. Also, nilads will be represented by digits, monads by capital letters, and dyads by mathematical operators (`+`, `×`, `÷`).

### leading constant chains - LCCs

A leading constant chain is a chain starting with a nilad followed by zero or more monads, dyad-nilad pairs, or nilad-dyad pairs. In other words, the arities match `^0(1|20|02)*$`. Some rules only apply here, so keep these in mind.

### niladic chains

If the chain starts with a nilad, evaluate the rest of the chain monadically on that value. Otherwise, evaluate the whole chain monadically on 0.

### monadic chains

If the chain arities match `0(1|20|02)*`, start with the value as the first nilad and evaluate the rest of the chain monadically. Otherwise, start with the value as the argument.

Then, step through, using the first rule that matches. Let `λ` be the value:

|Pattern|New value of `λ`|
|------:|:---------------|
|`+ F`|`λ + F(κ)`|
|`+ 1`|`λ + 1`|
|`1 +`|`1 + λ`|
|`+`|`λ + κ`|
|`F`|`F(λ)`|

Also, if we encounter a nilad that is not in a nilad-dyad or dyad-nilad pair, output the current value (with no trailing newline) and set `λ` to that nilad, then continue.

### dyadic chains

- If the chain starts with three dyads like `+ × ÷ ...`, start with `λ = α + ω` and evaluate the rest of the chain.
- If the chain is an LCC starting with some constant `γ`, start with `λ = γ` and evaluate the rest of the chain.
- Otherwise, start with `λ = α` and evaluate the entire chain.

Again, step through these rules, and `λ` is our value.

|Pattern|New value of `λ`|
|------:|:---------------|
|`+ × 1`|`(λ + ω) × 1` *|
|`+ ×`|`λ + (α × ω)`|
|`+ 1`|`λ + 1`|
|`1 +`|`1 + λ`|
|`+`|`λ + ω`|
|`F`|`F(λ)`|

(* only if the remainder of the chain starting at `1 ...` is an LCC)

Also, again, if an unmatched nilad is encountered, output the current value, set `λ` to the nilad, and continue.

### TODO

- monad: is the current year a leap year?
- monad: get the number of days in each month depending on the year
- monad and dyad (digraphs): square root a list w/w/o filler
- monad: convert between degree types
- monad: join on newlines
- monad: join on spaces
- dyads: partition: at truthy, at indices, etc
- dyads: trim
- monad/dyad/triad (quick): eval
- padding commands
