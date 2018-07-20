$(function () {  
    
        var app = {
            data: {
                mySwiper: null,
                submitFlag: true,
                curPage: 0,
                firstFlag: true,
                stratFlag: false,
                audio: null,
                // load: new createjs.LoadQueue(false),
            },
            loadFn: function(callback) {
                var _this = this;
                // 资源加载
                // var load=new createjs.LoadQueue(false);
                var baseUrl = {
                        img: './img1/',
                        media: './media/'
                    };
                var source = [
                        {src: './img/music.png'},
                        {src: './img/arrow.png'},
                        {src: './img/p1_bg_cool.jpg'},
                        {src: './img/p1_bg_hot.jpg'},
                        {src: './img/p1_buildings_hot.png'},
                        {src: './img/p1_city_CD.png'},
                        {src: './img/p1_city_QLP.png'},
                        {src: './img/p1_degrees_cool.png'},
                        {src: './img/p1_degrees_cool2.png'},
                        {src: './img/p1_degrees_hot.png'},
                        {src: './img/p1_word_cool.png'},
                        {src: './img/p1_word_hot.png'},
                        {src: './img/p2_bg.jpg'},
                        {src: './media/keyboard.mp3'},
                        {src: './media/showMusic.mp3'}
                        // {id: 'music', src: baseUrl.media + 'music.mp3'},
                    ];

                console.log('loadFn',source.length)
                _this.data.load.loadManifest(source);
    
                _this.data.load.on("fileload", handleFileLoad, this);
                _this.data.load.on("progress", handleFileProgress);
                _this.data.load.on('complete', handComplete);
    
                function handleFileLoad(e) {}
    
                function handleFileProgress(event) {
                    var progress = parseInt(_this.data.load.progress*100);
                    var imgProgress = progress/100;
                    $('#progress').html(progress + '%');
                }
    
                function handComplete(event){
                    $('#progress').html('点击开启')
                    callback ? callback() : null;		    
                }
            },
            imgLoad: function (callback) {
                var list = [
                    './img/music.png',
                    './img/arrow.png',
                    './img/p1_bg_cool.jpg',
                    './img/p1_bg_hot.jpg',
                    './img/p1_buildings_hot.png',
                    './img/p1_city_CD.png',
                    './img/p1_city_QLP.png',
                    './img/p1_degrees_cool.png',
                    './img/p1_degrees_cool2.png',
                    './img/p1_degrees_hot.png',
                    './img/p1_word_cool.png',
                    './img/p1_word_hot.png',
                    './img/p2_bg1.jpg',
                    
                ];
                console.log(list.length)
                preLoadImg(list,callback);
                function preLoadImg(list, callback) {
                    var imgList = [],
                        num = 0,
                        fn = function(list, imgList) {
                            if (list.length != imgList.length) {
                                num = Math.floor((imgList.length / list.length) * 100);
                                // console.log(num);
                                $('#progress').html(num + '%')
                            } else {
                                // $('#progress').html('100%')
                                $('#progress').html('点击开启');
                                $('.loading img').fadeIn(300);
                                callback ? callback() : null;
                            }
                        };
                
                    for (var i = 0; i < list.length; i++) {
                        var img = new Image();
                        img.src = list[i];
                        if (img.complete) {
                            // 图片是否已显示
                            imgList.push(list[i]);
                            fn(list, imgList);
                        } else {
                            // 默认onload加载
                            img.onload = function() {
                                imgList.push(list[i]);
                                fn(list, imgList);
                            };
                        }
                    }
                }
            },
            playMusic: function() {
                var btn = document.querySelector('#bgm-btn');
                var audio = document.getElementById('music');
                var f = 1;
            
                audioAutoPlay();
                function audioAutoPlay() {
                    audio.play();
                    document.addEventListener("WeixinJSBridgeReady", function () {
                        audio.play();
                    }, false);
                    document.addEventListener('YixinJSBridgeReady', function () {
                        audio.play();
                    }, false);
            
                    $('#bgm-btn').addClass('rotate');
                };
            
                $('html').one('click', function() {
                    console.log('one');  
                    audio.play();
                    $('#bgm-btn').addClass('rotate');
                    f = 1;             
                });        
            
                btn.addEventListener('click', function (e) {
                    if (f) {
                        audio.pause();
                        $('#bgm-btn').removeClass('rotate');
                        f = 0;
                    } else {
                        $('#bgm-btn').addClass('rotate');
                        audio.play();
                        f = 1;
                    }
                });
            },
            setShare: function() {
                var _this = this;
                var sharedata = {
                    title: '盛夏光年，七里坪约您一程清新之旅',
                    desc: '绿树阴浓夏日长，楼台倒影入池塘',
                    link: 'http://prj.chuangjia.me/hc054/index.html',
                    imgUrl: 'http://prj.chuangjia.me/hc054/img/wxface.jpg',
                    success: function () {
    
                    },
                    cancel: function () {
                        
                    }
                };
                $.ajax({
                    type: 'get',
                    url: '//prj.chuangjia.me/wxsso/sign?',
                    data: {ssid: window.localStorage.CJSSID || ""},
                    dataType: "json",
                    success: function (data) {
                        if(data.ssid) {
                            window.localStorage.CJSSID = data.ssid
                        }
                        var _sign = data.sign;
                        _sign.jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage'];
                        wx.config(_sign);
                        wx.ready(function () {
                            wx.onMenuShareTimeline(sharedata);
                            wx.onMenuShareAppMessage(sharedata);
                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            },
            setSwiper: function() {
                var _this = this;
                var firstFlag = true;
                _this.data.mySwiper = new Swiper ('#wrapper', {
                    direction: 'vertical',
                    noSwiping : true,
                    noSwipingClass : 'stop-swiping',
                    watchSlidesProgress : true,
                    on:{
                        init: function(){
                            swiperAnimateCache(this); //隐藏动画元素 
                            swiperAnimate(this); //初始化完成开始动画
                        }, 
                        slideChangeTransitionEnd: function(){ 
                            swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
                             
                            if(_this.data.mySwiper.activeIndex == 1 && _this.data.firstFlag) {
                                _this.data.mySwiper.removeSlide(0);
                                _this.data.firstFlag = false;
                            } else {
                                $('.page1').removeClass('go');
                            }
                            
                        },
                        transitionEnd: function (swiper, speed) {
                            // 0 0.25 0.5 0.75 1（进程百分比）  
                            // var curIndex = _this.data.mySwiper.progress;     
                               
                        }, 
                    }
                }) 
                
    
                _this.data.mySwiper.on('slideChangeTransitionEnd', function () {
                    _this.data.curPage = _this.data.mySwiper.activeIndex;   // 当前页索引       
                });

                var p2Swiper = new Swiper ('#p2Swiper', {
                    direction: 'horizontal',
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var p3Swiper = new Swiper ('#p3Swiper', {
                    direction: 'horizontal',
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var p4Swiper = new Swiper ('#p4Swiper', {
                    direction: 'horizontal',
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var p5Swiper = new Swiper ('#p5Swiper', {
                    direction: 'horizontal',
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            },
            submitFn: function() {
                var _this = this;
                var obj = {};
                obj.prj = $('[name = prj]').val();
                obj.name = $('[name = name]').val();
                obj.tel = $('[name = tel]').val();
                obj.qudao = $('[name = qudao]').val();
        
                var re = /^1\d{10}$/;
        
                if(obj.tel == '' || obj.name == '') {
                    alert('请填以上信息！');
                    return false;
                }
        
                if (!re.test(obj.tel)) {
                    alert("请填写正确的电话号码");
                    return false;
                } 
    
                if(_this.data.submitFlag) {
                    var _url = "";
                    _this.data.submitFlag = false;
                    if (window.location.hostname == 'localhost') {
                        _url = "bmapi.dev.chuangjia.me";
                    } else {
                        _url = window.location.host.replace(/(static-zt|zt).(.*)?maifangma.com|cd\.house\.qq\.com|prj\.chuangjia\.me|sc\.edijin\.com/g, "bmapi.$2chuangjia.me");
                    }
                    console.log(obj)
    
                    $.getJSON('//' + _url + '/prj/userclues/add?callback=?', {
                        sign: '',
                        data: JSON.stringify(obj)
                    }, function (data) {
                        console.log(data)
                        if (data.code) {
                            _this.data.submitFlag = true;
                            alert('提交成功！');
                            $(" input[ name='name'] ").val('')
                            $(" input[ name='tel'] ").val('')
                            $('.dialog').fadeOut(300);
                            _this.data.mySwiper.slideTo(0);
                        }
                    }).fail(function (err) {
                        console.log('baoMing err: ', err);
                    });
                }
            },
            handleWord: function(type) {
                var hotWordStr = '狂热-暴躁-干涸-枯萎',
                    hotStrResult = '',
                    hotN = 0;
                    coolWordStr = '对不起-这些都与我无关!',
                    coolStrResult = '',
                    coolN = 0,
                    keybroadAudio = document.getElementById('keyboardMusic');

                if(type == 'init') {
                    for(var i=0; i<hotWordStr.length; i++) {
                        if(hotWordStr.charAt(i) == '-') {
                            hotStrResult += '<i></i>'
                        } else {
                            hotStrResult += '<span>'+ hotWordStr.charAt(i) +'</span>'
                        }
                    }
                    for(var i=0; i<coolWordStr.length; i++) {
                        if(coolWordStr.charAt(i) == '-') {
                            coolStrResult += '<i></i>'
                        } else {
                            coolStrResult += '<span>'+ coolWordStr.charAt(i) +'</span>'
                        }
                    }
                    $('#hotWord').html(hotStrResult);
                    $('#coolWord').html(coolStrResult + '<span>!!!</span>');
                }

                if(type == 'hotword') {
                    keybroadAudio.play();
                    var hotWordTimer = setInterval(function(){
                        if(hotWordStr.charAt(hotN) == '-') {
                            hotStrResult += '<i></i>'
                        } else {
                            hotStrResult += '<span>'+ hotWordStr.charAt(hotN) +'</span>'
                        }
                        $('#hotWord').html(hotStrResult);
                        ++hotN;
                        if(hotN >= hotWordStr.length) {
                            clearInterval(hotWordTimer);
                            $('#hotWord').animate({
                                'left':'1.9rem', 
                                'top': '3rem',
                                'font-size': '0.4rem'
                                // '-webkit-transform': 'translateX(-50%) scale(0.6)',
                                // '-moz-transform': 'translateX(-50%) scale(0.6)',
                                // '-ms-transform': 'translateX(-50%) scale(0.6)',
                                // '-o-transform': 'translateX(-50%) scale(0.6)',
                                // 'transform': 'scale(0.6)'
                            }, 500, function() {
                                $('#hotWord').fadeOut(300)
                                $('.page1 .left').addClass('down');
                            });
                        }
                    },250)
                } else if (type == 'coolword') {
                    keybroadAudio.play();
                    var coolWordTimer = setInterval(function(){
                        if(coolWordStr.charAt(coolN) == '-') {
                            coolStrResult += '<i></i>'
                        } else if (coolWordStr.charAt(coolN) == '!') {
                            coolStrResult += '<span>!!!</span>'
                        } else {
                            coolStrResult += '<span>'+ coolWordStr.charAt(coolN) +'</span>'
                        }
                        $('#coolWord').html(coolStrResult);
                        ++coolN;
                        if(coolN >= coolWordStr.length) {
                            clearInterval(coolWordTimer);
                            $('#coolWord').animate({
                                'right':'1.5rem', 
                                'top': '3rem',
                                'font-size': '0.4rem'
                            }, 500, function() {
                                $('#coolWord').fadeOut(300)
                                $('.page1 .right').addClass('down');
                            });
                        }
                    },500)
                }
            },
            event: function() {
                var _this = this;
    
                var showAudio = document.getElementById('showMusic');
                var keybroadAudio = document.getElementById('keyboardMusic');
                var audio = document.getElementById('music');
                var btn = document.querySelector('#bgm-btn');
    
                btn.addEventListener('click', function (e) {
                    if (f) {
                        audio.pause();
                        $('#bgm-btn').removeClass('rotate');
                        f = 0;
                    } else {
                        $('#bgm-btn').addClass('rotate');
                        audio.play();
                        f = 1;
                    }
                });
                
                _this.setSwiper();
                 
                _this.imgLoad(function() {
                    _this.data.stratFlag = true;
                    
                    //----------------
                    // $('.loading').fadeOut(300);
                    // _this.data.mySwiper.slideTo(2);
                    //------------------
                });
                
                $('.loading').click(function() {
                    if(_this.data.stratFlag) {
                        $('.loading').fadeOut(300);
                        showAudio.play();
                        showAudio.pause();
                        audio.play();
                        audio.pause();
                        keybroadAudio.play();
                        keybroadAudio.pause();
                        _this.data.mySwiper.slideTo(1);
                        _this.handleWord('hotword');
                    }
                });

                
    
                $('.page1 .hot .city')[0].addEventListener("webkitTransitionEnd", function() {
                    _this.handleWord('coolword');
                });

                $('.page1 .cool .city')[0].addEventListener("webkitTransitionEnd", function() {
                    $('.arrow-outter').fadeIn(300);
                });

                $('.page1 .right')[0].addEventListener("webkitAnimationEnd", function() {
                    showAudio.play();
                });
              
                _this.setShare();
    
                $('#p1Go').click(function() {
                    $('.page1').addClass('go');
                    setTimeout(function() {
                        _this.data.mySwiper.slideTo(1);
                        $('#bgm-btn').addClass('rotate');
                        audio.play();
                        f = 1;
                    },1000);                
                });
    
                $('#btnDialog').click(function() {   
                    $('.dialog').fadeIn(300);
                });
    
                $('#btnClose').click(function() {
                    $('.dialog').fadeOut(300);                
                });
    
                $('#btnSubmit').click(function() {
                    _this.submitFn();
                });
                
            }
        }
    
        app.event(); 
    })