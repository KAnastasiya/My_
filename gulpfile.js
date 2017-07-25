const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const plugins = require('gulp-load-plugins')();
const webpackConfig = require('./webpack.config.js');

const SRC = 'src';
const PUBLIC = './';


// Pug
gulp.task('pug', () =>
  gulp
    .src(`${SRC}/*.pug`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(),
    }))
    .pipe(plugins.pug())
    .pipe(gulp.dest(PUBLIC))
);


// Styles
gulp.task('scss', () =>
  gulp
    .src(`${SRC}/*.scss`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(),
    }))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      includePaths: require('node-normalize-scss').includePaths,
    }))
    .pipe(plugins.autoprefixer(
      ['last 2 versions', '> 1%'],
      { cascade: false }
    ))
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({
      suffix: '.min',
    }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(PUBLIC))
);


// Scripts
gulp.task('js', () =>
  gulp
    .src(`${SRC}/*.js`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(err => ({
        title: 'Webpack',
        message: err.message,
      })),
    }))
    .pipe(named())
    .pipe(webpack(webpackConfig))
    .pipe(plugins.rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(PUBLIC))
);


// Images
gulp.task('img', () =>
  gulp
    .src(`${SRC}/blocks/**/img/*.*`)
    .pipe(plugins.imagemin([
      imageminJpegRecompress({
        loops: 4,
        min: 40,
        max: 65,
        quality: 'medium',
        strip: true,
        progressive: true,
      }),
      imageminPngquant({ quality: '50-80' }),
      plugins.imagemin.svgo({
        removeViewBox: true,
      }),
    ]))
    .pipe(gulp.dest(`${PUBLIC}/img`))
);


// Clean
gulp.task('cleanImg', () => del(`${PUBLIC}/img`));


// Server
gulp.task('server', () =>
  browserSync.init({
    server: {
      baseDir: PUBLIC,
      index: 'index.html',
    },
    port: 8800,
    open: false,
    reloadOnRestart: true,
  })
);


// Watch
gulp.task('watch', () => {
  gulp.watch([
    `${SRC}/blocks/**/*.pug`,
    `${SRC}/common/pug/*.pug`,
    `${SRC}/*.pug`,
  ]).on('change', gulp.series('pug', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/*.scss`,
    `${SRC}/common/scss/*.scss`,
    `${SRC}/*.scss`,
  ]).on('change', gulp.series('scss', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/*.js`,
    `${SRC}/common/js.js`,
    `${SRC}/*.js`,
  ]).on('change', gulp.series('js', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/img/*`,
    `${SRC}/common/img/*`,
  ]).on('change', gulp.series('cleanImg', 'img', browserSync.reload));
});


// Default
gulp.task('default', gulp.series(
  gulp.parallel('img', 'pug', 'scss'),
  gulp.parallel('server', 'watch')
));
