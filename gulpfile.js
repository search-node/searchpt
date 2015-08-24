var gulp = require('gulp');

// Plugins.
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');

var sourcemaps = require('gulp-sourcemaps');


// We only want to process our own non-processed JavaScript files.
var jsPath = ['./js/*/*.js', '!./js/assets/*'];
var sassPath = './scss/*.scss';

// Run Javascript through JSHint.
gulp.task('jshint', function() {
  return gulp.src(jsPath)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Process SCSS using libsass
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

gulp.task('watch', function() {
  gulp.watch(jsPath, ['jshint']);
  gulp.watch(sassPath, ['sass']);
});

// Tasks to compile sass and watch js file.
gulp.task('default', ['sass', 'watch']);