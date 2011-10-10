$(document).ready(function(){
	
	$('.head .menu_main li.m1:first').addClass('first');
	$('.head .menu_main li.m1:last').addClass('last');
	$('.menu_one li:last,.menu_too li:last').css('margin-right','0');
	$('.menu_left2 li .hit:odd,.see_old li .hit:odd').css('margin-right','0');
	$('.menu_tov_bot li.m1:last a.m1').css('background-image','none');
	
	$('.clothing_list').each(function(i){
		$('.menu_one li:last').css('margin-right','0');
		$(this).children('div').children('a:even').css('width','85px');
		$(this).children('div').children('a:odd').css('width','150px');
	});
	
	$('.catalog_part .product').each(function(i){
		if (i%5==4)$(this).css('margin-right','0');
	});
	
	$('.lk_menu ul').each(function(i){
		$(this).children('li:last').children('a').css('border','0');
	});
	
	$('.menu_tov_bot li.m1 ul').css('top',-$('.menu_tov_bot li.m1 ul').height()).hide();
	$('.menu_tov_bot li.m1').hover(function(){
		$(this).children('ul').show();
	},function(){
		$(this).children('ul').hide();
	});
	
/*----------------------VKLADKI------------------------*/
	//$('div.vk_content:first').show();
	$('.vkladki .t ul li').each(function(j){
		if ($(this).attr('class')=='active'){
		var num = $(this).children('a').attr('id').replace(/num/,"");
		var massDivCont = $(this).parent('ul').parent('div.t').parent('div.vkladki').children('div.vk_content');
			for(var i=0; i<massDivCont.length;i++){
				if (i==num){
					$(massDivCont[i]).show();
				}
			}
		}
	});

	$('.vkladki .t ul li a').click(function(e){
		e.preventDefault();
		var num = $(this).attr('id').replace(/num/,"");
		$(this).parent('li').parent('ul').children('li').removeClass('active');
		//alert();
		$(this).parent('li').parent('ul').parent('div.t').parent('div.vkladki').children('div.vk_content').hide();
		var massDivCont = $(this).parent('li').parent('ul').parent('div.t').parent('div.vkladki').children('div.vk_content');
		for(var i=0; i<massDivCont.length;i++){
			if (i==num){
				$(massDivCont[i]).show();
			}
		}
		$(this).parent('li').addClass('active');
	});



/*--------------------CHECKBOX---------------------*/
		if ( $.browser.msie ){
			var divC = $('div.checkbox');
			for (var i = 0; i < divC.length; i++) {
				if ($(divC[i]).children('label').children('input').attr('checked')==false){
					$(divC[i]).removeClass('checked');
				}
				if ($(divC[i]).children('label').children('input').attr('checked')==true){
					$(divC[i]).addClass('checked');
				}
			}
			$('div.checkbox').click(function(){
				if ($(this).children('label').children('input').attr('checked')==false){
					$(this).removeClass('checked');
				}
				if ($(this).children('label').children('input').attr('checked')==true){
					$(this).addClass('checked');
				}
			});
			$('div.ch_right').click(function(){
				if ($(this).children('label').children('input').attr('checked')==false){
					$(this).parent().children('ul').children('li').each(function(i){
						$(this).children('div.checkbox').children('label').children('big').removeClass('active');
						$(this).children('div.checkbox').children('label').children('input').removeAttr('checked');
						$(this).children('div.checkbox').removeClass('checked');
					});
				}
				if ($(this).children('label').children('input').attr('checked')==true){
					$(this).parent().children('ul').children('li').each(function(i){
						$(this).children('div.checkbox').children('label').children('big').addClass('active');
						$(this).children('div.checkbox').children('label').children('input').attr('checked','checked');
						$(this).children('div.checkbox').addClass('checked');
					});
				}
			});
		
		}

			var divC = $('div.checkbox');
			for (var i = 0; i < divC.length; i++) {
				//alert(jQuery(divC[i]).children('label').children('input').attr('checked'));
				if ($(divC[i]).children('label').children('input').attr('checked')==false){
					$(divC[i]).children('label').children('big').removeClass('active');
				}
				if ($(divC[i]).children('label').children('input').attr('checked')==true){
					$(divC[i]).children('label').children('big').addClass('active');
				}
			}
		
			$('div.checkbox').click(function(){
				if ($(this).children('label').children('input').attr('checked')==false){
					$(this).children('label').children('big').removeClass('active');
				}
				if ($(this).children('label').children('input').attr('checked')==true){
					$(this).children('label').children('big').addClass('active');
				}
			});
			
		$('div.ch_right').click(function(){
			if ($(this).children('label').children('input').attr('checked')==false){
				$(this).parent().children('ul').children('li').each(function(i){
					$(this).children('div.checkbox').children('label').children('big').removeClass('active');
					$(this).children('div.checkbox').children('label').children('input').removeAttr('checked');
				});
			}
			if ($(this).children('label').children('input').attr('checked')==true){
				$(this).parent().children('ul').children('li').each(function(i){
					$(this).children('div.checkbox').children('label').children('big').addClass('active');
					$(this).children('div.checkbox').children('label').children('input').attr('checked','checked');
				});
			}
		});
		
/*--------------------END CHECKBOX---------------------*/

	$('#hide').toggle(function(e){
		e.preventDefault();
		$(this).addClass('active').text('развернуть');
		$('.big .bag_tov').slideUp();
	},function(e){
		e.preventDefault();
		$(this).removeClass('active').text('свернуть');
		$('.big .bag_tov').slideDown();
	});
	
/*-----------------DROPDOWN CART-----------------------*/	
	$(".bag").hover(function(){
		$(this).addClass("selected");
		$('.cart').fadeIn();
	}, function(){
		$(this).removeClass("selected");
		$('.cart').fadeOut();
	});

});
$(window).resize(function(){

});