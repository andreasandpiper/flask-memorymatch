from flask import Flask, render_template, redirect, url_for
import sys
import logging

app = Flask(__name__) 

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/game')
def game():
    return render_template('game.html')

if __name__ == '__main__': app.run(debug=True)

