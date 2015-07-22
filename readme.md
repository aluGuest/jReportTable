var preload = [
	{"Name": "Airi Satou", "Position": "Accountant", "Office": "Tokyo", "Age": "33", "Start date": "2008/11/28", "Salary": "$162,700"},
	{"Name": "Angelica Ramos", "Position": "Chief Executive Officer (CEO)", "Office": "London", "Age": "47", "Start date": "2009/10/09", "Salary": "$1,200,000"},
	{"Name": "Ashton Cox", "Position": "Junior Technical Author", "Office": "San Francisco", "Age": "66", "Start date": "2009/01/12", "Salary": "$86,000"},
	{"Name": "Bradley Greer", "Position": "Software Engineer", "Office": "London", "Age": "41", "Start date": "2012/10/13", "Salary": "$132,000"},
	{"Name": "Brenden Wagner", "Position": "Software Engineer", "Office": "San Francisco", "Age": "28", "Start date": "2011/06/07", "Salary": "$206,850"},
	{"Name": "Brielle Williamson", "Position": "Integration Specialist", "Office": "New York", "Age": "61", "Start date": "2012/12/02", "Salary": "$372,000"},
	{"Name": "Bruno Nash", "Position": "Software Engineer", "Office": "London", "Age": "38", "Start date": "2011/05/03", "Salary": "$163,500"},
	{"Name": "Caesar Vance", "Position": "Pre-Sales Support", "Office": "New York", "Age": "21", "Start date": "2011/12/12", "Salary": "$106,450"},
	{"Name": "Cara Stevens", "Position": "Sales Assistant", "Office": "New York", "Age": "46", "Start date": "2011/12/06", "Salary": "$145,600"},
	{"Name": "Cedric Kelly", "Position": "Senior Javascript Developer", "Office": "Edinburgh", "Age": "22", "Start date": "2012/03/29", "Salary": "$433,060"}
];
var ojReportTable = {
	        ajaxCall: 'example1.php', // Optional. Default URL is
	        // query: '', // Optional. You get this field in the request always (or empty if not is set)
	        // custom: '', // Optional. you get this field in the request (if is set)
	        data: preload, // Optional. An array with preload information
	        total: 50, // Optional: Required if "data" field is provided
	        pagelengthset: [5, 10, 25], // Optional, the select object is filled with this values in order to change pagelength value
	        pagelength: 10, // Optional (10 is default)
	        page: 1, // current page
	        iconOrderClass: 'fa fa-long-arrow-up', // Optional sort icon UP
	        iconOrderClassDesc: 'fa fa-long-arrow-down', // Optional sort icon DOWN
	        // Optional pagination information (the values here are the defuault ones )
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
	        // Optional selectors (the values here are the defuault ones )
	        selectors: {
	        	search: '.r-search',
	        	columns: '.r-columns',
	        	rows: '.r-rows',
	        	recordfrom: '.r-from',
	        	recorduntil: '.r-until',
	        	recordtotal: '.r-total',
	        	loading: '.r-loading'
	        }
        };

$('#myContainer').jReportTable(ojReportTable);
