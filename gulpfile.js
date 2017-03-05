var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var autoprefix = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");

var livereload = require('gulp-livereload');
var connect = require('gulp-connect-php');

// Compile Less, autoprefix CSS3, and save to target CSS directory
gulp.task('toLess', function () {
    return gulp.src('css/*.less')
        .pipe(less({ style: 'expanded' }))
        .pipe(gulp.dest('css'));
        // .pipe(rename({suffix: '.min'}))
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        // .pipe(gulp.dest('dist'));
});

// Keep an eye on Sass, Coffee, and PHP files for changes...
gulp.task('watch', function () {
	livereload.listen();

    gulp.watch('css/*.less', ['toLess']);
    gulp.watch('./*.php', function(event){
    	gulp.src(event.path)
    		.pipe(livereload());
    });
});

gulp.task('connect', function() {
	connect.server({
		hostname: 'localhost',
		port: 8888,
        base: './',
		livereload: true
	});
});

// What tasks does running gulp trigger?
gulp.task('default', ['toLess', 'watch', 'connect']);
