var SpriteGen = require('./spritegen');
var argv = require('optimist').argv;

// Index where arguments start.
var ARG_INDEX = 1;

/**
 * Converts a value to a boolean.
 * @param value Value to convert.
 * @return {*} True if converted and true; otherwise false.
 * @private
 */
var _toBoolean = function(value) {
  return value && value.toLowerCase() === 'true';
};

/**
 * Displays all help.
 */
var _displayHelp = function() {
    console.log(
    'Sprite generator that takes a root directory and recursively combines all images into a sprite and style sheet.\n' +
        '\t* Version: 0.0.1\n' +
        '\t* Usage: spritegen [options]\n\n' +
    'Options:\n' +
        '\t--help\t\t\tShows help.\n' +
        '\t--dir\t\t\tRoot directory to recursively process.\n' +
        '\t--padding\t\tPadding between images in pixels.\n' +
        '\t--verbose\t\tSets if logging is verbose (true/false).\n');
};

/**
 * Executes the command line interface.
 */
exports.execute = function() {

    try {

        // If --help is specified, only output help.
        if (argv.help) {
            _displayHelp();
        }
        else {
            var spriteGen = new SpriteGen({ dir: argv.dir, padding: argv.padding, verbose: _toBoolean(argv.verbose) });
            spriteGen.execute();
        }
    }
    catch (err) {
        console.log(err.message);

        // Throw errors if specified.
        if (_toBoolean(argv.throw)) {
            throw err;
        }
    }
};
