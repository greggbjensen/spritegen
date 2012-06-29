var BusterWin = require('buster-win');
var busterWin = new BusterWin({ tests: /-test\.js$/i });
busterWin.run(__dirname);