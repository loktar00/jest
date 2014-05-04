var gulp    =   require('gulp'),
    jshint  =   require('gulp-jshint'),
    uglify  =   require('gulp-uglify'),
    rename  =   require('gulp-rename'),
    concat  =   require('gulp-concat'),
    markdox =   require('gulp-markdox');

var sources = [
        "source/game.js",
        "source/seedRandom.js",
        "source/vector.js",
        "source/utilities.js",
        "source/resourceManager.js",
        "source/label.js",
        "source/renderer.js",
        "source/sprite.js",
        "source/emitter.js",
        "source/particle.js",
        "source/ui/ui.js",
        "source/ui/button.js",
        "source/ui/cursor.js",
        "source/parralaxBackground.js",
        "source/background.js",
        "source/transition.js"
    ];

gulp.task('doc', function(){
    gulp.src('source/**/*.js')
    .pipe(markdox())
    .pipe(rename({
        extname : ".md"
    }))
    .pipe(gulp.dest('docs'));
});

gulp.task('build', function() {
    return gulp.src(sources)
        .pipe(concat('jest.js'))
        .pipe(gulp.dest('release'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({
            mangle : true
        }))
        .pipe(gulp.dest('release'));
});

gulp.task('default', ['build']);
