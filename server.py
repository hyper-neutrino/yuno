from flask import Flask, render_template
from flask_cors import CORS

app = Flask("yuno")
CORS(app)

@app.route("/")
def serve_root():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = 5105, debug = True)
