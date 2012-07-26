// Require statements.

var Canvas = require('canvas');
var Image = Canvas.Image;
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

// Valid image file extensions.
var IMAGE_FILE_EXTENSIONS = ['.png', '.jpg', '.tiff', '.gif', '.bmp'];

// Regex for fixing image file names.
var FILE_NAME_REGEXP = /\.|\s|_/ig;

// Weight of width over height in sorting.
var WIDTH_WEIGHT = 10000;

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
    }) && fileName !== 'sprite.png';
};

/**
 * Sprite generator for recursing directories.
 * @param options Options for generation.
 * @constructor
 */
var SpriteGen = function(options) {
    // Default settings if not specified in options.
    var settings = _.extend({
        dir: null,      // Root directory to process.
        padding: 2,     // Padding between images.
        verbose: false  // True if logging output should be verbose; otherwise false.
    }, options);

    // Root directory to begin processing.
    this.rootDir = settings.dir;
    this.verbose = settings.verbose;
    this.imagePadding = settings.padding;
    this.spritePackages = [];
};

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
                    fileName: folderItem,
                    position: {
                        top: 0,
                        left: 0
                    }
                };

                spritePackage.images.push(imageInfo);
            }
        });

        // Add sprite package to package list if there were any images.
        if (spritePackage.images.length > 0) {
            this.spritePackages.push(spritePackage);
        }
        else {
           console.log(_replaceTokens('No images found for directory "{dir}".', { dir: dir }));
        }
    },

    /**
     * Places all images in a package.
     * @spritePackage Package that contains all images for a sprite.
     * @private
     */
    _placeImages: function(spritePackage) {

        // Sort all images by height ascending.
        var images = _.sortBy(spritePackage.images, function(imageInfo) {
           return (imageInfo.image.width * WIDTH_WEIGHT) + imageInfo.image.height;  // Force sort by width and then height by weighting width.
        });

        // Set the sprite to the largest width.
        spritePackage.width = images[images.length - 1].image.width;

        // Place all images left to right, up to the width.
        var currentTop = 0;
        var currentLeft = 0;
        var maxRowHeight = 0;
        var self = this;
        _.each(images, function(imageInfo) {

            // If the image will not fit in the current row; start a new row.
            if (currentLeft + self.imagePadding +  imageInfo.image.width > spritePackage.width) {

                // Update current top to previous top plus the max hieght of the placed image in the row above.
                currentTop = currentTop + maxRowHeight + self.imagePadding;

                // Reset max row height and current left for new row.
                currentLeft = 0;
                maxRowHeight = 0;
            }

            // Place image.
            imageInfo.position.top = currentTop;
            imageInfo.position.left = currentLeft + self.imagePadding;

            // Update current left position to place next image.
            currentLeft += self.imagePadding + imageInfo.image.width;

            // Update max height to largest hieght placed image.
            maxRowHeight = imageInfo.image.height > maxRowHeight ? imageInfo.image.height : maxRowHeight;
        });

        // Set final height of spritePackage.
        spritePackage.height = currentTop + maxRowHeight;
    },

    /**
     * Renders all images in a sprite package.
     * @param spritePackage Sprite package.
     * @private
     */
    _renderImages: function(spritePackage) {
        var canvas  = new Canvas(spritePackage.width, spritePackage.height);
        var context = canvas.getContext('2d');

        if (this.verbose) {
            console.log(_replaceTokens('Rendering sprite for directory "{dir}".', { dir: spritePackage.dir }));
        }

        // Draw all images.
        var self = this;
        _.each(spritePackage.images,  function(imageInfo) {
            if (self.verbose) {
                console.log(_replaceTokens('\tRendering image "{image}" ({left}, {top}, {width}, {height}).', {
                    image: imageInfo.image.src,
                    left: imageInfo.position.left,
                    top: imageInfo.position.top,
                    width: imageInfo.image.width,
                    height: imageInfo.image.height
                }));
            }
            var image = imageInfo.image;
            try {
                context.drawImage(image, imageInfo.position.left, imageInfo.position.top, imageInfo.image.width, imageInfo.image.height);
            }
            catch(err) {
                console.log(_replaceTokens('\t\t{err} - "{image}".', { image: imageInfo.image.src, err: err }));
            }
        });

        // Create file stream for writing image.
        var self = this;
        (function(){
            var imagePath = path.join(spritePackage.dir, 'sprite.png');
            var imageFile = fs.createWriteStream(imagePath);

            // Create png image stream.
            var stream = canvas.createPNGStream();

            // Listen for data event.
            stream.on('data', function (chunk) {
                imageFile.write(chunk);
            });

            // Listen for end event.
            stream.on('end', function (chunk) {
                // Console output.
                console.log(_replaceTokens('Wrote sprite "{fileName}".', { fileName: imagePath }));
            });
        })();
    },

    /**
     * Renders all styles in a sprite package.
     * @param spritePackage Sprite package.
     * @private
     */
    _renderStyleSheet: function(spritePackage) {

        var fullPath = path.join(spritePackage.dir, 'sprite.css');

        // Style template for each image.
        var style =
            '.{path}{file} {\n' +
                '\tbackground-image: url("sprite.png");\n' +
                '\tbackground-repeat: no-repeat;\n' +
                '\tbackground-position: -{left}px -{top}px;\n' +
                '\twidth: {width}px;\n' +
                '\theight: {height}px;\n' +
                '}\n\n';

        (function(){
            var writer = fs.createWriteStream(fullPath);

            // Output style template for each image.
            _.each(spritePackage.images, function(imageInfo) {
               writer.write(_replaceTokens(style, {
                   path: spritePackage.path,
                   file: imageInfo.fileName.replace(FILE_NAME_REGEXP, '-'),
                   left: imageInfo.position.left,
                   top: imageInfo.position.top,
                   width: imageInfo.image.width,
                   height: imageInfo.image.height
               }));
            });
        })();

        if (this.verbose) {
            console.log(_replaceTokens('\tWrote style sheet "{fileName}".', { fileName: fullPath }));
        }
    },

    /**
     * Executes sprite generation on the specified directory.
     */
    execute: function () {

        // Verify root directory was specified.
        if (!this.rootDir) {
            throw new Error('options.dir is required.');
        }

        // Get full path.
        this.rootDir = path.resolve(this.rootDir);

        // Read all image information into packages for sprites.
        this._createSpritePackages(this.rootDir);

        // Place all images in the sprite packages, then render them.
        var self = this;
        _.each(this.spritePackages, function(spritePackage) {
            self._placeImages(spritePackage);
            self._renderImages(spritePackage);
            self._renderStyleSheet(spritePackage);
        });
    }
});

module.exports = SpriteGen;