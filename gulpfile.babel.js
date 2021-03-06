'use strict';

import gulp from 'gulp';
import less from 'gulp-less';
import concat from 'gulp-concat';
import path from 'path';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import uglify from 'gulp-uglify';
import shell from 'gulp-shell';
import imagemin from 'gulp-imagemin';

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: "dist/"
        },
        options: {
            reloadDelay: 250
        },
        notify: false,
        files: ["src/**/*"],
        open: false
    });
});

gulp.task('scripts', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts:vendor', function(callback) {
  return gulp.src([
      './node_modules/pixi.js/dist/pixi.min.js',
      './node_modules/jquery/dist/jquery.min.js'
    ])
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('styles', () => {
  return gulp.src('./src/less/**/*.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.reload({stream: true}))
});

//compressing images & handle SVG files
gulp.task('images', function(tmp) {
    gulp.src(['src/assets/images/**/*.jpg', 'src/assets/images/**/*.png'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 8, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('music', function() {
    return gulp.src('src/assets/music/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('dist/assets/music'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('videos', function() {
    return gulp.src('src/assets/videos/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('dist/assets/videos'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('assets', ['music', 'videos']);


// Cleans compiled directory
gulp.task('clean', shell.task([
  'rm -rf dist/'
]));

//create folders using shell
gulp.task('scaffold', shell.task([
  'mkdir dist',
  'mkdir dist/css',
  'mkdir dist/js',
  'mkdir dist/assets',
  'mkdir dist/assets/images',
  'mkdir dist/assets/videos',
  'mkdir dist/assets/music'
  ]
));

gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/less/**/*.less', ['styles']);
  gulp.watch('src/assets/images/**/*', ['images']);
  gulp.watch('src/*.html', ['html']);
});

gulp.task('default', ['browserSync', 'html', 'scripts', 'images', 'styles', 'watch']);
