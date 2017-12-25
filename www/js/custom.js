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
					act: "login_user",
					code: verify_code,
					udid: window.localStorage.getItem("udid"),
					os: device.platform,
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
	console.log(networkState);
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
