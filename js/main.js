$(document).ready(function(){	

	// Слайдер на главной
	$(".head-banner").easySlider({
		auto: true, 
		numeric: true,
		continuous: true
	});
	
	$(".sale-leaders").easySlider({
		auto: false, 
		continuous: true,
		tska: 5,
		speed: 200
	});		
			
	$(".sale-images").easySlider({
		auto: false, 
		continuous: true,
		tska: 5,
		speed: 200
	});	
	
	$(".model .selector .slider .overflow").easySlider({
		auto: false, 
		tska: 1,
		prevId: 		'prev-button-selector',
		nextId: 		'next-button-selector',
		speed: 200,
		continuous: true
	});
	
	$(".background .selector .slider .overflow").easySlider({
		auto: false, 
		tska: 1,
		prevId: 		'prev-button-selector',
		nextId: 		'next-button-selector',
		speed: 200,
		continuous: true
	});
	
	$(".effects .selector .slider .overflow").easySlider({
		auto: false, 
		tska: 1,
		prevId: 		'prev-button-selector',
		nextId: 		'next-button-selector',
		speed: 200,
		continuous: true
	});
		
	$("header .model").bind('mouseover mouseout', function(i) {
		$(".model .imodel.selector").toggle();
		$(".model a.nav").toggleClass("active");
	});
	
	$("header .background").bind('mouseover mouseout', function(i) {
		$(".background .ibackground.selector").toggle();
		$(".background a.nav").toggleClass("active");
	});	
	
	$("header .effects").bind('mouseover mouseout', function(i) {
		$(".effects .ieffects.selector").toggle();
		$(".effects a.nav").toggleClass("active");
	});	
	
	$("header .catalog").bind('mouseover mouseout', function(i) {
		$(".catalog .icatalog.selector").toggle();
		$(".catalog a.nav").toggleClass("active");
	});		
	
	$("#true section").easySlider({
		auto: false, 
		tska: 3,
		prevId: 		'prev-button-product',
		nextId: 		'next-button-product',
		speed: 200,
		continuous: true
	});

	// Табы на главной
	$("#BlockSaleImages .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockSaleImages .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockSaleImages section").removeClass("active").eq(i).addClass("active");
			return false
		});
	});
	
	// Табы на странице каталога
	$("#BlockLookAtThis .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockLookAtThis .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockLookAtThis section").removeClass("active").eq(i).addClass("active");
			return false
		});
	});
		
	
	// Выпадающее меню
	$("nav#Main li.with-submenu").each(function(i){
		var $this = $(this);
		$this.bind('mouseenter mouseleave', function(){
			$("nav#Main li section").eq(i).toggleClass("active");
			$this.find("a.woman").toggleClass('active');
			$this.find("a.man").toggleClass('active');
			return false
		});		
	});	
	
	$(".brands li").each(function() {
		var $this = $(this);
		$this.bind('mouseenter mouseleave', function(){	
			$("aside").toggleClass("active");
		});
	});
	
	// Выпадающее меню
	$("#UserPanel .hide-visible a").click(function(i){
			$("#UserPanel .active").slideToggle(500);
			$("#UserPanel .unactive").slideToggle(500);
			return false	
	});	
	
	// Выпадающее меню
		$(".block.select .title").click(function(i){
			$(this).toggleClass('active');
			$(this).nextAll("article").toggleClass('active');
			return false;
		});	
		
});
	
	