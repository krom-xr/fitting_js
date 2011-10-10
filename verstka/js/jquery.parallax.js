(function($) {
				$.fn.parallaxSlider = function(options) {
					var opts = $.extend({}, $.fn.parallaxSlider.defaults, options);
					return this.each(function() {
						var $pxs_container 	= $(this),
						o 				= $.meta ? $.extend({}, opts, $pxs_container.data()) : opts;
						
						//Основной слайдер
						var $pxs_slider		= $('.pxs_slider',$pxs_container),
						//Элементы в слайдере
						$elems			= $pxs_slider.children(),
						//Общее количество элементов
						total_elems		= $elems.length,
						//Кнопки навигации
						$pxs_next		= $('.pxs_next',$pxs_container),
						$pxs_prev		= $('.pxs_prev',$pxs_container),
						//Фоновые изображения
						$pxs_bg1		= $('.pxs_bg1',$pxs_container),
						$pxs_bg2		= $('.pxs_bg2',$pxs_container),
						$pxs_bg3		= $('.pxs_bg3',$pxs_container),
						//Текущее изображение
						current			= 0,
						//Контейнер миниатюр
						$pxs_thumbnails = $('.pxs_thumbnails',$pxs_container),
						//Миниатюры
						$thumbs			= $pxs_thumbnails.children(),
						//Интервал для режима автопроигрывания
						slideshow,
						//Загрузка изображения
						$pxs_loading	= $('.pxs_loading',$pxs_container),
						$pxs_slider_wrapper = $('.pxs_slider_wrapper',$pxs_container);
							
						//Сначала загружаем все изображения
						var loaded		= 0,
						$images		= $pxs_slider_wrapper.find('img');
							
						$images.each(function(){
							var $img	= $(this);
							$('<img/>').load(function(){
								++loaded;
								if(loaded	== total_elems*2){
									$pxs_loading.hide();
									$pxs_slider_wrapper.show();
										
									//Ширина изображения (предполагаем, что все изображения имеют одинаковые размеры)
									var one_image_w		= $pxs_slider.find('img:first').width();
							
									/*
									Нужно установить ширину слайдера, каждого из его элементов 
									и кнопок навигации
									 */
									setWidths($pxs_slider,
									$elems,
									total_elems,
									$pxs_bg1,
									$pxs_bg2,
									$pxs_bg3,
									one_image_w,
									$pxs_next,
									$pxs_prev);
							
									/*
										Устанавливаем ширину миниатюр
										и распределяем их равномерно
									 */
									$pxs_thumbnails.css({
										'width'			: one_image_w + 'px',
										'margin-left' 	: -one_image_w/2 + 'px'
									});
									var spaces	= one_image_w/(total_elems+1);
									$thumbs.each(function(i){
										var $this 	= $(this);
										//var left	= spaces*(i+1) - $this.width()/2;
										var left	= spaces*(i+1) - $this.width()/2;
										$this.css('left',left+'px');
											
										if(o.thumbRotation){
											var angle 	= Math.floor(Math.random()*41)-20;
											/*$this.css({
												'-moz-transform'	: 'rotate('+ angle +'deg)',
												'-webkit-transform'	: 'rotate('+ angle +'deg)',
												'transform'			: 'rotate('+ angle +'deg)'
											});*/
										}
										$('.pxs_thumbnails li').hover(function(){
											//if($(this).attr('class')!='selected')
											//$(this).children('img').stop().animate({opacity:'0.99'},100);
										},function(){
											//if($(this).attr('class')!='selected')
											//$('.pxs_thumbnails li img:not(.pxs_thumbnails li.selected img)').stop().animate({opacity:'0.7'},100);
										});
										//При прохождении курсора над миниатюрой, она приподнимается
										$this.bind('mouseenter',function(){
											//$(this).stop().animate({top:'-10px'},100);
										}).bind('mouseleave',function(){
											//$(this).stop().animate({top:'0px'},100);
										});
									});
										
									//Делаем первую миниатюру выбранной
									highlight($thumbs.eq(0));
										
									//Проскальзываем при нажатии кнопки навигации
									$pxs_next.bind('click',function(){
										//$('.pxs_thumbnails li img').animate({opacity:'0.7'},100);
										++current;
										if(current >= total_elems)
											if(o.circular)
												current = 0;
										else{
											--current;
											return false;
										}
										highlight($thumbs.eq(current));
										slide(current,
										$pxs_slider,
										$pxs_bg3,
										$pxs_bg2,
										$pxs_bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
									$pxs_prev.bind('click',function(){
										--current;
										if(current < 0)
											if(o.circular)
												current = total_elems - 1;
										else{
											++current;
											return false;
										}
										highlight($thumbs.eq(current));
										slide(current,
										$pxs_slider,
										$pxs_bg3,
										$pxs_bg2,
										$pxs_bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
							
									/*
									 Нажатие на миниатюру приводит к выскальзыванию соответствующего изображения
									 */
									$thumbs.bind('click',function(){
										var $thumb	= $(this);
										highlight($thumb);
										//если включено автопроигрывание, прерываем его при нажатии кнопки мыши
										if(o.auto)
											clearInterval(slideshow);
										current 	= $thumb.index();
										slide(current,
										$pxs_slider,
										$pxs_bg3,
										$pxs_bg2,
										$pxs_bg1,
										o.speed,
										o.easing,
										o.easingBg);
									});
							
								
							
									/*
									Активируем автопроигрывание, 
									если установлена соответствующая опция
									 */
									if(o.auto != 0){
										o.circular	= true;
										slideshow	= setInterval(function(){
											$pxs_next.trigger('click');
										},o.auto);
									}
							
									/*
									При изменении размеров окна
									нужно пересчитать ширину элементов
									на основе новой ширины окна.
									Нужно также передвинуть текущий элемент,
									чтобы перерисовать левую часть.
									 */
									$(window).resize(function(){
										w_w	= $(window).width();
										setWidths($pxs_slider,$elems,total_elems,$pxs_bg1,$pxs_bg2,$pxs_bg3,one_image_w,$pxs_next,$pxs_prev);
										slide(current,
										$pxs_slider,
										$pxs_bg3,
										$pxs_bg2,
										$pxs_bg1,
										1,
										o.easing,
										o.easingBg);
									});

								}
							}).error(function(){
								alert('here')
							}).attr('src',$img.attr('src'));
						});
							
							
							
					});
				};
				
				//Текущая ширина окна
				var w_w				= $(window).width();
				
				var slide			= function(current,
				$pxs_slider,
				$pxs_bg3,
				$pxs_bg2,
				$pxs_bg1,
				speed,
				easing,
				easingBg){
					var slide_to	= parseInt(-w_w * current);
					$pxs_slider.stop().animate({
						left	: slide_to + 'px'
					},speed, easing);
					$pxs_bg3.stop().animate({
						left	: slide_to/2 + 'px'
					},speed, easingBg);
					$pxs_bg2.stop().animate({
						left	: slide_to/4 + 'px'
					},speed, easingBg);
					$pxs_bg1.stop().animate({
						left	: slide_to/8 + 'px'
					},speed, easingBg);
				}
				
				var highlight		= function($elem){
					$elem.siblings().removeClass('selected');
					$elem.addClass('selected');
				}
				
				var setWidths		= function($pxs_slider,
				$elems,
				total_elems,
				$pxs_bg1,
				$pxs_bg2,
				$pxs_bg3,
				one_image_w,
				$pxs_next,
				$pxs_prev){
					/*
					Ширина слайдера - это ширина окна умноженная на общее количество элементов в слайдере
					 */
					var pxs_slider_w	= w_w * total_elems;
					$pxs_slider.width(pxs_slider_w + 'px');
					//Каждый элемент имеет ширину равную ширине окна
					$elems.width(w_w + 'px');
					/*
					Мы также устанавливаем ширину каждого изображения фона.
					Значение также вычисляется с помощью pxs_slider
					 */
					$pxs_bg1.width(pxs_slider_w + 'px');
					$pxs_bg2.width(pxs_slider_w + 'px');
					$pxs_bg3.width(pxs_slider_w + 'px');
					
					/*
					Для обеих навигационных кнопок:
					windowWidth/2 - imgWidth/2 + небольшое поле (чтобы не касаться рамок изображений)
					 */
					var position_nav	= w_w/2 - one_image_w/2 + 3;
					//$pxs_next.css('right', position_nav + 'px');
					//$pxs_prev.css('left', position_nav + 'px');
					$pxs_next.css('right', position_nav + 20 + 'px');
					$pxs_prev.css('left', position_nav + 20 + 'px');
				}
				
				$.fn.parallaxSlider.defaults = {
					auto			: 0,	//задержка в секундах для периодического прокурчивания контента,
											//если значение 0 - автопрокрутка выключена
					speed			: 1000,//скорость проскальзывания слайда
					easing			: 'jswing',//эффект перехода для анимации
					easingBg		: 'jswing',//эффект перехода для анимации фона
					circular		: true,//проскальзывание по кругу
					thumbRotation	: true//миниатюры поворачиваются случайным образом
				};
				//easeInOutExpo,easeInBack
			})(jQuery);