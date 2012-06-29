var buster = require('buster');
buster.spec.expose(); // Make some functions global
var expect = buster.assertions.expect;
var assert = buster.assertions.assert;
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

describe("spritegen", function () {
    var SpriteGen = require('../lib/spritegen');
    var extensions = ['.png', '.jpeg', '.tiff', '.bmp', '.gif'];

    var imagesPath = path.join(__dirname, 'images');
    var spritePng = path.join(imagesPath, 'sprite.png');
    var spriteCss = path.join(imagesPath, 'sprite.css');
    var spriteGen = new SpriteGen({dir: imagesPath, verbose: false, padding: 5});

    //Remove any left-over sprite files from previous tests
    if(fs.exists(spritePng), function (exists) {
        if(exists){
            fs.unlink(spritePng, function (err) {
                if (err) throw err;
                console.log('successfully deleted /sprite.png');
            });
        }
    });
    if(fs.exists(spriteCss), function (exists) {
        if(exists){
            fs.unlink(spriteCss, function (err) {
                if (err) throw err;
                console.log('successfully deleted /sprite.css');
            });
        }
    });

    it("constructor with no options", function () {
        var spriteGen_noOptions = new SpriteGen();

        expect(spriteGen_noOptions.rootDir).toBeNull();
        expect(spriteGen_noOptions.imagePadding).toBe(2);
        expect(spriteGen_noOptions.verbose).toBe(false);
    });

    it("constructor with options", function () {
        expect(spriteGen.rootDir).not.toBeNull();
        expect(spriteGen.rootDir).toBeString();
        expect(spriteGen.imagePadding).toBe(5);
        expect(spriteGen.verbose).toBe(false);
    });

    it("prototype method check", function () {
        //TODO Figure out how to get working with expect style assertions
        assert.isFunction(spriteGen.execute);
        assert.isFunction(spriteGen._createSpritePackages);
        assert.isFunction(spriteGen._placeImages);
        assert.isFunction(spriteGen._renderImages);
        assert.isFunction(spriteGen._renderStyleSheet);
    });

    it("check spritegen output", function () {
        spriteGen.execute();

        expect(fs.existsSync(path.join(imagesPath, 'sprite.png'))).toBe(true);
        expect(fs.existsSync(path.join(imagesPath, 'sprite.css'))).toBe(true);

        //Each item in the spritePackage should have an image-type file extension
        if(spriteGen.spritePackages.length > 0){
            _.each(spriteGen.spritePackages, function (spritePackage) {
                _.each(spritePackage.images, function (image) {
                    expect(extensions.indexOf(path.extname(image.fileName))).not.toBe(-1);
                });
            });
        }
    });
});