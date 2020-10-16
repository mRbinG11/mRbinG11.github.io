var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCss = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', async function() {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'))

  // Font Awesome
  gulp.src([
      './node_modules/@fortawesome/**/*',
    ])
    .pipe(gulp.dest('./vendor'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'))

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'))

});

// Compile SCSS
gulp.task('css:compile', function () {
  return gulp.src('./scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(header(banner, { pkg: pkg }))
      .pipe(gulp.dest('./css'));
});
// gulp.task('css:compile', function() {
//   return gulp.src('./scss/**/*.scss')
//     .pipe(sass.sync({
//       outputStyle: 'expanded'
//     }).on('error', sass.logError))
//     .pipe(autoprefixer({
//       browsers: ['last 2 versions'],
//       cascade: false
//     }))
//     .pipe(header(banner, {
//       pkg: pkg
//     }))
//     .pipe(gulp.dest('./css'))
// });

// Minify CSS
gulp.task('css:minify', function() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', gulp.series('css:compile', 'css:minify'));

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', gulp.series('js:minify'));

// Default task
gulp.task('default', gulp.series('vendor', gulp.parallel('css', 'js')));

// Min
gulp.task('min', gulp.parallel('css', 'js'));

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Watch task
gulp.task('watch', function() {
  gulp.watch('./scss/*.scss', gulp.series('css'));
  gulp.watch('./js/*[^\.min].js', gulp.series('js'));
  gulp.watch('./css/*.min.css').on('change', browserSync.reload);
  gulp.watch('./*.html').on('change', browserSync.reload);
})

// Dev task
gulp.task('dev', gulp.series('css', 'js', gulp.parallel('browserSync', 'watch')));

// Clean
gulp.task('clean', function() {
  return gulp.src('../resume', {read: false})
        .pipe(clean({force:true}));
});

//Fonts
gulp.task('copy:fonts', function() {
  return gulp.src('./vendor/fontawesome-free/webfonts/*.*')
      .pipe(gulp.dest('../resume/webfonts'));
});

//Images
gulp.task('copy:images', function() {
  return gulp.src('./img/**')
      .pipe(gulp.dest('../resume/img'));
});

//PDFs
gulp.task('copy:pdfs', function() {
  return gulp.src('./*.pdf')
      .pipe(gulp.dest('../resume'));
});

//Copy
gulp.task('copy', gulp.parallel('copy:fonts','copy:images','copy:pdfs'));

gulp.task('usemin', function() {
  return gulp.src('./*.html')
    .pipe(usemin({
        css: [ rev() ],
        html: [ function() { return htmlmin({ collapseWhitespace: true })} ],
        js: [ uglify(), rev() ],
        inlinejs: [ uglify() ],
        inlinecss: [ cleanCss(), 'concat' ]
    }))
    .pipe(gulp.dest('../resume/'));
});

//Build
gulp.task('build', gulp.series(gulp.parallel('min','clean'), gulp.parallel('copy','usemin')))