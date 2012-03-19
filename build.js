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
    'js/jgame/vector.js',
    'js/jgame/utilities.js',
    'js/jgame/seedRandom.js',
    'js/jgame/resource.js',
    'js/jgame/resourceManager.js',
    'js/jgame/label.js',
    'js/jgame/game.js',
    'js/jgame/renderer.js',
    'js/jgame/sprite.js',
    'js/jgame/emitter.js',
    'js/jgame/particle.js',
    'js/jgame/ui/ui.js',
    'js/jgame/ui/button.js',
    'js/jgame/ui/cursor.js',
    'js/jgame/parralaxBackground.js',
    'js/jgame/background.js',
    'js/jgame/transition.js',
    'js/jgame/background.js',
], DIST_FILE_PATH);

uglify(DIST_FILE_PATH, MIN_FILE);