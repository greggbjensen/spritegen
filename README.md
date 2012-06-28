spritegen
=========

Sprite generator that takes a root directory and recursively combines all images into a sprite and style sheet.

## Before You Install
Spritegen requires a fork of node-canvas, which requires Cairo. To install Cairo follow the portion of the [Wiki](https://github.com/LearnBoost/node-canvas/wiki/_pages) that pertains to your operating system.
Only follow the installing Cairo section, I'll walk you through the rest. Once Cairo is installed follow these steps:

1. Add C:\GTK\bin to your path environment variable.
2. Ensure that you have Python27 installed
3. Ensure that you have node-gyp installed. If you don't then navigate to your nodejs install location and npm install -g node-gyp.
4. Restart your computer

## Installation
    npm install spritegen

### Canvas Note
If you're noticing that we are requiring a module called canvas-gyp instead of canvas, it's because node-canvas includes both waf and gyp. It is buggy and in our experience, always fails to compile on Windows machines. We created a fork called canvas-gyp that only uses gyp, which installs correctly on Windows.
## Examples

### Basic usage:

	$ spritegen --dir site/images

Recursively combines all images inside the directory "site/images" into one sprite.png and sprite.css per directory and sub-directory.

    site/
        images/
            icons/
                answer.png
                connect.png
                discover.png

The sprite.css is generated with classes by folder and file name.

```css
    .icons-answer-png {
        background-image: url("sprite.png");
        background-repeat: no-repeat;
        background-position: 0px 2px;
        width: 22px;
        height: 22px;
    }

    .icons-connect-png {
        background-image: url("sprite.png");
        background-repeat: no-repeat;
        background-position: 0px 26px;
        width: 26px;
        height: 22px;
    }

    .icons-discover-png {
        background-image: url("sprite.png");
        background-repeat: no-repeat;
        background-position: 0px 50px;
        width: 28px;
        height: 22px;
    }
```

This CSS works by simply assigning the class name to an element.

```html
	<!DOCTYPE html>
	<html>
		<head>
			<title>spritegen example</title>
			<link rel="stylesheet" href="images/icons/sprite.css"/>
		</head>
		<body>
			<p>
				<span class="icons-answer-png"></span>
				<span class="icons-connect-png"></span>
				<span class="icons-discover-png"></span>
			</p>
		</body>
	</html>
```

### API usage:

spritegen can also be called directly by including the module.

```javascript
    var SpriteGen = require('spritegen');
    var imagesPath = path.join(__dir, 'public/images');
    var spriteGen = new SpriteGen({ dir: imagesPath, padding: 5 });
    spriteGen.execute();
```

### Show help:

	$ spritegen --help
    => [spritegen]
    Sprite generator that takes a root directory and recursively combines all images into a sprite and style sheet.
        * Version: 0.0.1
        * Usage: spritegen [options]

    Options:
        --help			Shows help.
        --dir			Root directory to recursively process.
        --padding		Padding between images in pixels.
        --verbose		Sets if logging is verbose (true/false).