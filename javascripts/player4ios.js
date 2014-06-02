;(function ($) {
    /**
     * 定义 Xplayer 插件
     * 定义 实例化插件 的 data-xxx
     */
    var Xplayer,
        toggle = '[data-toggle="xplayer"]'; 

    
    /**
     * 定义 设备信息UA 对象
     */
    var UA = function(){
        var ua = navigator.userAgent.toLowerCase()
            ,_isAndroid = (/android/.test(ua)) ? true : false
            ,_isIphone = (/iphone/.test(ua)) ? true : false;
        return {
          isAndroid: _isAndroid
          ,isIphone: _isIphone
        };
    }();

    /**
     * 封装一个自运行的单例
     * 更好的划分代码块
     * 方便区分私有方法及公共方法
     * PS：有时私有方法为了方便写在Plugin类里，请在私有方法前加上"_"
     */
    Xplayer = (function () {

        /**
         * 实例化插件
         * @param element 传入jq对象的选择器，如 $("#J_plugin").plugin() ,其中 $("#J_plugin") 即是 element
         * @param options 插件的的参数
         * @constructor
         */
        function Xplayer(element, options) {
            var play = $.proxy(this.play, this)
                ,toggle = $.proxy(this.toggle, this)
                ,init = $.proxy(this.init, this);

            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.xplayer.defaults, options);

            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element)
                .on('click.xplayer.data-api', play);
            this.$video = this.$element.find('video')
                .on('click.xplayer.data-api', toggle)
                .on('ended.xplayer.data-api', init)
                .on('pause.xplayer.data-api', function(){//暂停时改为显示 poster，修复iOS下视频无法100%宽度的问题
                    if (UA.isIphone) {
                        init();
                    }
                });
            this.video = this.$video.get(0);

            //初始化
            this.init();
        }

        /**
         * 写法一
         * 插件的公共方法，相当于接口函数，用于给外部调用
         */
        /**
         * 写法二
         * 将插件所有函数放在prototype的大对象里
         * @type {{}}
         */
        Xplayer.prototype = {

            constructor: Xplayer,

            init: function(){
                this.$element.addClass('initial');
                this.pause();
                this.poster();
            }
            ,poster: function(){
                this.$poster = this.$element.find('img');
                if (this.$poster.length === 0) {
                    this.$poster = $('<img src="'+ this.$video.attr('poster') + '" >')
                        .prependTo(this.$element);
                }
            }
            ,removePoster: function(){
                this.$element.removeClass('initial paused');
                if (this.$poster) {
                    this.$poster.remove();
                }
                this.$poster = null;
            }
            ,play: function(){
                // if (this.$pauseBtn) {
                //     this.$pauseBtn.remove();
                // }
                this.removePoster();
                this.video.play();
            }
            ,pause: function(){
                this.video.pause();
                this.$element.addClass('paused');
                // this.$pauseBtn = $('<div class="pause-btn"></div>')
                //     .appendTo(this.$element);
            }
            ,toggle: function(e){
                if (this.video.paused) {
                    this.play();
                } else {
                    this.pause();
                }
                e.stopPropagation();
            }
        };

        return Xplayer;

    })();

    /**
     * 插件私有方法
     * 暂无
     */


    $.fn.xplayer = function(options){
        return this.each(function () {
            var $this = $(this)
                ,instance = $.fn.xplayer.lookup[$this.data('xplayer')];
            if (!instance) {
                //zepto的data方法只能保存字符串，所以用此方法解决一下
                $.fn.xplayer.lookup[++$.fn.xplayer.lookup.i] = new Xplayer(this,options);
                $this.data('xplayer', $.fn.xplayer.lookup.i);
                instance = $.fn.xplayer.lookup[$this.data('xplayer')];
            }

            if (typeof options === 'string') return instance[options]();
        })
    };

    $.fn.xplayer.lookup = {i: 0};

    /**
     * 插件的默认值
     */
    $.fn.xplayer.defaults = {
    };

    /**
     * 通过 data-xxx 方式 实例化插件
     */
    $(function () {
        $(toggle).xplayer();
    });
})(Zepto);