const Kahoot = require('kahoot.js-api');
const colors = require('colors');
const readline = require('readline');

module.exports = class Headless {

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.client = new Kahoot();
    }

    async askForPin() {
        return new Promise((resolve, reject) => {
            this.rl.question('Game PIN> '.cyan, (pin) => {
                if (Number.isInteger(parseInt(pin))) {
                    this.gamepin = parseInt(pin);
                    resolve();
                } else {
                    reject('You did not enter a number'.red);
                }
            });
        });
    }

    async askForNickname() {
        return new Promise((resolve, reject) => {
            this.rl.question('Game Nickname> '.cyan, (nickname) => {
                if (nickname.length < 15) {
                    this.nickname = nickname;
                    resolve();
                } else {
                    reject('Nickname can not be longer than 15 symbols'.red);
                }
            });
        });
    }

    async joinGame() {
        return new Promise((resolve, reject) => {
            this.client.join(this.gamepin, this.nickname).then(() => {
                this.client.on('Joined', () => {
                    console.log(`Joined the game.`.gray);
                });

                this.client.on('Disconnect', reason => {
                    console.log(`Left the game with the reason: ${reason}`.gray);
                });

                this.client.on('QuizStart', quiz => {
                    console.log('Quiz started.'.gray);
                    this.quizTotalQuestions = quiz.questionCount;
                });
            
                this.client.on('QuizEnd', () => {
                    console.log('Quiz ended.'.gray);
                });

                this.client.on('QuestionStart', async question => {
                    let questionAnwser = await this.askForQuestionAwnser(question);
                    question.answer(questionAnwser - 1);
                    console.log(`Anwsered with awnser ${questionAnwser}`);
                });
            
                this.client.on('QuestionEnd', question => {
                    console.log(`Question ended.`.gray);
                    let correctAwnser = 'false'.red;
                    if (question.isCorrect) {
                        correctAwnser = 'true'.green;
                    }
            
                    console.log(`Your rank: ${question.rank}, your score: ${question.pointsData.totalPointsWithBonuses}, correct awnser: ${correctAwnser}`);
                    console.log(`Points earned: ${question.pointsData.questionPoints}, streak level: ${question.pointsData.answerStreakPoints.streakLevel}`);
                });


                this.client.on('Podium', podium => {
                    console.log(`Podium animation, youur medal is: ${podium.podiumMedalType}`.yellow);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    async askForQuestionAwnser(question) {
        return new Promise((resolve, reject) => {
            let choices = question.numberOfChoices;
            this.rl.question(`Question ${question.index+1}/${this.quizTotalQuestions} (${choices})> `.cyan, answerString => {
                let answerInt = parseInt(answerString);
                if (Number.isInteger(parseInt(answerString))) {
                    if (answerInt > choices) {
                        reject('Answer to high');
                    } else {
                        resolve(answerInt);
                    }
                } else {
                    reject('You did not enter a number');
                }
            });
        });
    }

    get pin() {
        return this.gamepin;
    }

    get nickanme() {
        return this.nickname;
    }
}
