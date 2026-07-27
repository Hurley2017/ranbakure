import os
from flask import Flask, render_template

# Point Flask to find templates/ and static/ at project root (one level above api/)
_root = os.path.join(os.path.dirname(__file__), "..")

app = Flask(
    __name__,
    template_folder=os.path.join(_root, "templates"),
    static_folder=os.path.join(_root, "static"),
)


@app.route("/")
def index():
    return render_template("index.html")
