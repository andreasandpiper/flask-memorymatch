from flask import Flask, render_template, abort, redirect, url_for
import logging


app = Flask(__name__)

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)

@app.route('/')
def index():
    return render_template('index.html')





if __name__ == '__main__': app.run(debug=True)