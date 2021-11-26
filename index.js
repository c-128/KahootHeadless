const Headless = require('./headless.js');

(async () => {
    const headless = new Headless();
    await headless.askForPin();
    await headless.askForNickname();
    //console.log(headless.pin);
    await headless.joinGame();
})();