/*
 * jQuery UI Menu @VERSION
 * 
 * Copyright 2010, AUTHORS.txt
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Menu
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($) {

$.widget("ui.menu", {
	_create: function() {
		var self = this;
		this.element
			.addClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
			.attr({
				role: "listbox",
				"aria-activedescendant": "ui-active-menuitem"
			})
			.bind( "click.menu", function( event ) {
				if ( self.options.disabled ) {
					return false;
				}
				if ( !$( event.target ).closest( ".ui-menu-item a" ).length ) {
					return;
				}
				// temporary
				event.preventDefault();
				self.select( event );
			})
			.bind( "mouseover.menu", function( event ) {
				if ( self.options.disabled ) {
					return;
				}
				var target = $( event.target ).closest( ".ui-menu-item" );
				if ( target.length && target.parent()[0] === self.element[0] ) {
					self.activate( event, target );
				}
			})
			.bind("mouseout.menu", function( event ) {
				if ( self.options.disabled ) {
					return;
				}
				var target = $( event.target ).closest( ".ui-menu-item" );
				if ( target.length && target.parent()[0] === self.element[0] ) {
					self.deactivate( event );
				}
			});
		this.refresh();
		
		if ( !this.options.input ) {
			this.options.input = this.element.attr( "tabIndex", 0 );
		}
		this.options.input.bind( "keydown.menu", function( event ) {
			if ( self.options.disabled ) {
				return;
			}
			switch ( event.keyCode ) {
			case $.ui.keyCode.PAGE_UP:
				self.previousPage();
				event.preventDefault();
				event.stopImmediatePropagation();
				break;
			case $.ui.keyCode.PAGE_DOWN:
				self.nextPage();
				event.preventDefault();
				event.stopImmediatePropagation();
				break;
			case $.ui.keyCode.UP:
				self.previous();
				event.preventDefault();
				event.stopImmediatePropagation();
				break;
			case $.ui.keyCode.DOWN:
				self.next();
				event.preventDefault();
				event.stopImmediatePropagation();
				break;
			case $.ui.keyCode.ENTER:
				self.select();
				event.preventDefault();
				event.stopImmediatePropagation();
				break;
			}
		});
	},
	
	destroy: function() {
		$.Widget.prototype.destroy.apply( this, arguments );
		
		this.element
			.removeClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
			.removeAttr( "tabIndex" )
			.removeAttr( "role" )
			.removeAttr( "aria-activedescendant" );
		
		this.element.children( ".ui-menu-item" )
			.removeClass( "ui-menu-item" )
			.removeAttr( "role" )
			.children( "a" )
			.removeClass( "ui-corner-all" )
			.removeAttr( "tabIndex" )
			.unbind( ".menu" );
	},
	
	refresh: function() {
		// don't refresh list items that are already adapted
		var items = this.element.children( "li:not(.ui-menu-item):has(a)" )
			.addClass( "ui-menu-item" )
			.attr( "role", "menuitem" );
		
		items.children( "a" )
			.addClass( "ui-corner-all" )
			.attr( "tabIndex", -1 );
	},

	activate: function( event, item ) {
		this.deactivate();
		if ( this._hasScroll() ) {
			var offset = item.offset().top - this.element.offset().top,
				scroll = this.element.attr( "scrollTop" ),
				elementHeight = this.element.height();
			if (offset < 0) {
				this.element.attr( "scrollTop", scroll + offset );
			} else if (offset > elementHeight) {
				this.element.attr( "scrollTop", scroll + offset - elementHeight + item.height() );
			}
		}
		this.active = item.first()
			.children( "a" )
				.addClass( "ui-state-hover" )
				.attr( "id", "ui-active-menuitem" )
			.end();
		this._trigger( "focus", event, { item: item } );
	},

	deactivate: function(event) {
		if (!this.active) { return; }

		this.active.children( "a" )
			.removeClass( "ui-state-hover" )
			.removeAttr( "id" );
		this._trigger( "blur", event );
		this.active = null;
	},

	next: function(event) {
		this._move( "next", ".ui-menu-item", "first", event );
	},

	previous: function(event) {
		this._move( "prev", ".ui-menu-item", "last", event );
	},

	first: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	last: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function(direction, edge, filter, event) {
		if ( !this.active ) {
			this.activate( event, this.element.children(edge)[filter]() );
			return;
		}
		var next = this.active[ direction + "All" ]( ".ui-menu-item" ).eq( 0 );
		if ( next.length ) {
			this.activate( event, next );
		} else {
			this.activate( event, this.element.children(edge)[filter]() );
		}
	},

	// TODO merge with previousPage
	nextPage: function( event ) {
		if ( this._hasScroll() ) {
			if ( !this.active || this.last() ) {
				this.activate( event, this.element.children( ".ui-menu-item" ).first() );
				return;
			}
			var base = this.active.offset().top,
				height = this.element.height(),
				// TODO replace children with nextAll
				// TODO replace filter with each, break once close > 0 and use that item as the result 
				result = this.element.children( ".ui-menu-item" ).filter( function() {
					var close = $( this ).offset().top - base - height + $( this ).height();
					// TODO replace with check close > 0
					return close < 10 && close > -10;
				});

			// TODO try to catch this earlier when scrollTop indicates the last page anyway
			if ( !result.length ) {
				result = this.element.children( ".ui-menu-item" ).last();
			}
			this.activate( event, result );
		} else {
			this.activate( event, this.element.children( ".ui-menu-item" )
				// TODO use .first()/.last()
				.filter( !this.active || this.last() ? ":first" : ":last" ) );
		}
	},

	// TODO merge with nextPage
	previousPage: function( event ) {
		if ( this._hasScroll() ) {
			if ( !this.active || this.first() ) {
				this.activate( event, this.element.children( ".ui-menu-item" ).last() );
				return;
			}

			var base = this.active.offset().top,
				height = this.element.height();
				result = this.element.children( ".ui-menu-item" ).filter( function() {
					var close = $(this).offset().top - base + height - $(this).height();
					// TODO improve approximation
					return close < 10 && close > -10;
				});

			// TODO try to catch this earlier when scrollTop indicates the last page anyway
			if (!result.length) {
				result = this.element.children( ".ui-menu-item" ).first();
			}
			this.activate( event, result );
		} else {
			this.activate( event, this.element.children( ".ui-menu-item" )
				// TODO use .first()/.last()
				.filter( !this.active || this.first() ? ":last" : ":first" ) );
		}
	},

	_hasScroll: function() {
		return this.element.height() < this.element.attr( "scrollHeight" );
	},

	select: function( event ) {
		this._trigger( "select", event, { item: this.active } );
	}
});

}( jQuery ));
