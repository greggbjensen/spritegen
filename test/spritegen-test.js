var buster = require('buster');
buster.spec.expose(); // Make some functions global
var expect = buster.assertions.expect;
var assert = buster.assertions.assert;
var path = require('path');

describe("spritegen", function () {
    var SpriteGen = require('../lib/spritegen');

    it("constructor no options", function () {
        var spriteGen = new SpriteGen();

        expect(spriteGen.rootDir).toBeNull();
        expect(spriteGen.imagePadding).toBe(2);
        expect(spriteGen.verbose).toBe(false);
    });

    it("constructor with options", function () {
        var imagesPath = path.join(__dirname, 'images');
        var spriteGen = new SpriteGen({dir: imagesPath, verbose: false, padding: 5});

        expect(spriteGen.rootDir).not.toBeNull();
        expect(spriteGen.rootDir).toBeString();
        expect(spriteGen.imagePadding).toBe(5);
        expect(spriteGen.verbose).toBe(false);
    });

    it("prototype method check", function () {
        var spriteGen = new SpriteGen();

        //Figure out how to get working with expect
        assert.isFunction(spriteGen.execute);
        assert.isFunction(spriteGen._createSpritePackages);
        assert.isFunction(spriteGen._placeImages);
        assert.isFunction(spriteGen._renderImages);
        assert.isFunction(spriteGen._renderStyleSheet);
    });

});