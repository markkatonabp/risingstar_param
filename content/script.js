/*****************
* TOOLTIP CUSTOM *
*****************/
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});


/*********************
* SELECT ITEM CUSTOM *
*********************/
$(function() {
	var x, i, j, l, ll, selElmnt, a, b, c;
	
	/* Look for any elements with the class "custom-select": */
	x = document.getElementsByClassName("custom-select-4dv");
	l = x.length;
	for (i = 0; i < l; i++) {
  		selElmnt = x[i].getElementsByTagName("select")[0];
  		ll = selElmnt.length;
  
		/* For each element, create a new DIV that will act as the selected item: */
  		a = document.createElement("DIV");
  		a.setAttribute("class", "select-selected");
  		a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  		x[i].appendChild(a);
		
  		/* For each element, create a new DIV that will contain the option list: */
  		b = document.createElement("DIV");
  		b.setAttribute("class", "select-items select-hide");
  		for (j = 1; j < ll; j++) {
    		
			/* For each option in the original select element, create a new DIV that will act as an option item: */
    		c = document.createElement("DIV");
    		c.innerHTML = selElmnt.options[j].innerHTML;
    		c.addEventListener("click", function(e) {
        
				/* When an item is clicked, update the original select box, and the selected item: */
				var y, i, k, s, h, sl, yl;
				s = this.parentNode.parentNode.getElementsByTagName("select")[0];
				sl = s.length;
				h = this.parentNode.previousSibling;
				for (i = 0; i < sl; i++) {
					if (s.options[i].innerHTML == this.innerHTML) {
						s.selectedIndex = i;
						h.innerHTML = this.innerHTML;
						y = this.parentNode.getElementsByClassName("same-as-selected");
						yl = y.length;
						for (k = 0; k < yl; k++) {
							y[k].removeAttribute("class");
						}
						this.setAttribute("class", "same-as-selected");
						break;
					}
				}
				h.click();
    		});
    		b.appendChild(c);
  		}
		x[i].appendChild(b);
		a.addEventListener("click", function(e) {

			/* When the select box is clicked, close any other select boxes, and open/close the current select box: */
			e.stopPropagation();
			closeAllSelect(this);
			this.nextSibling.classList.toggle("select-hide");
			this.classList.toggle("select-arrow-active");
		});
	}

	function closeAllSelect(elmnt) {
		
		/* A function that will close all select boxes in the document,
		except the current select box: */
		var x, y, i, xl, yl, arrNo = [];
		x = document.getElementsByClassName("select-items");
		y = document.getElementsByClassName("select-selected");
		xl = x.length;
		yl = y.length;
	  
		for (i = 0; i < yl; i++) {
			if (elmnt == y[i]) {
				arrNo.push(i)
			} else {
				y[i].classList.remove("select-arrow-active");
			}
		}
		for (i = 0; i < xl; i++) {
			if (arrNo.indexOf(i)) {
				x[i].classList.add("select-hide");
			}
		}
	}

	/* If the user clicks anywhere outside the select box,
	then close all select boxes: */
	document.addEventListener("click", closeAllSelect);

});

$(document).ready(function() {
	
	/************************
	* ALL WEBSITE FUNCTIONS *
	************************/
	$('button').click(function(){
		$(this).toggleClass('active');
	})
	

	/*******
	* MENU *
	*******/

	
	/******************
	* MENU AUTO CLOSE *
	******************/
	$("#header-nav-button").click(function() {
		$("#header-nav").toggleClass('opened');
	});
	
	var isMobile = true;
	function testMobile(){
		isMobile = window.matchMedia("only screen and (max-width: 860px)").matches;

		if (isMobile) {
			return isMobile;
		}
	}; 
	var menuTimeout;
	$("#header-nav").hover(function(){
		
		if( $(".navbar-collapse").hasClass('show') ){
			// mouse in
			clearTimeout(menuTimeout);
			console.log('paused');
			}
		}
		, function(){
			
			testMobile();
			if( isMobile === false ){
				if( $(this).hasClass('opened') ){
				// mouse out
				menuTimeout = setTimeout(function(){
					$("#header-nav").toggleClass('opened');
					$(".navbar-collapse").toggleClass('show');
					}, 3000
				);
				console.log('started');
				}
			}
		}
	);
    
    
    /*****************
    * MENU SCROLLSPY *
    *****************/
	$(window).scroll(function(){
        if( $('.scroll-active') ) {
            var itemOffsetTop = $('.scroll-active').offset().top;
            var windowScrollTop = $(this).scrollTop();

            if( windowScrollTop >=  itemOffsetTop) {
                $('#header-nav').addClass('scrolled')
            } else {
                $('#header-nav').removeClass('scrolled')
            }
        }
        
    });
    
    
    /********************
    * MENU SUB DROPDOWN *
    ********************/
    $('.dropdown-submenu > a.dropdown-toggle').on('click', function(e) {
        var $subTitle = $(this).parent('.dropdown-submenu');
        var $subMenu = $(this).next('.dropdown-menu');
        $subMenu.toggleClass('show');
        $subTitle.toggleClass('active');
        
        if( $subMenu.hasClass('show') ){
            $subMenu.parent('.dropdown-submenu').siblings('.dropdown-submenu').find('.dropdown-menu').removeClass('show');
            $subMenu.parent('.dropdown-submenu').siblings('.dropdown-submenu').removeClass('active');
        }

        return false;
    });
	
    /**************************
    * HOMEPAGE TRYIT CAROUSEL *
    **************************/    
    $('#tryit-carousel').on('slide.bs.carousel', function (e) {
          var indicator = $('[data-target="#'+this.id+'"]');
          var index = $(e.relatedTarget).index();
          indicator.removeClass('active');
          indicator.filter('[data-slide-to="'+ index +'"]').addClass('active');
        
         console.log('changed');
        })
	
	/********************
    * HOMEPAGE PARALLAX *
    ********************/
	// var parallaxScene = document.getElementById('homepage-section-offering');
	// var parallaxInstance = new Parallax(parallaxScene, {
		// relativeInput: true,
		// pointerEvents: false,
		// hoverOnly: true
	// });
//	alert('here');
//	$('.parallax-container').mousemove(function (e){
//		var change;
//		
//    	var xpos = e.clientX;
//		var ypos = e.clientY;
//		
//		var left = change*20;
//		
//    	var xpos = xpos * 2;
//		var ypos = ypos * 2;
//		
////		console.log( ((0+(ypos/50)) + ' , ' + (( 0+(xpos/2)) )));
//		
//		$('.parallax-item').css('top',( (0+(ypos/50))+"px") );
//    	$('.parallax-item').css('left',( ( 0+(xpos/80))+"px") );
//	});

    
	/*****************************
	* STUDIO CAROUSEL RESPONSIVE *
	*****************************/
	var studiosCarouselPaused = false;
	var studiosNum = $('.studios-container').length;
	var studioWidth = $('.studios-container').outerWidth(true);
	var currentElemIndex = $('.studios-container.active').index();
	var xs = 844; // less than, 1 elements
	var md = 991; // less than, 2 elements
	var x = 1; // move 1 element by default
	 
	function responsiveElement(){
		var windowWidth = $(window).innerWidth(); 
		if (windowWidth >= md)
			x = 3 ;
		else if (windowWidth >= xs)
			x = 2 ;
		else
			x = 1 ;
		
		return x;
	}

	function loopStudio(){
		responsiveElement();
		
		var nextElemIndex = currentElemIndex + x ;
		var remainingIndex = studiosNum - nextElemIndex;
		
		if(remainingIndex < x && remainingIndex !== 0)
			var nextElemIndex = currentElemIndex + remainingIndex ;
		else
			var nextElemIndex = currentElemIndex + x ;
		 	 
		var translation = -(studioWidth * nextElemIndex);
		if(nextElemIndex < studiosNum ) { 
			$('.studios-container').eq(currentElemIndex).removeClass('active');
			$('.studios-container').eq(nextElemIndex).addClass('active');
			$('#studios-mover').css({
				'margin-left' : translation
			});			
		} else {
			$('.studios-container').eq(currentElemIndex).removeClass('active');
			$('.studios-container').eq(0).addClass('active');
			$('#studios-mover').css({
				'margin-left' : 0
			});
		}
		 
		currentElemIndex = $('.studios-container.active').index();
		selectorsBullet();
	}
	 
	function nextStudio(){
		currentElemIndex = $('.studios-container.active').index();
		var nextElemIndex = currentElemIndex + 1;
		var translation = -(studioWidth * nextElemIndex);
		
		responsiveElement();
		 
		var remainingIndex = studiosNum - nextElemIndex;
		var lastIndex = studiosNum - x;		
		 
		if(nextElemIndex < studiosNum && remainingIndex > x) {
			if(nextElemIndex < lastIndex){
				$('.studios-container').eq(currentElemIndex).removeClass('active');
				$('.studios-container').eq(nextElemIndex).addClass('active');
				$('#studios-mover').css({
					'margin-left' : translation
				});
				
			}
		}
		else if(nextElemIndex === lastIndex){
			$('.studios-container').eq(currentElemIndex).removeClass('active');
			$('.studios-container').eq(lastIndex).addClass('active');
			$('#studios-mover').css({
				'margin-left' : translation
			});
			
			$('.studios-carousel-selectors li').eq(currentElemIndex).removeClass('active');
			$('.studios-carousel-selectors li').eq(lastIndex).addClass('active');
		}
		 
		selectorsBullet();
	}
	 
	function prevStudio(){	 
		currentElemIndex = $('.studios-container.active').index();
		var prevElemIndex = currentElemIndex - 1;
		var translation = -(studioWidth * prevElemIndex);
		if(prevElemIndex >= 0 ) { 
			$('.studios-container').eq(currentElemIndex).removeClass('active');
			$('.studios-carousel-selectors li').eq(currentElemIndex).removeClass('active');
			$('.studios-container').eq(prevElemIndex).addClass('active');
			$('.studios-carousel-selectors li').eq(prevElemIndex).addClass('active');
			$('#studios-mover').css({
				'margin-left' : translation
			});
		}
		 
		selectorsBullet();
	}
	
	if($('#studios-mover').length != 0) {
		var studiosCarousel = setInterval(function(){
			console.log('isPaused: '+studiosCarouselPaused)
			if(!studiosCarouselPaused){
				loopStudio();
			}
		}, 4000);
	}
	 
	$('#studioNext').click(function(){
		 nextStudio();
	});
	$('#studioPrev').click(function(){
		 prevStudio();
	});
	 
	$('.studios-wrapper').children().not('.studios-carousel-selectors').hover(function(){
		 studiosCarouselPaused = true;
		  console.log('in');
	}, function(){
		 studiosCarouselPaused = false;
		 console.log('out');
	});
	 
	 
	/****************************
	* STUDIO CAROUSEL SELECTORS *
	****************************/
	var selectorsLength = $('.studios-carousel-selectors li').length;
	var lastSelectors = selectorsLength - x;

	function constructBullet() {
		responsiveElement();		
		 
		$('.studios-carousel-selectors li').removeClass('visible');
		for( var i = 0 ; i < selectorsLength ; i++){
			
			 if( i % x === 0){
				 if(i < lastSelectors) {

					$('.studios-carousel-selectors li').eq(i).addClass('visible');
				 } else {
					
					$('.studios-carousel-selectors li').eq(lastSelectors).addClass('visible');
				 }
			 }
		 }
	}
	 
	constructBullet();
	 
	function selectorsBullet() {
		responsiveElement();
		
		var selectorsMultiple = Math.ceil(currentElemIndex/x)*x;
		
		$('.studios-carousel-selectors li').removeClass('active');
		
		if(selectorsMultiple < lastSelectors) {
			$('.studios-carousel-selectors li').eq(selectorsMultiple).addClass('active');
		} else {
			$('.studios-carousel-selectors li').eq(lastSelectors).addClass('active');
		}	 
	}
	 
	$('.studios-carousel-selectors li').click(function(){
		var gotoTimeout;
		
		studiosCarouselPaused = true;
		 
		var gotoElemIndex = $(this).index();
		var gotoBulletIndex = $(this).index('.visible');
		var translation = -(studioWidth * gotoElemIndex);
		console.log(studiosCarouselPaused);
		 
		$('.studios-container').removeClass('active');
		$('.studios-carousel-selectors li').removeClass('active');
		 
		$('.studios-container').eq(gotoElemIndex).addClass('active');
		$('.studios-carousel-selectors li.visible').eq(gotoBulletIndex).addClass('active');
		 
		currentElemIndex = gotoElemIndex;
		 
		$('#studios-mover').css({
			'margin-left' : translation
		});
		
		var gotoTimeout = setTimeout(function(){
				studiosCarouselPaused = false;
			}, 3000
		);		 
	});
	 
	
    /**********
	* PRODUCT *
	**********/
    $("#product-performancesVideo ~ .videoOverlay.active").click(function(){
        $(this).toggleClass("active");
        
        var video = $("#product-performancesVideo");
        
        if( !$(this).hasClass('active') ){
            video[0].play();
            video.attr('controls', '');
        } else {
            video[0].pause();
            video.removeAttr('controls');
        }
    })
    
	/***********
	* DOWNLOAD *
	***********/
	function changeDownloadSelect(select) {
		var option = select.find('option:selected');
		var optionBackground = option.css('background-image');

		select.css({
			'background-image' : optionBackground
		});
	}
	$('.download-select').change(function(){
		changeDownloadSelect($(this)); 
	});
	
	
	/*******
	* DEMO *
	*******/
	$('#hologalleryMenu-toggler').click(function(){
		$('#hologalleryMenu').toggleClass('opened');
	});
	
	
	/*******************
	* ON WINDOW RESIZE *
	*******************/
	$(window).resize(function(){
//		 responsiveElement();
		 constructBullet();
	});
    
    
    
    /***********
    * ARTICLES *
    ***********/

    /***********
    * PopUp Banner Removal *
    ***********/
    var overlayBanners = document.getElementsByClassName('info-area');

		for (var i = 0; i < overlayBanners.length; i ++) {
		    overlayBanners[i].style.display = 'none';
		}
});