// Initialize modules
const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();

// Use dart-sass for @use
//sass.compiler = require('dart-sass');

// Sass Task
function scssTask() {
  return src('app/scss/style.scss', { sourcemaps: true }) //source maps allow us to easily search minicss files
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()])) //autoprefixer adds the necessary prefixes to support older browsers
    .pipe(dest('dist', { sourcemaps: '.' })); // sets the destination of the compiled file
}

// JavaScript Task
function jsTask() {
  return src('app/js/script.js', { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env'] })) // compiles modern js to old browsers
    .pipe(terser()) // minify the js file 
    .pipe(dest('dist', { sourcemaps: '.' })); // sets the destination of the compiled file
}

// Browsersync
function browserSyncServe(cb) { // sets up a local server to reload the local website on save
  browsersync.init({
    server: {
      baseDir: '.',
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
      },
    },
  });
  cb();
}
function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() { // watches the specified files and runs the necessary tasks
  watch('*.html', browserSyncReload);
  watch(
    ['app/scss/**/*.scss', 'app/**/*.js'],
    series(scssTask, jsTask, browserSyncReload)
  );
}

// Default Gulp Task
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask); 

// Build Gulp Task
exports.build = series(scssTask, jsTask);