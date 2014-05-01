var gulp    =   require('gulp'),
    jshint  =   require('gulp-jshint'),
    uglify  =   require('gulp-uglify'),
    rename  =   require('gulp-rename'),
    concat  =   require('gulp-concat'),
    markdox =   require('gulp-markdox');

gulp.task('doc', function(){
    gulp.src('source/**/*.js')
    .pipe(markdox())
    .pipe(rename({
        extname : ".md"
    }))
    .pipe(gulp.dest('docs'));
});

gulp.task('build', function() {
    return gulp.src('source/**/*.js')
        .pipe(concat('jest.js'))
        .pipe(gulp.dest('release'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({
            mangle : true
        }))
        .pipe(gulp.dest('release'));
});

gulp.task('default', ['build']);
