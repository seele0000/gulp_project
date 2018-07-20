var gulp = require('gulp'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    postcssAutoprefixer = require('autoprefixer'),
    sass = require('gulp-sass'),
    minifyCSS = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    // tmtsprite = require('gulp-tmtsprite'),
    spritesmith = require('gulp.spritesmith'),
    bs = require('browser-sync').create();

var baseDirPath = '/workspace/wb/hc055';
// var baseDirPath = './dist';
var paths = {
        'baseDir': './',
        'src': {
            'dir': './src/',
            'img': './src/**/*.{JPG,jpg,png,gif,svg,gif}',
            'slice': './src/**/slice/**/*.png',
            'sass': './src/**/*.scss',
            'css': ['./src/**/*.css', '!./src/**/style.css'],
            'js': './src/**/*.js',
            'media': ['./src/**/media/**/*', './src/**/fonts/**/*', './src/**/*.htc'],
            'html': ['./src/**/*.html', '!./src/_*/**/*.html'],
        },
        'dist': {
            'dir': baseDirPath + '/',
            'img': baseDirPath + '/img/',
            'sprite': baseDirPath + '/sprite/',
            'css': baseDirPath + '/css/',
            'js': baseDirPath + '/js/',
            'html': baseDirPath + '/'
        }
    }, 
    config = {
        livereload: true
    },
    serverConfig = {
        baseDir: paths.dist.html
    },
    postcssOption = [
        postcssAutoprefixer({ browsers: ['>0%'] })
    ];

var reloadHandler = function() {
    config.livereload && bs.reload();
};

// 复制操作
var copyHandler = function(type, file) {
    file = file || paths['src'][type];
    return gulp.src(file, { base: paths.src.dir })
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
};
// 复制文件操作
function copyMedia() {
    return copyHandler('media');
}
// 复制图片
function copyImg() {
    return copyHandler('img');
}

// 编译scss
function compileSass(cb, file) {
    return gulp.src(file || paths.src.sass)
        .pipe(plumber())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}
// 自动补全前缀
function compileAutoprefixer(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || './dist/**/*.css')
        .pipe(plumber())
        .pipe(postcss(postcssOption))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}
// 编译css
function compileCss() {
    return gulp.src(paths.src.css)
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}
// 编译js
function compileJs(cb, file) {
    var destTarget = paths.dist.dir;
    return gulp.src(file || paths.src.js)
        .pipe(plumber())
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}

//html 编译
function compileHtml(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.html;
    return gulp.src(file || paths.src.html, { base: paths.src.dir })
        .pipe(gulp.dest(paths.dist.html))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}

// CSS压缩
function miniCSS(cb, file) {
    return gulp.src(file || baseDirPath + '/**/*.css')
        .pipe(plumber())
        .pipe(minifyCSS({
            safe: true,
            reduceTransforms: false,
            advanced: false,
            compatibility: 'ie7',
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}
// 压缩js
function miniJs(cb, file) {
    return gulp.src(file || paths.src.js)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}

// 合并精灵图
function compileSprite() {
    return gulp.src('./img/slice/*.png')    //需要合并的图片地址
    .pipe(spritesmith({
        imgName: 'sprite.png',          //保存合并后图片的地址
        cssName: 'css/sprite.css',      //保存合并后对于css样式的地址
        padding:10,             //间距
        algorithm:'top-down'
    }))
    .pipe(gulp.dest(paths.dist.sprite));
}

//启动 livereload
function startServer(cb) {
    bs.init({
        server: serverConfig,
        port: config['livereload']['port'] || 8080,
        reloadDelay: 0,
        directory: true,
        notify: { //自定制livereload 提醒条
            styles: [
                "margin: 0",
                "padding: 5px",
                "position: fixed",
                "font-size: 10px",
                "z-index: 9999",
                "bottom: 0px",
                "right: 0px",
                "border-radius: 0",
                "border-top-left-radius: 5px",
                "background-color: rgba(60,197,31,0.5)",
                "color: white",
                "text-align: center"
            ]
        }
    });
    cb();
}

var watchHandler = function(type, file) {
    var target = path.extname(file);
    var destTarget = path.dirname(file).replace('src', paths.dist.dir);    
    switch (target) {
        case '.jpg':
        case '.png':
        case '.gif':
        case '.bmp':
            copyHandler('img', file);
            break;
        case '.js':
            return gulp.src(file)
                .pipe(plumber())
                .pipe(gulp.dest(destTarget))
                .on('end', reloadHandler);
            break;
        case '.mp3':
        case '.swf':
        case '.ttf':
        case '.woff':
        case '.svg':
        case '.woff2':
            copyHandler('media', file);
            break;
        case '.css':
            return gulp.src(file)
                .pipe(plumber())
                .pipe(postcss(postcssOption))
                .pipe(gulp.dest(destTarget))
                .on('end', reloadHandler);
            break;
        case '.scss':
            return gulp.src(file)
                .pipe(plumber())
                .pipe(sass({outputStyle: 'expanded'}))
                .pipe(postcss(postcssOption))
                .pipe(gulp.dest(destTarget))
                .on('end', reloadHandler);
            break;
        case '.html':
            compileHtml();
            reloadHandler();
            break;
    }

};

//监听文件
function watch(cb) {
    var watcher = gulp.watch([
        paths.src.img,
        paths.src.slice,
        paths.src.js,
        paths.src.media,
        paths.src.sass,
        paths.src.css,
        paths.src.html
    ], { ignored: /[\/\\]\./ });

    watcher
        .on('change', function(file) {
            console.log(file + ' has been changed');
            watchHandler('changed', file);
        })
        .on('add', function(file) {
            console.log(file + ' has been added');
            watchHandler('add', file);
        });
    cb();
}

gulp.task('default', gulp.series(
    gulp.parallel(
        compileSass,
        compileCss,
        copyImg,
        copyMedia,
        compileJs
    ),
    compileAutoprefixer,
    compileHtml,
    // compileSprite,
    miniCSS,
    miniJs,
    watch,
    startServer
));

gulp.task('sprite', function () {
  var spriteData = gulp.src(paths.src.slice).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  return spriteData.pipe(gulpif('*.png', gulp.dest(paths.dist.sprite), gulp.dest(paths.dist.css)));
});

gulp.task('css', gulp.series(
    gulp.parallel(
        compileSass,
        compileCss
    ),
    compileAutoprefixer
));

