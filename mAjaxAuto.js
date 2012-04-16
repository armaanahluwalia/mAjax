;(function( $, window, document, undefined ){

  // the plugin prototype
  var mAjaxAuto = {
    defaults: {
			loadingStart : function() {
				$('#loader').delay(100).fadeTo(200, 1);
				$('#container').animate({marginLeft:"800px", opacity:0}, 400, function() {

				});
			},
			loadingFinish : function() {
				$('#container').css('margin-left','-800px');
				$('#loader').fadeTo(200, 0);
				$('#container').animate({marginLeft:0, opacity:1}, 400, 'swing');				
			}
    },
		options : null,
		target : null,
		baseUrl : null,		
		dfd_preload : null,
		dfd_loadinganim : null,
		dfd_dataLoaded : null,
		data_received : null,
		onDataLoaded : null,
		loading : null,
    init: function(options, elem) {
	
			var self = this;			
	
      // Introduce defaults that can be extended either
      // globally or using an object literal.
      this.options = $.extend({}, this.defaults, options);

			/************************************
			 	VAR INITIALISATION
			************************************/	

      this.elem = elem;
      this.$elem = $(elem);			
			
			this.baseUrl = this.options.baseUrl;
			if(!this.baseUrl)	throw "missing base url for mAjaxAuto";
			this.container = this.$elem;				
			
			this.target= this.options.target;
			if(!this.target)	throw "missing target element for mAjaxAuto";
			this.$target = $(this.target);

			this.checkPageLoaded();

			/*---------------------------------------
			Send mAjax to the pageloaded callback
			stack to be fired irrespective of what 
			page visitors land at
			---------------------------------------*/
			this.onLoad(function() {

				$(self.container).mAjax({
					baseUrl : self.baseUrl,
					loading : function() { self.loading.call(self); },
					complete : function(data) { self.data_received.call(self, data); },
					linkselectors : self.options.linkselectors
				});

				$('#loader').fadeTo(200, 0);		
					
			});

      return this;
    },

		/************************************
		 	COMMON FUNCTIONS
		************************************/	

		/*---------------------------------------
		Function to allow individual pages
		to add callback functions to the
		pageloaded event via the deferred
		---------------------------------------*/
		onLoad : function(func) {
			this.dfd_pageLoaded.done(function() { 
				func();
			});
		},

		/*---------------------------------------
		Function to fire when an AJAX call is
		made from mAjax
		---------------------------------------*/
		loading : function() {
			self = this;
			//Reset our deferreds fir the new AJAX Call
			self.dfd_pageLoaded	= $.Deferred();
			self.dfd_loadinganim = $.Deferred();
			self.dfd_dataLoaded = $.Deferred();
		
			self.checkPageLoaded();


			$.when(mAjaxAuto.dfd_preload,
				self.options.loadingStart()
			).then(function() {	
				self.dfd_loadinganim.resolve();
			});

		},

		/*---------------------------------------
		Function to fire when mAjax returns
		data from an AJAX request
		---------------------------------------*/
		data_received : function(data) {
			var self = this;
			this.dfd_loadinganim.done(function() {
				self.fillAndLoad(self.$target, data, 
					function() { // Describe what we want once page setup is done
						self.options.loadingFinish();
					}
				);
			});

		},

		/************************************
		 	HELPER FUNCTIONS 
		************************************/

		/*---------------------------------------
		Function to load data into target and
		fulfill the AJAX loading deferred
		---------------------------------------*/

		fillAndLoad  : function(target, data, callback) {
			$(target).html($('#container',data).html());
			this.resolveImages(target, this.dfd_dataLoaded);

			return this.dfd_dataLoaded.done( callback );
		},

		/*---------------------------------------
		Function to check if there is a 
		deferred for loading data via ajax 
		---------------------------------------*/

		dataHasLoaded : function () {
			if(this.dfd_dataLoaded) return this.dfd_dataLoaded;
			return $.Deferred().resolve();
		},

		/*---------------------------------------
		Function to check if the changed page
		state has finished loading
		---------------------------------------*/	

		checkPageLoaded : function () {	
			
			this.dfd_pageLoaded	= $.Deferred();

			/*---------------------------------------
			Setup the deferreds so that if preload
			has taken place and ajax data has loaded
			( if it exists to be loaded ) then fire 
			the page has loaded callback events
			---------------------------------------*/		
			var preloadTarget = this.container;
			var self= this;
			
			this.dfd_preload = this.preload(preloadTarget, function() {
					self.$elem.fadeTo(1000, 1);
			});			
			
			var self = this;
			
			$.when(self.dfd_preload,
				self.dataHasLoaded()
			).then(function() {	
				self.dfd_pageLoaded.resolve();
			});
		},

		/*---------------------------------------
		Function to preload the contents of the
		page and return a deferred
		---------------------------------------*/
		preload : function(target, callback) {

			$('#loader').fadeTo(200, 1); // Show loader		

			var dfd = $.Deferred().done(callback);
			this.resolveImages(target, dfd);
			return dfd;
		},

		/*---------------------------------------
		Function for preloading images - 
		Resolves a passed in deferred object
		---------------------------------------*/

		resolveImages : function (target, dfd) {	

			$imgs = $('img', target);

			if($imgs.length > 0) {

				/* If there are images on the page 
				to preload then go ahead and preload */			

				var imgCntr = $imgs.length;
				$.each($imgs, function() {
						_im = $(this).load(function(){ 
							$(this).fadeIn('fast', function() {
								imgCntr--;
								if (imgCntr <=0) {
									dfd.resolveWith(target);
								}
							}); 
						});
				});
			} else {

			/* Otherwise just resolve and fire whatever callback there is */

				dfd.resolveWith(target);

			}
		}
  }

	$.plugin = function( name, object ) {
	  $.fn[name] = function( options ) {
	    return this.each(function() {
	      if ( ! $.data( this, name ) ) {
	        $.data( this, name, Object.create(object).init(
	        options, this ) );
	      }		
	    });
	  };
	};

	$.plugin('mAjaxAuto', mAjaxAuto);

})( jQuery, window , document );