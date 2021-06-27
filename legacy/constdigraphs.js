let k_digraphs = {
  "ᴋΓ": 0,
  "ᴋΔ": 0,
  "ᴋΘ": 0,
  "ᴋΞ": 0,
  "ᴋΠ": 0,
  "ᴋΣ": 0,
  "ᴋΦ": 0,
  "ᴋΨ": 0,
  "ᴋΩ": 0,
  "ᴋα": 0,
  "ᴋβ": 0,
  "ᴋγ": 0,
  "ᴋδ": 0,
  "ᴋε": 0,
  "ᴋζ": 0,
  "ᴋη": 0,
  "ᴋθ": 0,
  "ᴋι": 0,
  "ᴋκ": 0,
  "ᴋλ": 0,
  "ᴋμ": 0,
  "ᴋξ": 0,
  "ᴋπ": 0,
  "ᴋρ": 0,
  "ᴋς": 0,
  "ᴋσ": 0,
  "ᴋτ": 0,
  "ᴋυ": 0,
  "ᴋφ": 0,
  "ᴋχ": 0,
  "ᴋψ": 0,
  "ᴋω": 0,
  "ᴋ ": "", // comment - can't be used
  "ᴋ!": " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~", // printable ASCII
  'ᴋ"': 0,
  "ᴋ#": 0,
  "ᴋ$": 0,
  "ᴋ%": 0,
  "ᴋ&": 0,
  "ᴋ'": 0,
  "ᴋ(": "()", // round brackets; parentheses
  "ᴋ)": 0,
  "ᴋ*": 0,
  "ᴋ+": [1, -1], // signs
  "ᴋ,": 0,
  "ᴋ-": [-1, 1], // signs
  "ᴋ.": [0, 1], // bits
  "ᴋ/": 0,
  "ᴋ0": [0, 0], // zeroes
  "ᴋ1": [1, 1], // ones
  "ᴋ2": [2, 2], // twos
  "ᴋ3": [3, 3], // threes
  "ᴋ4": [4, 4], // fours
  "ᴋ5": [5, 5], // fives
  "ᴋ6": [6, 6], // sixes
  "ᴋ7": [7, 7], // sevens
  "ᴋ8": [8, 8], // eights
  "ᴋ9": [9, 9], // nines
  "ᴋ:": 0,
  "ᴋ;": 0,
  "ᴋ<": "<>", // angle brackets
  "ᴋ=": 0,
  "ᴋ>": 0,
  "ᴋ?": 0,
  "ᴋ@": 0,
  "ᴋA": "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // uppercase alphabet
  "ᴋB": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // base digits
  "ᴋC": "BCDFGHJKLMNPQRSTVWXZ", // uppercase consonants without Y
  "ᴋD": 0,
  "ᴋE": 0,
  "ᴋF": 0,
  "ᴋG": 0,
  "ᴋH": 0,
  "ᴋI": 0,
  "ᴋJ": 0,
  "ᴋK": 0,
  "ᴋL": 0,
  "ᴋM": 0,
  "ᴋN": 0,
  "ᴋO": 0,
  "ᴋP": 0,
  "ᴋQ": ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"], // uppercase QWERTY, uppercase keyboard
  "ᴋR": 0,
  "ᴋS": 0,
  "ᴋT": 0,
  "ᴋU": "AEIOUY", // uppercase vowels with Y
  "ᴋV": "AEIOU", // uppercase vowels without Y
  "ᴋW": 0,
  "ᴋX": 0,
  "ᴋY": "BCDFGHJKLMNPQRSTVWXYZ", // uppercase consonants with Y
  "ᴋZ": 0,
  "ᴋ[": "[]", // square brackets
  "ᴋ\\": 0,
  "ᴋ]": 0,
  "ᴋ^": "/\\", // slashes
  "ᴋ_": 0,
  "ᴋ`": 0,
  "ᴋa": "abcdefghijklmnopqrstuvwxyz", // lowercase alphabet
  "ᴋb": 0,
  "ᴋc": "bcdfghjklmnpqrstvwxz", // lowercase consonants without Y
  "ᴋd": 0,
  "ᴋe": 0,
  "ᴋf": 0,
  "ᴋg": 0,
  "ᴋh": "0123456789abcdef", // lowercase hexadecimal digits
  "ᴋi": 0,
  "ᴋj": 0,
  "ᴋk": 0,
  "ᴋl": 0,
  "ᴋm": 0,
  "ᴋn": 0,
  "ᴋo": 0,
  "ᴋp": 0,
  "ᴋq": ["qwertyuiop", "asdfghjkl", "zxcvbnm"], // lowercase qwerty, lowercase keyboard
  "ᴋr": 0,
  "ᴋs": 0,
  "ᴋt": 0,
  "ᴋu": "aeiouy", // lowercase vowels with Y
  "ᴋv": "aeiou", // lowercase vowels without Y
  "ᴋw": 0,
  "ᴋx": 0,
  "ᴋy": "bcdfghjklmnpqrstvwxyz", // lowercase consonants with Y
  "ᴋz": 0,
  "ᴋ{": "{}", // curly brackets; braces
  "ᴋ|": 0,
  "ᴋ}": 0,
  "ᴋ~": 0,
  "ᴋ\n": "", // line continuation - can't be used
  "ᴋä": 0,
  "ᴋæ": 0,
  "ᴋç": "BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz", // consonants without Y
  "ᴋð": 0,
  "ᴋø": 0,
  "ᴋħ": 0,
  "ᴋŋ": 0,
  "ᴋœ": 0,
  "ᴋǂ": 0,
  "ᴋɐ": 0,
  "ᴋɒ": 0,
  "ᴋɓ": 0,
  "ᴋɔ": 0,
  "ᴋɕ": 0,
  "ᴋɖ": 0,
  "ᴋɗ": 0,
  "ᴋɘ": 0,
  "ᴋ¡": 0,
  "ᴋ¿": 0,
  "ᴋɞ": 0,
  "ᴋɟ": 0,
  "ᴋɠ": 0,
  "ᴋɣ": 0,
  "ᴋɤ": 0,
  "ᴋɥ": 0,
  "ᴋɦ": 0,
  "ᴋɧ": 0,
  "ᴋɨ": 0,
  "ᴋɫ": 0,
  "ᴋɬ": 0,
  "ᴋɭ": 0,
  "ᴋɮ": 0,
  "ᴋɯ": 0,
  "ᴋɰ": 0,
  "ᴋɱ": 0,
  "ᴋɲ": 0,
  "ᴋɳ": 0,
  "ᴋɵ": 0,
  "ᴋɶ": 0,
  "ᴋɹ": 0,
  "ᴋɻ": 0,
  "ᴋɽ": 0,
  "ᴋɾ": 0,
  "ᴋʁ": 0,
  "ᴋʂ": 0,
  "ᴋʃ": 0,
  "ᴋʄ": 0,
  "ᴋʈ": 0,
  "ᴋʉ": 0,
  "ᴋʊ": 0,
  "ᴋʋ": 0,
  "ᴋʌ": 0,
  "ᴋʎ": 0,
  "ᴋʐ": 0,
  "ᴋʑ": 0,
  "ᴋʒ": 0,
  "ᴋʔ": 0,
  "ᴋʛ": 0,
  "ᴋʝ": 0,
  "ᴋʞ": "ΓΔΘΞΠΣΦΨΩαβγδεζηθικλμξπρςστυφχψω !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\näæçðøħŋœǂɐɒɓɔɕɖɗɘ¡¿ɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ‖ᴀʙᴅᴇғɢʜɪᴊᴋʟᴍɴᴘǫʀᴛʏԻԸԹիըթ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”", // codepage with newline
  "ᴋʡ": 0,
  "ᴋʢ": 0,
  "ᴋˌ": 0,
  "ᴋᶑ": 0,
  "ᴋ‖": 0,
  "ᴋᴀ": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // alphabet
  "ᴋʙ": 0,
  "ᴋᴅ": "0123456789", // decimal digits
  "ᴋᴇ": 0,
  "ᴋғ": 0,
  "ᴋɢ": 0,
  "ᴋʜ": "0123456789ABCDEF", // uppercase hexadecimal digits
  "ᴋɪ": 0,
  "ᴋᴊ": 0,
  "ᴋᴋ": "ΓΔΘΞΠΣΦΨΩαβγδεζηθικλμξπρςστυφχψω !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¶äæçðøħŋœǂɐɒɓɔɕɖɗɘ¡¿ɞɟɠɣɤɥɦɧɨɫɬɭɮɯɰɱɲɳɵɶɹɻɽɾʁʂʃʄʈʉʊʋʌʎʐʑʒʔʛʝʞʡʢˌᶑ‖ᴀʙᴅᴇғɢʜɪᴊᴋʟᴍɴᴘǫʀᴛʏԻԸԹիըթ‼°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼×÷¬ϨϩϪϫϮϯϰϱϷϸϻϼϾϿ┝┥«»‘’“”", // codepage with pilcrow
  "ᴋʟ": 0,
  "ᴋᴍ": 0,
  "ᴋɴ": 0,
  "ᴋᴘ": 0,
  "ᴋǫ": 0,
  "ᴋʀ": 0,
  "ᴋᴛ": 0,
  "ᴋʏ": "BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz", // consonants with Y
  "ᴋԻ": 0,
  "ᴋԸ": 0,
  "ᴋԹ": 0,
  "ᴋի": 0,
  "ᴋը": 0,
  "ᴋթ": 0,
  "ᴋ‼": 0,
  "ᴋ°": [0], // singleton list 0
  "ᴋ¹": [1], // singleton list 1
  "ᴋ²": [1, 2], // range to 2
  "ᴋ³": [1, 2, 3], // range to 3
  "ᴋ⁴": [1, 2, 3, 4], // range to 4
  "ᴋ⁵": 250, // 250; compression base
  "ᴋ⁶": 0,
  "ᴋ⁷": 0,
  "ᴋ⁸": 0,
  "ᴋ⁹": 0,
  "ᴋ⁺": 0,
  "ᴋ⁻": 0,
  "ᴋ⁼": 0,
  "ᴋ×": 0,
  "ᴋ÷": 0,
  "ᴋ¬": 0,
  "ᴋϨ": 0,
  "ᴋϩ": 0,
  "ᴋϪ": 0,
  "ᴋϫ": 0,
  "ᴋϮ": 0,
  "ᴋϯ": 0,
  "ᴋϰ": 0,
  "ᴋϱ": 0,
  "ᴋϷ": 0,
  "ᴋϸ": 0,
  "ᴋϻ": 0,
  "ᴋϼ": 0,
  "ᴋϾ": 0,
  "ᴋϿ": 0,
  "ᴋ┝": 0,
  "ᴋ┥": 0,
  "ᴋ«": 0,
  "ᴋ»": 0,
  "ᴋ‘": 0,
  "ᴋ’": 0,
  "ᴋ“": 0,
  "ᴋ”": 0
}
