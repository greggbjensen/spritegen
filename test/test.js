var should = require('chai').should();
var path = require('path');

describe('spritegen', function () {
    var SpriteGen = require('../lib/spritegen');
    var imagesPath = path.join(__dirname, 'images');

    var spriteGen = new SpriteGen();
    var spriteGen_Dir = new SpriteGen({dir: imagesPath});

    it('prototype methods', function () {
        spriteGen.should.respondTo('execute');
        spriteGen.should.respondTo('_createSpritePackages');
        spriteGen.should.respondTo('_renderImages');
        spriteGen.should.respondTo('_renderStyleSheet');
    });

    it('execute', function () {
        should.Throw(function () {spriteGen.execute()}, Error);
        should.not.Throw(function () {spriteGen_Dir.execute()});
    });

    it('_createSpritePackages', function () {

    });
});