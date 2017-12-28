	// if(navigator.connection.type)
		networkState = navigator.connection.type;
	// else
		// networkState = navigator.connection.effectiveType;
/*
setTimeout(function(){
	if(!window.cordova)
	{
		Connection = {};
		Connection.NONE = "0000";
		// Connection.NONE = "4g";
		setTimeout(function(){
			if(window.localStorage.getItem("udid")==null)
				window.localStorage.setItem("udid","test");
		}, 1500);

		setTimeout(function(){
			if(window.localStorage.getItem("notification_id")==null)
				window.localStorage.setItem("notification_id","test");
		}, 1500);
		device = {};
		device.platform = "iOS";
		//document.querySelector('#myNavigator').pushPage('zaer_service_I_Lost_Something.html', {animation: "none"});
	}
}, 500);
*/

$( document ).ready(function(){





});


function check_net_home_page()
{
	// sessionStorage
	if(check_net(true,false))
	{
		if(window.localStorage.getItem("is_login")==null)
		{
			myApp.popup(".login-screen", true, true);
			convert_persian_digit_to_english();
		}
		else
			login_and_get_data();

	}
}

function check_mobile_number()
{
	if(!check_net(true,false))
		return false;

	var mobile_number = $$('#login_page_mobile').val();


	var mobile_RegExp =  /(\0)?9\d{9}/ ;
	// !jQuery.isNumeric(mobile_number))
	if(mobile_number=="" || !mobile_RegExp.test(mobile_number))
		myApp.alert('لطفا شماره موبایل را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'authwithphonenumber',
				type: "POST",
				headers:
				{
					'Content-Type': 'application/json',
				},
				data: JSON.stringify({ "phone_number":mobile_number }),

				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						myApp.popup(".login-screen-verify-number", true, true);
						window.localStorage.setItem("driver_phone_number",mobile_number);
					}


					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function check_verify_number()
{
	if(!check_net(true,false))
		return false;

	var verify_code = $$('#mobile_verify_code').val();
	if(verify_code=="" || !jQuery.isNumeric(verify_code) || verify_code.length!=5)
		myApp.alert('لطفا کد فعال سازی را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		// myApp.showPreloader('در حال اتصال به سرور');
		$.ajax({
				url: server_url+'confirmphone',
				type: "POST",
				headers:
				{
					'Content-Type': 'application/json',
				},
				data: JSON.stringify
				({
					"phone_number":window.localStorage.getItem("driver_phone_number"),
					"security_code":verify_code,
					"os": device.platform,
					"notification_id": window.localStorage.getItem("notification_id"),
					"device_id":window.localStorage.getItem("udid")
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						window.localStorage.setItem("is_login",1);
						window.localStorage.setItem("auth_token",text.data.auth_token);
						myApp.closeModal(".login-screen", false);
						myApp.closeModal(".login-screen-verify-number", true);
						login_and_get_data();
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function login_and_get_data()
{
	$.ajax({
			url: server_url+'loginwithauthtoken',
			type: "POST",
			headers:
			{
				'Content-Type': 'application/json',
			},
			data: JSON.stringify
			({
				"auth_token":window.localStorage.getItem("auth_token")
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				mainView.router.loadPage('landing.html');
				if(text.success == true)
				{
					window.sessionStorage.setItem("access_token",text.data.access_token);
					window.localStorage.setItem("app_data",JSON.stringify(text.data));
					mainView.router.loadPage('landing.html');
					$$('#sidebar-driver-name').text(text.data.name);
					$$('#sidebar-driver-car').text(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
					$$("#sidebar-driver-profile-pic").attr("src",text.data.profile_pic_url);
				}
				else
				{
					myApp.popup(".login-screen", true, true);
					convert_persian_digit_to_english();
				}
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});



}

function check_net(show_alert,do_loop)
{
	// console.log(networkState);
	if (networkState == Connection.NONE) {
		if(show_alert)
		{
			if(do_loop)
				window.sessionStorage.setItem("do_loop","1");
			else
				window.sessionStorage.setItem("do_loop","0");

			myApp.alert('شما برای استفاده از این برنامه نیاز به اینترنت دارید','توجه', function () {
				if(window.sessionStorage.getItem("do_loop")=="1")
				{
					window.sessionStorage.removeItem("do_loop");
					check_net(true,true);
				}
			});
		}
		return false;
	}
	return true;
}

function resend_verify_number()
{
	$$('#login_page_mobile').val("");
	myApp.closeModal(".login-screen-verify-number", true);
}

function init_virtual_list_of_invoices()
{
	myApp.showIndicator();
	$.ajax({
			url: server_url+'getinvoicehistory',
			type: "POST",
			headers:
			{
				'Content-Type': 'application/json',
				'access-token': window.sessionStorage.getItem('access_token')
			},
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						var d = new Date(arr[i].time);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						var time = d2.format('HH') + ':' + d2.format('mm');
						var state = 0;
						var dstate = arr[i]['state'];
						data.push
						({
							title: arr[i].provider_name,
							status: arr[i].state,
							id: arr[i].id,
							date: date,
							time: time,
							price: arr[i].driver_share
						});

						myApp.virtualList('#tab4 .list-block.virtual-list',
				 	 	{
					 		items:data,
					 		// Template 7 template to render each item
							template: '<li class="item-content s{{status}}">' +
											'<div class="item-id">{{id}}</div>' +
											'<div class="item-title">{{title}}</div>' +
											'<div class="item-price s{{status}}">{{price}} ریال</div>' +
											'<div class="item-date">{{date}}</div>' +
											'<div class="item-time">{{time}}</div>' +
										'</li>',
							searchAll: function (query, items) {
								var foundItems = [];
								for (var i = 0; i < items.length; i++) {
									// Check if title contains query string
									if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
								}
								// Return array with indexes of matched items
								return foundItems;
							},
				 		});

					}
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});

	/*var myList = myApp.virtualList('#tab4 .list-block.virtual-list', {
					items: [
						{
							title: 'سرزمین موج های خروشان',
							status: '1',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '2',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '3',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '4',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '1',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '2',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '3',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
						{
							title: 'سرزمین موج های خروشان',
							status: '4',
							id: '1234567',
							date: '26 آذر',
							time: '22:30',
							price: '7500',
						},
					],
					// Template 7 template to render each item

	});*/
}

function init_virtual_list_of_notifications()
{
	myApp.showIndicator();
	$.ajax({
			url: server_url+'getnotifications',
			type: "POST",
			headers:
			{
				'Content-Type': 'application/json',
				'access-token': window.sessionStorage.getItem('access_token')
			},
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						var d = new Date(arr[i].created_at);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						var time = d2.format('HH') + ':' + d2.format('mm');
						data.push
						({
							text: arr[i].message,
							status: (arr[i].type=='private')?'0':'1',
							date: date,
							time: time,
						});

						myApp.virtualList('#tab3 .list-block.virtual-list',
				 	 	{
					 		items:data,
					 		// Template 7 template to render each item
					 		template: '<li class="item-content s{{status}}">' +
					 						'<div class="item-status-icon s{{status}}"></div>' +
					 						'<div class="item-text">{{text}}</div>' +
					 						'<div class="item-date">{{date}} - {{time}}</div>' +
					 					'</li>'
				 		});

					}
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});

}
function init_virtual_list_of_payments()
{
  myApp.showIndicator();
  function numberWithCommas(x)
	{
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	var data = JSON.parse(window.localStorage.getItem('app_data'));
	var ballace = numberWithCommas(data.ballance) + ' ریال'
	var payable = numberWithCommas(data.payable) + ' ریال'

	$$("#payment_info").html('<div class="paymentable green_text"><div class="paymentable_title"><i class="fa fa-check" aria-hidden="true"></i>  قابل پرداخت</div><div class="paymentable_value">'+payable+'</div></div>' +
							 '<div class="paymentable"><div class="paymentable_title"><i class="fa fa-money" aria-hidden="true"></i>  موجودی</div><div class="paymentable_value">'+ballace+'</div></div>' +
							 '<div class="account_number">شماره شبا : '+data.iban+'</div>' +
							 '<div class="account_name">به نام '+data.name+'</div>' +
							'');
	$.ajax({
			url: server_url+'getpaymentshistory',
			type: "POST",
			headers:
			{
				'Content-Type': 'application/json',
				'access-token': window.sessionStorage.getItem('access_token')
			},
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{

					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						var d = new Date(arr[i].timestamp);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						data.push
						({
							price: numberWithCommas(arr[i].value),
							date: date
						});
					}
					myApp.virtualList('#tab1 .list-block.virtual-list',
					{
						items:data,
						// Template 7 template to render each item
						template: '<li class="item-content">' +
										'<div class="item-price"><i class="fa fa-check" aria-hidden="true"></i> {{price}} ریال واریز شد.</div>' +
										'<div class="item-date">{{date}}</div>' +
									'</li>',
					});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}

function init_virtual_list_of_locations(cat_id)
{
  var data = JSON.parse(window.localStorage.getItem('app_data'));
	var providers = data.providers;
	function filter_func(obj)
	{
		return obj.category_id == cat_id;
	}
	providers = providers.filter(filter_func);
	data = [];
	for(var i =0;i<providers.length;i++)
	{
		data.push({title:providers[i].name,id:providers[i].id})
	}
	var myList = myApp.virtualList('.location_lists .list-block.virtual-list', {
					items:data,
					// Template 7 template to render each item
					template: '<li class="item-content">' +
									'<div class="item-title" onclick="window.localStorage.setItem(\'location_id\',\'{{id}}\');mainView.router.loadPage(\'location_view.html\');">{{title}}</div>' +
								'</li>',
					searchAll: function (query, items) {
						var foundItems = [];
						for (var i = 0; i < items.length; i++) {
							// Check if title contains query string
							if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
						}
						// Return array with indexes of matched items
						return foundItems;
					},
	});
}

function location_view(location_id)
{
	var data = JSON.parse(window.localStorage.getItem('app_data'));
	var providers = data.providers;
	function filter_func(obj)
	{
		return obj.id == location_id;
	}
	var provider = providers.filter(filter_func)[0];
	console.log(provider);

	function mins_to_readable_time(mins)
	{
		mins = parseInt(mins);
		var h = Math.floor(mins/60);
		var m = (mins%60);
		return ((h<10)?'0':'')+h.toString()+':'+((m<10)?'0':'')+m.toString();
	}

	$$('#location-name').text(provider.name);
	$$('#daily-on-time').text(mins_to_readable_time(provider.daily_on_time));
	$$('#daily-off-time').text(mins_to_readable_time(provider.daily_off_time));
	$$('#location-description').html(provider.description);
	if(provider.priceMode=='free')
	{
		$$('#entry_form_2').css('display','none');
		var s = Math.floor(provider.driver_share*100).toString();
		$$('#price-mode-details').text(s + ' درصد از خرید مشتری');
	}
	else
	{
		$$('#entry_form_1').css('display','none');
		var s = Math.floor(provider.driver_share).toString();
		$$('#price-mode-details').text(s + ' ریال به ازای هر نفر');
	}





	convert_persian_digit_to_english();
}
function issueDiscountCode()
{
	var mobile_number = $$('#passenger_phone_number').val();
	var mobile_RegExp =  /(\0)?9\d{9}/ ;

	if(mobile_number=="" || !mobile_RegExp.test(mobile_number))
		myApp.alert('لطفا شماره موبایل را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'issuediscountcode',
				type: "POST",
				headers:
				{
					'Content-Type': 'application/json',
					'access-token': window.sessionStorage.getItem('access_token')
				},
				data: JSON.stringify
				({
					"client_phone_number":mobile_number,
					"provider_id":window.localStorage.getItem('location_id'),
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						myApp.alert('کد تخفیف برای مشتری ارسال شد.','توجه', function () {});
						$$('#passenger_phone_number').val('');
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}

}
function submitarrival()
{
	var data = JSON.parse(window.localStorage.getItem('app_data'));
	var providers = data.providers;
	function filter_func(obj)
	{
		return obj.id == window.localStorage.getItem('location_id');
	}
	var provider = providers.filter(filter_func)[0];

	var rad = function(x)
	{
	  return x * Math.PI / 180;
	};

	var getDistance = function(p1, p2)
	{
	  var R = 6378137; // Earth’s mean radius in meter
	  var dLat = rad(p2.lat - p1.lat);
	  var dLong = rad(p2.lng - p1.lng);
	  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
	    Math.sin(dLong / 2) * Math.sin(dLong / 2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	  var d = R * c;
	  return d; // returns the distance in meter
	};
	//check last location record
	if(window.localStorage.getItem('driver_location'))
	{
		var loc = JSON.parse(window.localStorage.getItem('driver_location'));
		var current_timestamp = new Date().getTime();
		if(current_timestamp-loc<3*30)//if location record is newer than 3 mins_to_readable_time
		{
			if(getDistance({lat:provider.lat,lng:provider.lng},{lat:loc.lat,lng:loc.lng})>2000)//if driver is further than 2 km
			{
					myApp.alert('شما در محدوده ی محل مورد نظر نیستید.','توجه', function () {});
					return;
			}
		}
	}
	var val = $$('#person_count').val();
	myApp.showIndicator();
	$.ajax({
			url: server_url+'submitarrival',
			type: "POST",
			headers:
			{
				'Content-Type': 'application/json',
				'access-token': window.sessionStorage.getItem('access_token')
			},
			data: JSON.stringify
			({
				"number_of_persons":val,
				"provider_id":window.localStorage.getItem('location_id'),
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					myApp.alert('اعلام شما ذخیره شد.','توجه', function () {});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});

}

function navigateToLocation()
{
	var data = JSON.parse(window.localStorage.getItem('app_data'));
	var providers = data.providers;
	function filter_func(obj)
	{
		return obj.id == window.localStorage.getItem('location_id');
	}
	var provider = providers.filter(filter_func)[0];
	var url = 'https://www.google.com/maps/dir/Current+Location/'+provider.lat.toString()+','+provider.lng.toString();
	window.open(url, '_system', 'location=yes');
}
