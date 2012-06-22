// Require statements.
// var Canvas = require('canvas');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

/**
 * Sprite generator for recursing directories.
 * @param options Options for generation.
 * @constructor
 */
var SpriteGen = function(options) {

    // Default settings if not specified in options.
    var settings = _.extend(options, {
        dir: null  // Root directory to process.
    })

    // Root directory to begin processing.
    this.rootDir = settings.dir;

    // List of sprite packages with info for images and stylesheets.
    this.spritePackages = [];
}

_.extend(SpriteGen.prototype, {

    /**
     * Replaces all tokens in a string.
     * @param template Template with tokens.
     * @param replacements Token replacements.
     * @return {*} Final string.
     * @private
     */
    _replaceTokens: function (template, replacements) {
        for (var tag in replacements) {
            var reg = new RegExp('\{' + tag + '\}', 'g');
            template = template.replace(reg, replacements[tag]);
        }

        return template;
    },

    /**
     * Creates a sprite package for the specified directory.
     * @param dir Directory to run on.
     * @private
     */
    _createSpritePackage: function(dir) {

        var spritePackage = {
            path: null,
            images: []
        };

        // Create
        var fileNames = fs.readdirSync(dir);
        _.each(fileNames, function(fileName){
            console.log(fileName);
        });
    },

    /**
     * Executes sprite generation on the specified directory.
     * @param options Options to use when executing generation.
     */
    execute: function () {

        // Verify root directory was specified.
        if (this.rootDir) {
            throw new Error('options.dir is required.');
        }

        this._createSpritePackage(this.rootDir);
    }
});

module.exports = SpriteGen;