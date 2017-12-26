// setTimeout(function(){
	if(navigator.connection.type)
		networkState = navigator.connection.type;
	else
		networkState = navigator.connection.effectiveType;
	
	if(!window.cordova)
	{
		Connection = {};
		Connection.NONE = "0000";
		// Connection.NONE = "4g";
		setTimeout(function(){
			if(window.localStorage.getItem("udid")==null)
				window.localStorage.setItem("udid","test");
		}, 1500);
		device = {};
		device.platform = "iOS";
		//document.querySelector('#myNavigator').pushPage('zaer_service_I_Lost_Something.html', {animation: "none"});
	}
// }, 500);


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
			mainView.router.loadPage('landing.html');
	}
}

function check_mobile_number()
{
	if(!check_net(true,false))
		return false;
	
	var mobile_number = $$('#login_page_mobile').val();
	
	
	var mobile_RegExp =  /(\+98|0|0098)?9\d{9}/ ;
	// !jQuery.isNumeric(mobile_number))
	if(mobile_number=="" || !mobile_RegExp.test(mobile_number))
		myApp.alert('لطفا شماره موبایل را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url,
				type: "POST",
				data: {
					act: "login_user",
					mobile: mobile_number,
				},
				success : function(text)
				{
					myApp.hideIndicator();
					if(text=="1")
						myApp.popup(".login-screen-verify-number", true, true);
					else
						myApp.alert('سرور پاسخگو نمی باشد ، لطفا دقایقی دیگر مجددا اقدام کنید.','توجه', function () {});
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
	if(verify_code=="" || !jQuery.isNumeric(verify_code) || verify_code.length!=4)
		myApp.alert('لطفا کد فعال سازی را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		// myApp.showPreloader('در حال اتصال به سرور');
		$.ajax({
				url: server_url,
				type: "POST",
				data: {
					act:  "login_user",
					code: verify_code,
					udid: window.localStorage.getItem("udid"),
					nid:  window.localStorage.getItem("notification_id"),
					os:   device.platform,
				},
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text=="1")
					{
						window.localStorage.setItem("is_login",1);
						window.localStorage.setItem("token","sample_token");
						myApp.closeModal(".login-screen", false);
						myApp.closeModal(".login-screen-verify-number", true);
						mainView.router.loadPage('landing.html');
					}
					else if(text=="2")
						myApp.alert('کد وارد شده صحیح نمی باشد ، لطفا مجددا تلاش کنید.','توجه', function () {});
					else
						myApp.alert('سرور پاسخگو نمی باشد ، لطفا دقایقی دیگر مجددا اقدام کنید.','توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
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
    setTimeout(function () {
        myApp.hideIndicator();
    }, 2000);
	
	var myList = myApp.virtualList('#tab4 .list-block.virtual-list', {
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

function init_virtual_list_of_notifications()
{
    myApp.showIndicator();
    setTimeout(function () {
        myApp.hideIndicator();
    }, 2000);
	
	var myList = myApp.virtualList('#tab3 .list-block.virtual-list', {
					items: [
						{
							title: 'زمانبندی تسویه',
							text: 'از هفته آتی تمام کدهای تخفیف یک هفته یکبار تسویه می شود.',
							status: '0',
							date: '26 آذر',
							time: '22:30',
						},
						{
							title: 'تسویه انجام شد',
							text: 'تسویه آبان ماه شما به مبلغ 25،000 انجام شد.',
							status: '1',
							date: '26 آذر',
							time: '22:30',
						},
						{
							title: 'تسویه انجام شد',
							text: 'تسویه آبان ماه شما به مبلغ 25،000 انجام شد.',
							status: '0',
							date: '26 آذر',
							time: '22:30',
						},
						{
							title: '',
							text: 'تسویه آبان ماه شما به مبلغ 25،000 انجام شد.',
							status: '1',
							date: '26 آذر',
							time: '22:30',
						},
						{
							title: 'تسویه آبان ماه شما به مبلغ 25،000 انجام شد.',
							text: '',
							status: '1',
							date: '26 آذر',
							time: '22:30',
						},
					],
					// Template 7 template to render each item
					template: '<li class="item-content s{{status}}">' +
									'<div class="item-status-icon s{{status}}"></div>' +
									'<div class="item-title">{{title}}</div>' +
									'<div class="item-text">{{text}}</div>' +
									'<div class="item-date">{{date}} - {{time}}</div>' +
								'</li>',
	});
}
function init_virtual_list_of_payments()
{
    myApp.showIndicator();
    setTimeout(function () {
        myApp.hideIndicator();
    }, 2000);
	
	$$("#payment_info").html('<div class="paymentable green_text"><div class="paymentable_title"><i class="fa fa-check" aria-hidden="true"></i>  قابل پرداخت</div><div class="paymentable_value">1،000،000 ریال</div></div>' + 
							 '<div class="paymentable"><div class="paymentable_title"><i class="fa fa-money" aria-hidden="true"></i>  موجودی</div><div class="paymentable_value">1،000،000 ریال</div></div>' + 
							 '<div class="account_number">شماره شبا : IR120550180280003280150001</div>' + 
							 '<div class="account_name">به نام سید علیرضا فلاحی</div>' + 
							'');
	
	var myList = myApp.virtualList('#tab1 .list-block.virtual-list', {
					items: [
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
						{
							price: '7،500',
							date: '26 آذر',
						},
					],
					// Template 7 template to render each item
					template: '<li class="item-content">' +
									'<div class="item-price"><i class="fa fa-check" aria-hidden="true"></i> {{price}} ریال واریز شد.</div>' +
									'<div class="item-date">{{date}}</div>' +
								'</li>',
	});
}

function init_virtual_list_of_locations(cat_id)
{
	console.log(cat_id);
	
    myApp.showIndicator();
    setTimeout(function () {
        myApp.hideIndicator();
    }, 2000);
	
	var myList = myApp.virtualList('.location_lists .list-block.virtual-list', {
					items: [
						{
							title: 'موج های خروشان',
							id: '1',
						},
						{
							title: 'موج های آبی',
							id: '2',
						},
						{
							title: 'پینت بال سرافرازان',
							id: '3',
						},
						{
							title: 'موج های خروشان',
							id: '1',
						},
						{
							title: 'موج های آبی',
							id: '2',
						},
						{
							title: 'پینت بال سرافرازان',
							id: '3',
						},
						{
							title: 'موج های خروشان',
							id: '1',
						},
						{
							title: 'موج های آبی',
							id: '2',
						},
						{
							title: 'پینت بال سرافرازان',
							id: '3',
						},
						{
							title: 'موج های خروشان',
							id: '1',
						},
						{
							title: 'موج های آبی',
							id: '2',
						},
						{
							title: 'پینت بال سرافرازان',
							id: '3',
						},
					],
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
	console.log(location_id);
	
    myApp.showIndicator();
    setTimeout(function () {
        myApp.hideIndicator();
    }, 500);
	
	
	convert_persian_digit_to_english();
}







