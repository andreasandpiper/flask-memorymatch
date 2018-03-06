from flask import Flask, render_template, abort, redirect, url_for, jsonify, request
import game
import sys
import logging


app = Flask(__name__) 

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)


current_game = game.Game(0)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.route('/game', methods=["POST", 'GET'])
def game():
    global current_game
    if request.method == 'POST':
        score = current_game.add_match()
        data = {}
        data['matches'] = score
        data['total'] = 9
        return jsonify(data)
    else: 
        current_game.new_game()
        return render_template('game.html', attempts = current_game.attempts, wins = current_game.games_won)

@app.route('/attempt', methods=["POST"])
def attempt():
    global current_game
    attempts = current_game.attempt()
    data = {}
    data['attempts'] = attempts
    data['matches'] = current_game.matches
    return jsonify(data)

@app.route('/winner', methods=["POST"])
def winner():
    data = {}
    global current_game
    if current_game.matches == 9:
        data['status'] = "true"
        current_game.new_game()
        current_game.win()
    else:
        data['status'] = "false"
        current_game.matches = 0
    return jsonify(data)




if __name__ == '__main__': app.run(debug=True)

