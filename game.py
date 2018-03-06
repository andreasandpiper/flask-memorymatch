class Game:

    def __init__(self):
        self.matches = 0
        self.attempts = 0
        self.games_won = 0
        self.salt_count = 0
        self.gold_count = 0
        self.lives = 3
        self.diamond_count = 0

    def win(self):
        self.games_won += 1

    def add_match(self):
        self.matches += 1
        return self.matches

    def add_resource(self, resource):
        self.resource += 1

    def lose_resource(self, resource):
        if resource >= 1:
            self.resource -= 1
        
    def attempt(self):
        self.attempts += 1
        return self.attempts

    def new_game(self):
        self.matches = 0
        self.attempts = 0

