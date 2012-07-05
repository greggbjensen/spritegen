var SpriteGen = require('./spritegen');
var argv = require('optimist')
                .boolean(['verbose', 'throw'])
                .argv;

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
 * Removes any undefined options.
 * @param options Options to sanitize.
 * @private
 */
var _sanitizeOptions = function(options) {
    for (var name in options) {
        if (typeof options[name] === 'undefined') {
            delete options[name];
        }
    }

    return options;
};

/**
 * Executes the command line interface.
 */
exports.execute = function() {

    try {

        // If --help is specified or no arguments, only output help.
        if (argv.help || process.argv.length === 2) {
            _displayHelp();
        }
        else {
            var spriteGen = new SpriteGen(_sanitizeOptions({ dir: argv.dir, padding: argv.padding, verbose: argv.verbose }));
            spriteGen.execute();
        }
    }
    catch (err) {
        console.log(err.message);

        // Throw errors if specified.
        if (argv.throw) {
            throw err;
        }
    }
};
