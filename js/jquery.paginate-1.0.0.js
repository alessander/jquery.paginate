/*
 * jquery.paginate
 * a plugin for jquery powered pagination
 *
 * Copyright (c) 2010 Marcel Stegmann
 *
 * Version: 1.0.0 (11/04/2010)
 * Requires: jQuery v1.3+
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
(function($) {

    $.paginate = {
       defaults: {
			count: 0, // how many entries
			current: null, // current entry
			currentPage: 1, // current page (dont use current and currentPage at the same time)
			renderPages: 10, // how many pages are visible
			perPage: 10, // how many entries per page are shown
            jumpButtons: 1, // how many quick jump button on beginning or end (use false for disable)
            jumpButtonSpacer: ' ... ', // spacer between jump and page buttons
            invokerClass: 'paginate', // class for the invoker
            jumpButton: '<a href="#" class="button"></a>',
            prevButton: '<a href="#" class="button">«</a>', // use false for disable
            pageButton: '<a href="#" class="button"></a>',
            nextButton: '<a href="#" class="button">»</a>', // use false for disable
            disabledClass: 'disabled-button', // class for disabled prev or next button
            currentClass: 'current-button', // class for active page
            firstPage: 1, // don't change this
			onNext: function() {}, // called on next button click (return false for stop)
			onPrev: function() {}, // called on prev button click (return false for stop)
			onClick: function() {}, // called on any page click (return false for stop)
			onChange: function() {}, // called on any page change (return false for stop)
			onInit: function() {} // called on init (return false for stop)
       }
    };

	jQuery.fn.paginate = function(options) {
		options = $.extend({}, $.paginate.defaults, options);

		this.each(function() {
			$(this).empty().addClass(options.invokerClass);

			options.target = this;
			options.lastPage = Math.ceil(options.count / options.perPage);

			// calc where we are
			if(options.current) {
				options.currentPage = Math.floor(options.current / options.perPage) + 1;
				options.current = null;
			}

			var initCallback = options.onInit;
			options.onInit = null;

			if(options.onInit && options.onInit(options) == false) {
				return;
			}

			// Nothing to do
			if(options.count == 0) {
				return;
			}

			var changeCallback = function(newOpt) {
				if(options.onChange(newOpt) != false) {
					$(options.target).paginate(newOpt);
				}

				return false;
			};

			var clickCallback = function() {
				var newOptions = options;
				newOptions.currentPage = Math.min(options.lastPage, this.id);

				if(newOptions.onClick(newOptions) != false) {
					changeCallback(newOptions);
				}

				return false;
			};
            
			var prevCallback = function() {
				var newOptions = options;
				newOptions.currentPage = Math.max(options.firstPage, options.currentPage - 1);

				if(newOptions.onPrev(newOptions) != false) {
					changeCallback(newOptions);
				}

				return false;
			};

            $(this).bind('prevPage', prevCallback);

			var nextCallback = function() {
				var newOptions = options;
				newOptions.currentPage = Math.min(options.lastPage, options.currentPage + 1);

				if(newOptions.onNext(newOptions) != false) {
					changeCallback(newOptions);
				}

				return false;
			};

            $(this).bind('nextPage', nextCallback);

			// The center of rendered pages - the current one
			var centerPage = Math.ceil((options.renderPages - 1) / 2);

			var renderStart = Math.max(options.firstPage, options.currentPage - centerPage);
			var renderEnd = Math.min(options.lastPage, renderStart + options.renderPages - 1);

			// We are at the end and need to prepend some pages to fill
			var pageFill = options.renderPages - ((renderEnd - renderStart) + 1);

			if(pageFill < options.renderPages) {
				renderStart = renderStart - pageFill;
			} else {
				renderStart -= pageFill;
			}

			renderStart = Math.max(options.firstPage, renderStart);

            if(options.prevButton != false) {
                $(this).append(
                    $(options.prevButton).click(prevCallback).each(function() {
                        if(options.currentPage == options.firstPage) {
                            $(this).addClass(options.disabledClass);
                        }
                    })
                );
            }

			var node = null;

            if(options.jumpButtons != false) {
                if(options.currentPage > (options.lastPage / 2) && renderStart > options.firstPage && options.lastPage > options.jumpButtons) {
                    for(var jumpButton = options.firstPage; jumpButton <= options.jumpButtons + 1; jumpButton++) {
                        node = $(options.pageButton).append(jumpButton).click(clickCallback).attr('id', jumpButton);

                        if(jumpButton == options.jumpButtons + 1) {
                            $(this).append(options.jumpButtonSpacer);
                        }

                        $(this).append(node);
                    }
                }
            }

			for(var renderPage = renderStart; renderPage <= renderEnd; renderPage++) {
				node = $(options.pageButton).append(renderPage).click(clickCallback).attr('id', renderPage);

				if(renderPage == options.currentPage) {
					node.addClass(options.currentClass);
				}

				$(this).append(node);
			}

            if(options.jumpButtons != false) {
                var firstJumpButton = Math.max(options.firstPage, options.lastPage - options.jumpButtons + 1);

                if(options.lastPage > options.renderPages && renderEnd < firstJumpButton) {
                    for(var jumpButton = firstJumpButton; jumpButton <= options.lastPage; jumpButton++) {
                        node = $(options.pageButton).append(jumpButton).click(clickCallback).attr('id', jumpButton);

                        if(jumpButton == firstJumpButton) {
                            $(this).append(options.jumpButtonSpacer);
                        }

                        $(this).append(node);
                    }
                }
            }

            if(options.nextButton != false) {
                $(this).append(
                    $(options.nextButton).click(nextCallback).each(function() {
                        if(options.currentPage == options.lastPage) {
                            $(this).addClass(options.disabledClass);
                        }
                    })
                );
            }

			return this;
		});
	};
    
})(jQuery);