import html

from flask import Flask, render_template
from flask_cors import CORS

from src.yuno import codepage

app = Flask("yuno")
CORS(app)

@app.route("/")
def serve_root():
    return render_template("index.html")

@app.route("/verbs")
def serve_verbs():
    with open("static/verbs.txt") as f:
        return "<title>yuno verbs</title><link rel='shortcut icon' type='image/png' href='/static/favicon.png' /><pre><code>" + html.escape(f.read()) + "</code></pre><style>body,pre,code{background-color:#1c1b22;color:#fbfbfe;font-family:'Consolas',monospace}</style>"

@app.route("/adverbs")
def serve_adverbs():
    with open("static/adverbs.txt") as f:
        return "<title>yuno adverbs</title><link rel='shortcut icon' type='image/png' href='/static/favicon.png' /><pre><code>" + html.escape(f.read()) + "</code></pre><style>body,pre,code{background-color:#1c1b22;color:#fbfbfe;font-family:'Consolas',monospace}</style>"

@app.route("/builtins")
def serve_builtins():
    with open("static/verbs.txt") as f:
        with open("static/adverbs.txt") as g:
            return "<title>yuno builtins</title><link rel='shortcut icon' type='image/png' href='/static/favicon.png' /><pre><code>===========\n== VERBS ==\n===========\n\n" + html.escape(f.read()) + "\n\n=============\n== ADVERBS ==\n=============\n\n" + html.escape(g.read()) + "</code></pre><style>body,pre,code{background-color:#1c1b22;color:#fbfbfe;font-family:'Consolas',monospace}</style>"

@app.route("/codepage")
def serve_codepage():
    return render_template("codepage.html", codepage = "\n".join(codepage.replace("\n", "¶")[i:][:16] for i in range(0, 256, 16)))

@app.route("/sourcecode")
def serve_source_code():
    code = ""
    for filename in ["utilities", "yunofuncs", "adverbs", "verbs", "constants", "yuno"]:
        with open(f"src/{filename}.py", "r") as f:
            code += f.read() + "\n"
    return code

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = 5105, debug = True)
