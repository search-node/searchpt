var gulp = require('gulp');

// Plugins.
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');

var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require("gulp-rename");


// We only want to process our own non-processed JavaScript files.
var jsPath = ['./js/search.js', './js/*/*.js', '!./js/assets/*'];
var jsAssets = ['./js/assets/*.min.js'];
var sassPath = './scss/*.scss';

var buildDir = './build';

/**
 * Run Javascript through JSHint.
 */
gulp.task('jshint', function() {
  return gulp.src(jsPath)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/**
 * Process SCSS using libsass
 */
gulp.task('sass', function () {
  gulp.src(sassPath)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        'bower_components/compass-mixins/lib',
        'bower_components/foundation/scss'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./stylesheets'));
});

/**
 * Watch files for changes and run tasks.
 */
gulp.task('watch', function() {
  gulp.watch(jsPath, ['jshint']);
  gulp.watch(sassPath, ['sass']);
});


/**
 * Build single app.js file.
 */
gulp.task('appJs', function () {
  gulp.src(jsPath)
    .pipe(sourcemaps.init())
      .pipe(concat('search.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write('/maps'))
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest(buildDir))
});

/**
 * Build single app.js file.
 */
gulp.task('assetsJs', function () {
  gulp.src(jsAssets)
    .pipe(concat('assets.js'))
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest(buildDir))
});


// Tasks to compile sass and watch js file.
gulp.task('default', ['sass', 'watch']);

gulp.task('build', ['appJs', 'assetsJs', 'sass']);