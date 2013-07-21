// settings
var FILE_ENCODING = 'utf-8',
    EOL = '\n',
    DIST_FILE_PATH = 'build/jest.js',
	MIN_FILE = 'build/jest.min.js';

// setup
var _fs = require('fs');

function concat(fileList, distPath) {
    var out = fileList.map(function(filePath){
            return _fs.readFileSync(filePath, FILE_ENCODING);
        });

    _fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
    console.log(' '+ distPath +' built.');
}

function uglify(srcPath, distPath) {
    var
      uglyfyJS = require('uglify-js'),
      jsp = uglyfyJS.parser,
      pro = uglyfyJS.uglify,
      ast = jsp.parse( _fs.readFileSync(srcPath, FILE_ENCODING) );

    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);

    _fs.writeFileSync(distPath, pro.gen_code(ast), FILE_ENCODING);
    console.log(' '+ distPath +' built.');
}

concat([
    'source/seedRandom.js',
    'source/game.js',
    'source/vector.js',
    'source/utilities.js',
    'source/resourceManager.js',
    'source/label.js',
    'source/renderer.js',
    'source/sprite.js',
    'source/emitter.js',
    'source/particle.js',
    'source/ui/ui.js',
    'source/ui/button.js',
    'source/ui/cursor.js',
    'source/parralaxBackground.js',
    'source/background.js',
    'source/transition.js'
], DIST_FILE_PATH);

uglify(DIST_FILE_PATH, MIN_FILE);