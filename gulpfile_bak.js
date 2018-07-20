/*
gulpfile的每个插件的用法可以打开 http://www.npmjs.com  搜索 对应的插件名字，即可看到详细文档及用法
 */

/**
 * [gulp 安装依赖可直接在fecode目录下]
 * cnpm install gulpjs/gulp#4.0 del gulp-ejs xfs-ejs-helper gulp-uglify gulp-plumber gulp-if browser-sync gulp-lazyimagecss gulp-postcss postcss-pxtorem autoprefixer gulp-posthtml@1.5.2 gulp-sass posthtml-px2rem gulp-rev-all gulp-rev-delete-original gulp-usemin gulp-cssnano gulp-imagemin imagemin-pngquant gulp-tmtsprite gulp-filter gulp-seajs-transport gulp-seajs-concat merge-stream --save
 */
var gulp = require('gulp'),
    path = require('path'),
    del = require('del'),
    ejs = require('gulp-ejs'),
    // ejshelper = require('xfs-ejs-helper'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    gulpif = require('gulp-if'),
    bs = require('browser-sync').create(),
    lazyImageCSS = require('gulp-lazyimagecss'),
    postcss = require('gulp-postcss'),
    postcssPxtorem = require('postcss-pxtorem'),
    postcssAutoprefixer = require('autoprefixer'),
    posthtml = require('gulp-posthtml'),
    sass = require('gulp-sass'),
    posthtmlPx2rem = require('posthtml-px2rem'),
    RevAll = require('gulp-rev-all'),
    revDel = require('gulp-rev-delete-original'),
    usemin = require('gulp-usemin'),
    minifyCSS = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    tmtsprite = require('gulp-tmtsprite'),
    filter = require('gulp-filter'),
    // proxyMiddleware = require('http-proxy-middleware'),
    // https://www.npmjs.com/package/gulp-documentation
    // gulpDocumentation = require('gulp-documentation'),
    // seajsCombo = require('gulp-seajs-combo');
    transport = require("gulp-seajs-transport"), //对seajs的模块进行预处理：添加模块标识
    concat = require("gulp-seajs-concat"), //seajs模块合并
    merge = require('merge-stream'); //合并多个流

// var projectName = 'hc023';
// var baseDirPath = '../workspace/wb/' + projectName;
var baseDirPath = './dist';
var paths = {
        'src': {
            'dir': './src/',
            'img': './src/**/*.{JPG,jpg,png,gif,svg}',
            'slice': './src/**/slice/**/*.png',
            'sass': './src/**/*.scss',
            // 'sass': './src/css/style-*.scss',
            'css': ['./src/**/*.css','!./src/**/lib/*.css','!./src/assets/css/mixins/*.css','!./src/assets/css/common.css'],
            'js': './src/**/*.js',
            'media': ['./src/**/media/**/*', './src/**/fonts/**/*', './src/**/*.htc'],
            'html': ['./src/**/*.html', '!./src/_*/**/*.html'],
        },
        // 'dist': {
        //     'dir': './dist/',
        //     'img': './dist/assets/img/',
        //     'css': './dist/assets/css/',
        //     'js': './dist/assets/js/',
        //     'sprite': './dist/assets/sprite',
        //     'html': './dist/'
        // }
        'dist': {
            'dir': baseDirPath + '/',
            'img': baseDirPath + '/assets/img/',
            'css': baseDirPath + '/assets/css/',
            'js': baseDirPath + '/assets/js/',
            'sprite': baseDirPath + '/assets/sprite',
            'html': baseDirPath + '/'
        }
    },

    /**
    proxy配置，target为需要代理的域名接口地址;可以配置多条规则;
    请求本地站点的/cooperation/* 将自动转发到http://192.168.2.187:70/cooperation/*
    可以用数组设置多个转发规则
     [proxyMiddleware(['/cooperation'], {target: 'http://192.168.2.187:70', changeOrigin: true}),
        proxyMiddleware(['/hr'], {target: 'http://192.168.2.187:70', changeOrigin: true})
     ]
     */

    //请求本地站点的/cooperation/* 将自动转发到http://192.168.2.187:70/cooperation/*
    //proxy = [proxyMiddleware(['/cooperation'], { target: 'http://192.168.2.187:70', changeOrigin: true })],
    config = {
        livereload: true,
        reversion: false,
        seajs: true,
        supportREM: false,
        lazyDir: ['../img', '../slice']
    },
    lazyDir = config.lazyDir || ['../img', '../slice'],
    serverConfig = {
        baseDir: paths.dist.html,
        // middleware: proxy
    }
postcssOption = [];

if (config.supportREM) {
    postcssOption = [
        postcssAutoprefixer({ browsers: ['>0%'] }),
        postcssPxtorem({
            root_value: '40', // 基准值 html{ font-zise: 20px; }
            prop_white_list: [], // 对所有 px 值生效
            minPixelValue: 2 // 忽略 1px 值
        })
    ]
} else {
    postcssOption = [
        postcssAutoprefixer({ browsers: ['>0%'] })
    ]
}

// 复制操作
var copyHandler = function(type, file) {
    file = file || paths['src'][type];

    return gulp.src(file, { base: paths.src.dir })
        // .pipe(gulp.dest('./dist/'))
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
};

// 自动刷新
var reloadHandler = function() {
    config.livereload && bs.reload();
};

// 清除 dist 目录
function delDist() {
    return del([paths.dist.dir]);
}
// 复制文件操作
function copyMedia() {
    return copyHandler('media');
}
/**
 * [compileSass 编译sass及合并Sprite]
 * @return {[type]} [description]
 */
function compileSass() {
    return gulp.src(paths.src.sass)
        .pipe(plumber())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}

function compileSprite() {
    return gulp.src(paths.dist.css + '*.css')
        .pipe(lazyImageCSS({ imagePath: lazyDir }))
        .pipe(tmtsprite({ slicePath: '../slice', margin: 4 }))
        .pipe(gulpif('*.png', gulp.dest(paths.dist.sprite), gulp.dest(paths.dist.css)))
        .on('end', reloadHandler);
}

function compileCss() {
    return gulp.src(paths.src.css)
        .pipe(gulp.dest(paths.dist.dir))
        .on('end', reloadHandler);
}
/**
 * [compileAutoprefixer 自动补全]
 * @return {[type]} [description]
 */
function compileAutoprefixer(cb, file) {

    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || './dist/**/*.css')
        .pipe(plumber())
        .pipe(postcss(postcssOption))
        .pipe(gulp.dest(destTarget)).on('end', reloadHandler);
}
/**
 * [miniCSS CSS压缩]
 * @return {[type]} [description]
 */
function miniCSS(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || './dist/**/*.css')
        .pipe(plumber())
        .pipe(minifyCSS({
            safe: true,
            reduceTransforms: false,
            advanced: false,
            compatibility: 'ie7',
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);;
}

/**
 * [imageminImg 图片压缩]
 * @return {[type]} [description]
 */
function imageminImg(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.dir;
    return gulp.src(file || paths.src.img)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}

/**
 * [compileJs 编译压缩JS]
 * @return {[type]} [description]
 */
function compileJs(cb, file) {
    var destTarget = paths.dist.dir,
        jsFilter = filter('**/page-*.js', { restore: true });
    return gulp.src(file || paths.src.js, { base: paths.src.dir })
        .pipe(plumber())
        // .pipe(jsFilter)
        // .pipe(seajsCombo({
        //     ignore: ['jquery', 'bootstrap', 'bootstrap.min']
        // }))
        // .pipe(jsFilter.restore)
        // .pipe(uglify({
        //     mangle: {
        //         except: ['$', 'require', 'exports', 'module']
        //     }
        // }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}

function compileCmd() {
    console.log('开始合并cmd模块');
    return merge(
        gulp.src('./dist/assets/js/**/*.js')
        .pipe(transport())
        .pipe(concat({
            base: './dist/assets/js'
        }))
        .pipe(gulp.dest('./dist/assets/js'))
    );
}

/**
 * [imageminSprite 雪碧图压缩]
 * @return {[type]} [description]
 */
function imageminSprite() {
    return gulp.src('./dist/assets/sprite/**/*')
        .pipe(imagemin({
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.dist.sprite))
        .on('end', reloadHandler);
}

//html 编译
function compileHtml(cb, file) {
    var destTarget = file ? path.dirname(file).replace('src', 'dist') : paths.dist.html;
    return gulp.src(file || paths.src.html, { base: paths.src.dir })
        // .pipe(ejs(ejshelper()))
        .pipe(gulpif(
            config.supportREM,
            posthtml(
                posthtmlPx2rem({
                    rootValue: 40,
                    minPixelValue: 2
                })
            )))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(usemin({
            css: [minifyCSS],
            js: [uglify],
            inlinejs: [uglify],
            inlinecss: [minifyCSS, 'concat']
        }))
        .pipe(gulp.dest(destTarget))
        .on('end', reloadHandler);
}

//新文件名(md5)
function reversion(cb) {
    var revAll = new RevAll({
        fileNameManifest: 'manifest.json',
        dontRenameFile: ['.html', '.jsp'],
        dontUpdateReference: ['.html'],
        transformFilename: function(file, hash) {
            var filename = path.basename(file.path);
            var ext = path.extname(file.path);

            if (/^\d+\..*\.js$/.test(filename)) {
                return filename;
            } else {
                return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext;
            }

        }
    });
    if (config['reversion']) {
        return gulp.src(['./dist/**/*', '!gulpfile.js'])
            .pipe(revAll.revision())
            .pipe(gulp.dest(paths.dist.dir))
            .pipe(revDel({
                exclude: /(.html|.htm)$/
            }))
            .pipe(revAll.manifestFile())
            .pipe(gulp.dest(paths.dist.dir));
    } else {
        cb();
    }

}

//启动 livereload
function startServer(cb) {
    bs.init({
        server: serverConfig,
        port: config['livereload']['port'] || 8080,
        // startPath: config['livereload']['startPath'] || '/',
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
    // console.log(path.extname(file));
    var target = path.extname(file),
        // destTarget = path.dirname(file).replace('src', 'dist');
        // destTarget = paths.dist.dir;
        destTarget = path.dirname(file).replace('src', paths.dist.dir);

    switch (target) {
        case '.jpg':
        case '.png':
        case '.gif':
        case '.bmp':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                imageminImg();
            }
            break;

        case '.js':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                // compileJs();
                compileJs(null, file);
            }
            break;

        case '.mp3':
        case '.swf':
        case '.ttf':
        case '.woff':
        case '.svg':
        case '.woff2':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist');
                del([tmp]);
            } else {
                copyHandler('media', file);
            }
            break;

        case '.css':

            if (type === 'removed') {
                var tmp = file.replace('src', 'dist').replace(target, '.css');
                del([tmp]);
            } else {
                // compileCss();
                // reloadHandler();
                return gulp.src(file)
                    .pipe(plumber())
                    .pipe(postcss(postcssOption))
                    .pipe(minifyCSS({
                        safe: true,
                        reduceTransforms: false,
                        advanced: false,
                        compatibility: 'ie7',
                        keepSpecialComments: 0
                    }))
                    .pipe(gulp.dest(destTarget))
                    .on('end', reloadHandler);
            }

            break;
        case '.scss':
            if (type === 'removed') {
                var tmp = file.replace('src', 'dist').replace(target, '.css');
                del([tmp]);
            } else {
                return gulp.src(file)
                    .pipe(plumber())
                    .pipe(sass())
                    .pipe(postcss(postcssOption))
                    .pipe(minifyCSS({
                        safe: true,
                        reduceTransforms: false,
                        advanced: false,
                        compatibility: 'ie7',
                        keepSpecialComments: 0
                    }))

                .pipe(gulp.dest(destTarget))
                    .on('end', reloadHandler);
                // compileSass();
                // reloadHandler();

            }

            break;
        case '.html':
            if (type === 'removed') {
                del([file]);
            } else {
                compileHtml(null, file);
            }
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
        /*.on('unlink', function(file) {
            console.log(file + ' is deleted');
            watchHandler('removed', file);
        });
*/
    cb();
}

// JSDoc 文档生成任务
// gulp.task('documentation', function () {
//   return gulp.src('./src/**/doc.js')
//     .pipe(gulpDocumentation('html', {}, {
//       name: 'My Project',
//       version: '1.0.0'
//     }))
//     .pipe(gulp.dest('documentation'));
// });

// gulp.task('doc',gulp.series('documentation'));

gulp.task('default', gulp.series(
    // delDist,
    gulp.parallel(
        compileSass,
        compileCss,
        imageminImg,
        copyMedia,
        compileJs
    ),
    compileAutoprefixer,
    imageminSprite,
    // miniCSS,
    compileHtml,
    watch,
    startServer
));

gulp.task('sprite', gulp.series(
    delDist,
    gulp.parallel(
        compileSass,
        compileCss,
        imageminImg,
        copyMedia,
        compileJs
    ),
    compileAutoprefixer,
    compileSprite,
    imageminSprite,
    miniCSS,
    compileHtml,
    watch,
    startServer
));

// dist任务主要用于一次编译发布的，不可用于开发;
gulp.task('dist', gulp.series(
    delDist,
    gulp.parallel(
        compileSass,
        compileCss,
        imageminImg,
        copyMedia,
        compileJs
    ),
    compileAutoprefixer,
    compileSprite,
    imageminSprite,
    miniCSS,
    compileHtml,
    reversion,

    compileCmd,
    watch,
    startServer
));

gulp.task('delDist', gulp.series(delDist));
