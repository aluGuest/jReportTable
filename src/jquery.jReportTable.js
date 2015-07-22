/*
 *  jQuery jReportTable - v1.2.1
 *
 *  https://github.com/matiasperrone/jReportTable
 *
 *  Made by Matias Perrone and Santiago Cattaneo
 *  Under MIT License
 *  Last Modification: 2015-04-07 13:31 UTC
 */

;(function ($, window, document, undefined)
{
    var defaults = {
	        rdtypes: { money: [], percent: [] },  //array column of type money (could be index column or name)
	        hideColumn: [], //array hide only this column
	        showColumn: [], //array show only this column
	        ajaxCall: "/ajaxCall",  //from where get the data
	        ajaxMethod: 'POST', // Optional. The method call
	        //If Ajax call fails
	        ajaxFailfunction: function (e) {
	        	$(this.element).find(this.settings.selectors.loading).hide();
	        },
	        query: '', // Optional. You get this field in the request always (or empty if not is set)
	        // "custom" Optional. you get this field in the request (if is set),
	        // refresh: true, // Optional (always boolean). You get this field on every the request usually on false,
	        iconOrderClass: 'icon-sort-by-attributes', //class witch draw order asc icon (could be a font icon)
	        iconOrderClassDesc: 'icon-sort-by-attributes-alt', //class witch draw order desc icon (could be a font icon)
	        iconColor: '#08c', //color of icon (if you use a icon font, you can set color outside icon class)
	        messageNotFound: "No results found",
	        render: {
	    		value: function (key, value, row, tr) {  //Can change each field data result, and you can take any data from the row
	                return value;
	            }
	        },
	        pagination: {
	        	class: 'ul.pagination',
	        	item: 'li',
	        	link: 'a',
	        	itemClass: 'r-page',
	        	previousHTML: '&laquo;',
	        	previousClass: 'r-previous',
	        	nextHTML: '&raquo;',
	        	nextClass: 'r-next'
	        },
	        selectors: {
	        	search: '.r-search',
	        	columns: '.r-columns',
	        	rows: '.r-rows',
	        	recordfrom: '.r-from',
	        	recorduntil: '.r-until',
	        	recordtotal: '.r-total',
	        	loading: '.r-loading',
	        	pagelength: '.r-pagelength'
	        },
	        data: [], //column data of first page (optional, fist page not ajax call)
	        total: 0,
	        page: 1,
	        pagelength: 10,
	        pagelengthset: [],
	        sorting: {
	        	field: '',
	        	order: 1
	        },
	        refresh: true
	    };

    // The actual plugin constructor
    function jReportTable(element, options)
    {
        this.element = element;
        this._defaults = defaults;

        // Setting options
        this.settings = $.extend({ }, this._defaults, options);
        if (options.selectors) $.extend(this.settings.selectors, this._defaults.selectors, options.selectors);
        if (options.pagination) $.extend(this.settings.pagination, this._defaults.pagination, options.pagination);
        if (options.render) $.extend(this.settings.render, this._defaults.render, options.render);

        this.settings.ajaxMethod = this.settings.ajaxMethod.toUpperCase();
        this.pagedata = {
            search: "",
            start: (isNaN(parseInt(this.settings.page)) ? this._defaults.page : parseInt(this.settings.page)),
            pagelength: (isNaN(parseInt(this.settings.pagelength)) ? this._defaults.pagelength : parseInt(this.settings.pagelength)),
            total: (isNaN(parseInt(this.settings.total)) ? this._defaults.total : parseInt(this.settings.total)),
            sorting: ((this.settings.sorting && this.settings.sorting.field != '') ? this.settings.sorting.field : this._defaults.sorting.field ),
            sortorder: (isNaN(parseInt(this.settings.sorting.order)) ? this._defaults.sorting.order : parseInt(this.settings.sorting.order)),
            refresh: this.settings.refresh
        };
        this._name = arguments.callee.name;
        this.init(this);
    }

    jReportTable.prototype = {
        init: function (context)
        {
            context.pagedata.query = context.settings.query;
            if (context.settings.custom !== undefined) context.pagedata = $.extend({}, context.settings.custom, context.pagedata);

            // Search
            $(context.element).find(context.settings.selectors.search).on('keyup', context, context.rdevents.searchKeyUp);

            // Pagelengh
            context.pagelengthset();

            //Get first from ajax or static
            if ( $.isArray(context.settings.data) && context.settings.data.length > 0)
            {
            	var requestHandler = $.proxy( context.requestHandler, context );
            	requestHandler({data: context.settings.data, records: context.settings.total});
            }
            else
            {
				var requestPage = $.proxy( context.requestPage, context );
                requestPage(1);
            }
        	$(context.element).trigger('load.jReportTable');
        },
    	rdevents:
    	{
    		searchKeyUp: function eventsSearchKeyUp(e)
    		{
    			var context = e.data;
				var fnExecute = $.proxy(  function () {
                        this.pagedata.search = $(this.element).find(this.settings.selectors.search).val();
                        this.requestPage(1);
                    }, context );

                clearTimeout($(this).data("timer"));
                var wait = setTimeout(fnExecute, 500);
                $(this).data("timer", wait);
            },
            clickPage: function eventsClickPage(e)
            {
                e.preventDefault();
    			var context = e.data;
    			var iPage = 1;

                if ($(this).parent().hasClass(context.settings.pagination.nextClass))
                {
                    if (!$(this).parent().hasClass("disabled"))
                    	iPage = context.pagedata.start + 1;
                }
                else if ($(this).parent().hasClass(context.settings.pagination.previousClass))
                {
                    if (!$(this).parent().hasClass("disabled"))
                    	iPage = context.pagedata.start - 1;
                }
                else
                    iPage = parseInt($(this).text());

				var requestPage = $.proxy( context.requestPage, context );
                requestPage(iPage);
            },
            clickHeader: function eventsClickHeader(e)
            {
            	var context = e.data;
                $(context.element).find("th>i").removeClass(context.settings.iconOrderClass).removeClass(context.settings.iconOrderClassDesc)
                if (context.pagedata.sorting == $(this).text())
                    context.pagedata.sortorder = (context.pagedata.sortorder == -1 ? 1 : -1);
                else
                {
                    context.pagedata.sorting = $(this).text();
                    context.pagedata.sortorder = -1;
                }
                if (context.pagedata.sortorder == 1)
                    $(this).find('i').addClass(context.settings.iconOrderClass);
                else
                    $(this).find('i').addClass(context.settings.iconOrderClassDesc);

				var requestPage = $.proxy( context.requestPage, context );
                requestPage(1);
            },
            pageLengthChange:  function eventsClickHeader(e)
            {
                e.preventDefault();
    			var context = e.data;

    			var iPageLength = parseInt($(this).val());
    			if (!isNaN(iPageLength))
    			{
    				context.pagedata.pagelength = iPageLength;
					var requestPage = $.proxy( context.requestPage, context );
	                requestPage(1);
    			}
            }
    	},
        pagelengthset: function ()
        {
        	var $pagelengthset = $(this.element).find(this.settings.selectors.pagelength)
            if ($pagelengthset.length)
            {
            	$pagelengthset.on('change', this, this.rdevents.pageLengthChange);
            	// Cargar set
            	if ($pagelengthset.find('option').length == 0 || ($.isArray(this.settings.pagelengthset) && this.settings.pagelengthset.length > 0))
            	{
            		$pagelengthset.find('option').remove();
            		var i;
            		this.settings.pagelengthset.sort(function(a, b){return a-b});
            		for(i in this.settings.pagelengthset)
            			$pagelengthset.append($('<option value="' + this.settings.pagelengthset[i] + '">' + this.settings.pagelengthset[i] + '</option>'));
            	}

            	// Si no existe en el set => agregar
            	$option = $pagelengthset.find('option[value="' + this.settings.pagelength + '"]');
            	if ($option.length == 0)
            	{
            		$pagelengthset.find('option').each(function(iPos, oOption){
            			if (parseInt(oOption.value) > this.settings.pagelength)
            			{
            				$(oOption).before($('<option value="' + this.settings.pagelength + '" selected="selected">' + this.settings.pagelength + '</option>'));
            				return false;
            			}
            		});
            		// Si no se agregó => agregarlo al final
            		if ($pagelengthset.find('option[value="' + this.settings.pagelength + '"]').length == 0)
            			$pagelengthset.append($('<option value="' + this.settings.pagelength + '" selected="selected">' + this.settings.pagelength + '</option>'));
            	}
            	else
            		$option.attr('selected', 'selected');
            }
        },
        getSettings: function ()
        {
            console.log(this.settings);
            return this.settings;
        },
        requestHandler: function (json, textStatus, jqXHR)
        {
        	$(this.element).trigger('beforeLoadContent.jReportTable');
            //Header
            if ($(this.element).find(this.settings.selectors.columns).children().length == 0)
            {
				var iconSort = '';
                for (var x in json.data[0])
                {
                    if ((this.settings.hideColumn.length > 0 && $.inArray(x, this.settings.hideColumn) === -1) ||
                        (this.settings.showColumn.length > 0 && $.inArray(x, this.settings.showColumn) !== -1) ||
                        (this.settings.hideColumn.length == 0 && this.settings.showColumn.length == 0 ))
                	{
                		console.log(x, this.pagedata.sorting);
                		if (x === this.pagedata.sorting)
                		{
			                if (this.pagedata.sortorder == 1)
			                    iconSort = this.settings.iconOrderClass;
			                else
			                    iconSort = this.settings.iconOrderClassDesc;
                		}
                		else
                			iconSort = '';
                        $(this.element).find(this.settings.selectors.columns).append("<th>" + x + "<i style='position: absolute;color: " + this.settings.iconColor + ";' class='" + iconSort + "'></i></th>");
                	}
                }
                //Sorting
                var ev = this;
                $(this.element).find("th").on('click', this, this.rdevents.clickHeader);

                //No Refresh
                this.pagedata.refresh = false;
            }
			// Data rows
            $(this.element).find(this.settings.selectors.rows).empty(); //borro todo el body
            var $tr = null;
            var $ev = null;
            for (var y = 0; y < json.data.length; y++)
            {
                $tr = $("<tr/>");
                $(this.element).find(this.settings.selectors.rows).append($tr);
                for (var x in json.data[y])
                {
                    if ((this.settings.hideColumn.length > 0 && $.inArray(x, this.settings.hideColumn) === -1) ||
                        (this.settings.showColumn.length > 0 && $.inArray(x, this.settings.showColumn) !== -1) ||
                        (this.settings.hideColumn.length == 0 && this.settings.showColumn.length == 0))
                        $tr.append("<td>" + this.transform(x, json.data[y][x], json.data[y], $tr) + "</td>");
                }
                $ev = jQuery.Event({
                		type: 'trLoaded.jReportTable',
                		currentTarget: $tr.get(0)
                	});
        		$tr.trigger($ev, json.data[y]);
            }
            $tr = null;
            // Pagination and quantity
            this.pagedata.total = json.records;
            $(this.element).find(this.settings.selectors.recordfrom).text(1 + this.pagedata.start * this.pagedata.pagelength - this.pagedata.pagelength);
            if (this.pagedata.total == 0)
            {
                $(this.element).find(this.settings.selectors.recorduntil).text("1");
                $(this.element).find(this.settings.selectors.rows).append($("<tr/>").append("<td colspan='" + ($(this.element).find("th").length+1) + "'>" + this.settings.messageNotFound + "</td>"));
            }
            else if (this.pagedata.start * this.pagedata.pagelength < this.pagedata.total)
                $(this.element).find(this.settings.selectors.recorduntil).text(this.pagedata.start * this.pagedata.pagelength);
            else
                $(this.element).find(this.settings.selectors.recorduntil).text(this.pagedata.total);
            $(this.element).find(this.settings.selectors.recordtotal).text(json.records);
            this.setPages();
        	$(this.element).trigger('afterLoadContent.jReportTable');
        },
        transform: function (key, value, row, tr)
        {
            var ev = this;
            if (value === undefined || value == null)
                return '';
            else if ($.inArray(key, this.settings.rdtypes.money) !== -1)
                return value = "$" + value.toFixed(2);
            else if ($.inArray(key, this.settings.rdtypes.percent) !== -1)
                return value = value.toFixed(2) + "%";
            else
                $(this.element).find("th").each(function () {
                    if ($(this).text() == key && $.inArray($(this).index(), ev.settings.rdtypes.money) !== -1)
                        return value = "$" + value.toFixed(2);
                });

            return this.settings.render.value(key, value, row, tr);
        },
        requestPage: function (nro)
        {
        	this.pagedata.start = nro;
        	var ajaxOptions = {
            		type: this.settings.ajaxMethod,
					url: this.settings.ajaxCall,
					data: this.pagedata,
					context: this,
					success: this.requestHandler,
					error: this.settings.ajaxFailfunction,
					dataType: "json",
					cache: false
				};
        	$(this.element).trigger('requestContent.jReportTable', ajaxOptions);
            $(this.element).find(this.settings.selectors.loading).show();
            $.ajax(ajaxOptions).done($.proxy(this.setPages, this));
        },
        setPages: function()
        {
            var iPages = Math.ceil(this.pagedata.total / this.pagedata.pagelength);
        	var sLinkSelector = this.settings.pagination.item + '.' + this.settings.pagination.itemClass;

            this.redrawPages();

            $(this.element).find(sLinkSelector).removeClass("active");
            $(this.element).find(this.settings.pagination.item + '[data-page="' + this.pagedata.start + '"]').addClass("active");
            $(this.element).find(this.settings.pagination.item + ':not(.active) > ' + this.settings.pagination.link).off('click').on('click', this, this.rdevents.clickPage);
            $(this.element).find(this.settings.selectors.loading).hide();
        },
        setPage: function($newpage, iPage, disabled)
        {
            var $previous = null;
            disabled = (disabled ? true : false);

			$previous = $(this.element).find('.' + this.settings.pagination.previousClass + ', .' +  this.settings.pagination.itemClass).not('.' + this.settings.pagination.nextClass).last();
			$newpage.find(this.settings.pagination.link).text(String(iPage));
			$newpage.attr('data-page', String(iPage));
			if (disabled)
				$newpage.addClass('disabled').find(this.settings.pagination.link).off('click');
			$previous.after($newpage);

			$previous = null;
        },
        redrawPages: function()
        {
            var iPages = Math.ceil(this.pagedata.total / this.pagedata.pagelength);
            var iPagesLeftRight = 5;
            var iStartPage = ( this.pagedata.start > 6 ? this.pagedata.start - iPagesLeftRight : 1);
            var iMaxPage   = ((this.pagedata.start + iPagesLeftRight) < iPages ? (this.pagedata.start + iPagesLeftRight) : iPages );
        	var $link = $(document.createElement(this.settings.pagination.link)).attr('href', '#');
            var $pagination = $(this.element).find(this.settings.pagination.class);
            var $page = $(document.createElement(this.settings.pagination.item));
            var $newpage = null;
            var $previous = null;
            var $next = null;
            var $a = null;

			// Delete old pages
			$pagination.empty();

			if (iPages == 1)
				return true;

			// Previous and Next Links
			$previous = $( document.createElement( this.settings.pagination.item ) );
			$next = $( document.createElement( this.settings.pagination.item ) );
			$a = $(document.createElement( this.settings.pagination.link ) ).attr('href' , '#');

			$previous
				.addClass( this.settings.pagination.previousClass)
				.append( $a.clone().html( this.settings.pagination.previousHTML ) );
            if ( this.pagedata.start > 1)
            	$previous.removeClass("disabled");
            else
            	$previous.addClass("disabled");

			$pagination.append($previous);

			$next
				.addClass( this.settings.pagination.nextClass)
				.append( $a.clone().html( this.settings.pagination.nextHTML )  );
            if (this.pagedata.total == 0 || this.pagedata.start == iPages)
            	$next.addClass("disabled");
            else
            	$next.removeClass("disabled");
			$pagination.append($next);

            $previous = $next = $a = null;

			// Create base page
            $page
            	.addClass(this.settings.pagination.itemClass)
            	.append($link);
			if ( iStartPage != 1 )
			{
				this.setPage($page.clone(), 1);
				this.setPage($page.clone(), '...', true);
			}

			for(var iPage = iStartPage; iPage <= iMaxPage; iPage++)
				this.setPage($page.clone(), iPage);

			if ( iMaxPage != iPages )
			{
				this.setPage($page.clone(), '...', true);
				this.setPage($page.clone(), iPages);
			}

			$page.remove();
			$link.remove();
			$pagination = $page = $newpage = $link = null;
        },
        refresh: function(value)
        {
        	this.settings.refresh = (value ? true : false);
        }
    };

	/*
	 *  jQuery Boilerplate - v3.3.2
	 *  A jump-start for jQuery plugins development.
	 *  http://jqueryboilerplate.com
	 *
	 *  Made by Zeno Rocha
	 *  Under MIT License
	 */

	// Setting as jQuery plugin
    $.fn['jReportTable'] = function (options)
    {
        if (typeof arguments[0] === 'string')
        {
            var methodName = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            var returnVal;
            this.each(function ()
            {
                if ($.data(this, 'plugin_jReportTable') && typeof $.data(this, 'plugin_jReportTable')[methodName] === 'function')
                    returnVal = $.data(this, 'plugin_jReportTable')[methodName].apply(this, args);
                else
                    throw new Error('Method ' + methodName + ' does not exist on jReportTable');
            });

            if (returnVal !== undefined)
                return returnVal;
            else
                return this;
        }
        else if (typeof options === "object" || !options)
        {
            return this.each(function () {
                // Only allow the plugin to be instantiated once.
                if (!$.data(this, 'plugin_jReportTable'))
                    $.data(this, 'plugin_jReportTable', new jReportTable(this, options));
            });
        }
    };
})(jQuery, window, document);