// Require statements.
var Canvas = require('canvas');
var Image = Canvas.Image;
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

// Valid image file extensions.
var IMAGE_FILE_EXTENSIONS = ['.png', '.jpg', '.tiff', '.gif', '.bmp'];

// Regex for fixing image file names.
var FILE_NAME_REGEXP = /\.|\s/ig;

/**
 * Replaces all tokens in a string.
 * @param template Template with tokens.
 * @param replacements Token replacements.
 * @return {*} Final string.
 * @private
 */
var _replaceTokens = function (template, replacements) {
    for (var tag in replacements) {
        var reg = new RegExp('\{' + tag + '\}', 'g');
        template = template.replace(reg, replacements[tag]);
    }

    return template;
};

/**
 * Checks if the specified file is an image.
 * @param fileName Name of the file.
 * @private
 */
var _isImageFile = function(fileName) {

    // Check if file extension matches valid image extensions.
    var ext = path.extname(fileName).toLowerCase();
    return _.any(IMAGE_FILE_EXTENSIONS, function(imageExt) {
        return ext === imageExt;
    });
};

/**
 * Sprite generator for recursing directories.
 * @param options Options for generation.
 * @constructor
 */
var SpriteGen = function(options) {

    // Default settings if not specified in options.
    var settings = _.extend({
        dir: null  // Root directory to process.
    }, options);

    // Root directory to begin processing.
    this.rootDir = settings.dir;
}

_.extend(SpriteGen.prototype, {

    /**
     * Creates a sprite packages for the specified directory.
     * @param dir Directory to run on.
     * @private
     */
    _createSpritePackages: function(dir) {

        var spritePackage = {
            path: null,
            dir: dir,
            width: 0,
            height: 0,
            images: [],
            style: []
        };

        // Create path to namespace images, if it is not the root, add a separating -.
        spritePackage.path = path.relative(this.rootDir, dir)
            .replace('/', '-')
            .replace(' ', '-');
        if (spritePackage.path.length > 0) {
            spritePackage.path += '-';
        }

        // Add information for each image file.
        var folderItems = fs.readdirSync(dir);
        var self = this;
        _.each(folderItems, function(folderItem){

            // Recurse if it is a directory; otherwise gather images.
            var fullPath = path.resolve(dir, folderItem);
            if (fs.statSync(fullPath).isDirectory()) {
                self._createSpritePackages(fullPath);

                // Make sure to only process images.
            }
            else if (_isImageFile(folderItem)) {

                // Create image for file, and add to package.
                var image = new Image();
                image.src = fullPath;

                var imageInfo = {
                    image: image,
                    position: {
                        top: spritePackage.height,
                        left: 0
                    }
                };

                spritePackage.images.push(imageInfo);

                // Update the width of the whole package to the largest size.
                spritePackage.width = image.width > spritePackage.width ? image.width : spritePackage.width;

                // Add image height as images are laid out vertically.
                spritePackage.height += image.height;

                // Add stylesheet for image.
                var style =
                    '.{path}{file} {\n' +
                        '\tbackground-image: url("sprite.png");\n' +
                        '\tbackground-repeat: no-repeat;\n' +
                        '\tbackground-position: {left}px {top}px;\n' +
                        '\twidth: {width}px;\n' +
                        '\theight: {height}px;\n' +
                    '}\n\n';

                // Format style and push into style sheet.
                spritePackage.style.push(_replaceTokens(style, {
                    path: spritePackage.path,
                    file: folderItem.replace(FILE_NAME_REGEXP, '-'),
                    left: imageInfo.position.left,
                    top: imageInfo.position.top,
                    width: image.width,
                    height: image.height
                }));
            }
        });

        // Render images and style sheet if there were any.
        if (spritePackage.images.length > 0) {
            this._renderImages(spritePackage);
            this._renderStyleSheet(spritePackage);
        }
    },

    /**
     * Renders all images in a sprite package.
     * @param spritePackage Sprite package.
     * @private
     */
    _renderImages: function(spritePackage) {

    },

    /**
     * Renders all styles in a sprite package.
     * @param spritePackage Sprite package.
     * @private
     */
    _renderStyleSheet: function(spritePackage) {

        var fullPath = path.join(spritePackage.dir, 'sprite.css');
        console.log(_replaceTokens('Creating file {fileName}.', { fileName: fullPath }));

        var writer = fs.createWriteStream(fullPath);
        _.each(spritePackage.style, function(styleLine) {
           writer.write(styleLine);
        });
    },

    /**
     * Executes sprite generation on the specified directory.
     * @param options Options to use when executing generation.
     */
    execute: function () {

        // Verify root directory was specified.
        if (!this.rootDir) {
            throw new Error('options.dir is required.');
        }

        // Get full path.
        this.rootDir = path.resolve(this.rootDir);
        this._createSpritePackages(this.rootDir);
    }
});

module.exports = SpriteGen;