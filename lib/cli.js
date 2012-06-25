var SpriteGen = require('./spritegen');
var _ = require('underscore');
var argv = require('optimist').argv;

// Index where arguments start.
var ARG_INDEX = 1;

/**
 * Executes the command line interface.
 */
exports.execute = function() {

    try {
        var spriteGen = new SpriteGen({ dir: argv.dir, padding: argv.padding });
        spriteGen.execute();
    }
    catch (err) {
        console.log(err.message);

        // Remove this later.
        throw err;
    }
};
