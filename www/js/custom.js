var client_version = 0.91;
/*// setTimeout(function(){
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

 setTimeout(function(){
 if(window.localStorage.getItem("notification_id")==null)
 window.localStorage.setItem("notification_id","test");
 }, 1500);
 device = {};
 device.platform = "iOS";
 //document.querySelector('#myNavigator').pushPage('zaer_service_I_Lost_Something.html', {animation: "none"});
 }
 // }, 500);*/


$( document ).ready(function(){
});
function check_net_home_page()
{
    alert('login');
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
    if(verify_code == "" || !jQuery.isNumeric(verify_code) || verify_code.length!=5)
        myApp.alert('لطفا کد فعال سازی را با دقت وارد نمایید','توجه', function () {});
    else
    {
        myApp.showIndicator();
        // myApp.showPreloader('در حال اتصال به سرور');
        $.ajax({
            url: server_url+'confirmphone',
            type: "POST",
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
                    //  window.localStorage.setItem("phone_number",driver_phone_number);
                    myApp.closeModal(".login-screen", false);
                    myApp.closeModal(".login-screen-verify-number", true);
                    if(text.data.name == '' || text.data.last_name == '' )
                        myApp.popup(".register-popup", true, true);
                    else
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
        data: JSON.stringify
        ({
            "auth_token":window.localStorage.getItem("auth_token"),
            "client_version":client_version,
            "os":device.platform
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
                if(text.data.car_type== '' || text.data.license_plate =='' )
                {
                    $$('#sidebar-driver-complate-profile').text(text.data.name);
                }
            }
            else
            {
                var error = text.error;
                if(error=="app_not_updated")
                {
                    $$('#force-update-message').text(text.data.message);
                    myApp.popup(".force-update-popup", true, true);
                    window.sessionStorage.setItem('update_url',text.data.update_url);
                }
                if(error=="user_banned" || error == "registration_not_verified")
                {
                    $$('#popup-message-text').text(text.data);
                    myApp.popup(".message-popup", true, true);
                }
                else
                {
                    myApp.popup(".login-screen", true, true);
                    convert_persian_digit_to_english();
                }

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
    alert('check net');
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

function init_virtual_list_of_invoices()
{
    myApp.showIndicator();
    $.ajax({
        url: server_url+'getinvoicehistory',
        type: "POST",
        data: JSON.stringify
        ({
            'access-token': window.sessionStorage.getItem('access_token')
        }),
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
                }
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
            else
                myApp.alert(text.data,'توجه', function () {});
        },
        error: function(jqXHR, exception) {
            myApp.hideIndicator();
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
        },
    });
}

function init_virtual_list_of_notifications()
{
    myApp.showIndicator();
    $.ajax({
        url: server_url+'getnotifications',
        type: "POST",
        data: JSON.stringify
        ({
            'access-token': window.sessionStorage.getItem('access_token')
        }),
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
        data: JSON.stringify
        ({
            'access-token': window.sessionStorage.getItem('access_token')
        }),
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
        console.log(providers[i].manual_offline_since);
        var active = true;
        if(providers[i].manual_offline_since!=null && new Date(providers[i].manual_offline_since)< new Date())
            active = false;
        data.push({title:providers[i].name,id:providers[i].id,active:active})
    }
    var myList = myApp.virtualList('.location_lists .list-block.virtual-list', {
        items:data,
        // Template 7 template to render each item
        template: '<li class="item-content {{#if active}}{{else}}disabled{{/if}}">' +
        '<div class="item-title" {{#if active}}onclick="window.localStorage.setItem(\'location_id\',\'{{id}}\');mainView.router.loadPage(\'location_view.html\');"{{/if}}>{{title}}{{#unless active}}<span class="pull-left">خارج از سرویس</span>{{/unless}}</div>' +
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
    if(provider.require_passenger_number==false)
        $$('input#passenger_phone_number').css('display','none');
    $$('#location-name').text(provider.name);
    $$('#daily-on-time').text(mins_to_readable_time(provider.daily_on_time));
    $$('#daily-off-time').text(mins_to_readable_time(provider.daily_off_time));
    $$('#location-description').html(provider.description);
    if(provider.priceMode=='free')
    {
        $$('#btn-submit-arrival').css('display','none');
        var s = Math.floor(provider.driver_share*100).toString();
        $$('#price-mode-details').text(s + ' درصد از خرید مشتری');
    }
    else
    {
        $$('#btn-issue-code').css('display','none');
        var s = Math.floor(provider.driver_share).toString();
        $$('#price-mode-details').text(s + ' ریال به ازای هر '+provider.per_person_mode_unit_name);

        $$('.passenger_count_option').each(function(index, element)
        {
            $$(this).text($$(this).text().replace("نفر", provider.per_person_mode_unit_name));
        });
    }





    convert_persian_digit_to_english();
}
function issueDiscountCode()
{
    var data = JSON.parse(window.localStorage.getItem('app_data'));
    var providers = data.providers;

    function filter_func(obj)
    {
        return obj.id == window.localStorage.getItem('location_id');
    }
    var provider = providers.filter(filter_func)[0];

    var mobile_number = $$('#passenger_phone_number').val();
    var mobile_RegExp =  /(\0)?9\d{9}/ ;

    if(provider.require_passenger_number && (mobile_number=="" || !mobile_RegExp.test(mobile_number)))
        myApp.alert('لطفا شماره موبایل را با دقت وارد نمایید','توجه', function () {});
    else
    {
        var _ddata =
            {
                "passenger_count":$$('#person_count').val(),
                "provider_id":window.localStorage.getItem('location_id'),
                'access-token': window.sessionStorage.getItem('access_token')
            };
        if(provider.require_passenger_number)
            _ddata["client_phone_number"] = mobile_number;

        myApp.showIndicator();
        $.ajax({
            url: server_url+'issuediscountcode',
            type: "POST",
            data: JSON.stringify(_ddata),
            //async: true,
            success : function(text)
            {
                myApp.hideIndicator();
                if(text.success == true)
                {
                    if(provider.require_passenger_number)
                        myApp.alert('کد تخفیف برای مشتری ارسال شد.','توجه', function () {});
                    else
                        myApp.alert('اعلام شما ثبت شد.','توجه', function () {});


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
        var current_timestamp = (new Date().getTime()/1000);
        console.log((current_timestamp-loc.time)/60);
        if(current_timestamp-loc.time<10*60)//if location record is newer than 3 mins_to_readable_time
        {
            if(getDistance({lat:provider.lat,lng:provider.lng},{lat:loc.lat,lng:loc.lng})>2000)//if driver is further than 2 km
            {
                myApp.alert('شما در محدوده ی محل مورد نظر نیستید.','توجه', function () {});
                return;
            }
        }
    }
    var val = $$('#person_count').val();
    var _ddata =
        {
            "number_of_persons":val,
            "provider_id":window.localStorage.getItem('location_id'),
            'access-token': window.sessionStorage.getItem('access_token'),
        };
    if(provider.require_passenger_number)
    {
        _ddata["passenger_phone_number"] = $$("#passenger_phone_number").val()

    }
    myApp.showIndicator();
    $.ajax({
        url: server_url+'submitarrival',
        type: "POST",
        data: JSON.stringify(_ddata),
        //async: true,
        success : function(text)
        {
            myApp.hideIndicator();
            if(text.success == true)
            {
                myApp.alert('اعلام شما ذخیره شد.','توجه', function () {});
                $$("#passenger_phone_number").val('');
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
    if(window.localStorage.getItem('driver_location'))
    {
        var loc = JSON.parse(window.localStorage.getItem('driver_location'));
        var data = JSON.parse(window.localStorage.getItem('app_data'));
        var providers = data.providers;
        function filter_func(obj)
        {
            return obj.id == window.localStorage.getItem('location_id');
        }
        var provider = providers.filter(filter_func)[0];
        var url = 'https://maps.google.com/?saddr='+loc.lat.toString()+','+loc.lng.toString()+'&daddr='+provider.lat.toString()+','+provider.lng.toString();
        window.open(url, '_system', 'location=yes');
    }
    else
    {
        myApp.alert('برنامه از موقعیت مکانی شما مطلع نیست، لطفا تنظیمات موقعیت یاب خود را بررسی کنید.','توجه', function () {});
    }

}
function send_support_message()
{
    var val = $$("#support_message_text").val();
    myApp.showIndicator();
    $.ajax({
        url: server_url+'send_support_message',
        type: "POST",
        data: JSON.stringify
        ({
            'text':val,
            'access-token': window.sessionStorage.getItem('access_token')
        }),
        //async: true,
        success : function(text)
        {
            myApp.hideIndicator();
            if(text.success == true)
            {
                myApp.alert(text.data,'توجه', function () {});
                $$("#support_message_text").val('');
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
function show_register_popup()
{
    myApp.popup(".register-popup", true, true);
    convert_persian_digit_to_english();

}
function do_register()
{
    var name = $$('#register_name').val();
    var last_name = $$('#register_last_name').val();
    var register_sex = $("input[name='register_sex']:checked").val();
    myApp.showIndicator();
    $.ajax({
        url: server_url+'register',
        type: "POST",
        data: JSON.stringify
        ({
            'last_name': last_name,
            'name':name,
            'phone_number': window.localStorage.getItem("driver_phone_number"),
            'register_sex': register_sex
        }),
        success : function(text)
        {
            myApp.hideIndicator();
            myApp.alert(text.data,'توجه', function () {});
            if(text.success == true)
            {
                myApp.closeModal(".register-popup", true);
                // myApp.popup(".login-screen-verify-number", true, true);
                window.localStorage.setItem("driver_phone_number",mobile_number);
                login_and_get_data();
            }
        },
        error: function(jqXHR, exception) {
            myApp.hideIndicator();
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
        },
    });

}

function goToUpdate()
{
    window.open(window.sessionStorage.getItem('update_url'),'_system');
}


function showProfile()
{
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    if(app_data['name'] == '' || app_data['last_name'] == '' )
        myApp.popup(".register-popup", true, true);
    if(app_data['bank_name'] =='' || app_data['national_code']== '' || app_data['iban'] == '')
    {
        myApp.hideIndicator();
        mainView.router.loadPage('updateProfile.html');
    }
    if(app_data['license_plate'] != '' || app_data['car_type'] != '' || app_data['car_color'] != '')
    {
        myApp.hideIndicator();
        /* $$('#sidebar-driver-profile-name').text(app_data['name']);
         $$('#sidebar-driver-profile-lastname').text(app_data['last_name']);
         $$('#sidebar-driver-phone-number').text(app_data['phone_number']);
         $$('#sidebar-driver-national-code').text(app_data['national_code']);
         $$('#sidebar-driver-iban-number').val(app_data['iban']);
         $$('#sidebar-driver-bank-name').text(app_data['bank_name']);
         $$('#car_type').val(app_data['car_type'] );
         $$('#car_color').val(app_data['car_color'] );
         $$('#license_plate').val(app_data['license_plate']);
         $$("#sidebar-driver-profile-img").attr("src", app_data['profile_pic_url']);*/

        mainView.router.loadPage('final_profile.html');
    }
    else
    {
        $.ajax({
            url: server_url+'showprofile',
            type: "POST",
            data: JSON.stringify
            ({
                'access_token': window.sessionStorage.getItem('access_token'),
            }),
            //async: true,
            success : function(text)
            {
                myApp.hideIndicator();
                mainView.router.loadPage('profile.html');
                if(text.success == true)
                {
                    window.sessionStorage.setItem("access_token",text.data.access_token);
                    window.localStorage.setItem("app_data",JSON.stringify(text.data));
                    // mainView.router.loadPage(template_profile);
                    //  mainView.router.loadPage('profile.html');
                    //  mainView.router.load({content: text,});
                    //myApp.popup(".profile-popup", true, true);

                    $$('#sidebar-driver-profile-name').text(text.data.name);
                    $$('#sidebar-driver-phone-number').text(text.data.phone_number);
                    $$('#sidebar-driver-national-code').text(text.data.national_code);
                    //$$('#sidebar-driver-iban-number').text(text.data.iban);
                    $$('#sidebar-driver-iban-number').val(text.data.iban);
                    $$('#sidebar-driver-bank-name').text(text.data.bank_name);
                    $$('#sidebar-driver-profile-car').text(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
                    $$("#sidebar-driver-profile-img").attr("src", text.data.profile_pic_url);
                    // $$("#sidebar-driver-profile-qrcode_img").text(text.data.qrcode_img);
                    $$("#sidebar-driver-profile-qrcode_img").attr("src", text.data.qrcode_img);

                }
                else
                {
                    var error = text.error;
                    if(error=="app_not_updated")
                    {
                        $$('#force-update-message').text(text.data.message);
                        myApp.popup(".force-update-popup", true, true);
                        window.sessionStorage.setItem('update_url',text.data.update_url);
                    }
                    if(error=="user_banned" || error == "registration_not_verified")
                    {
                        $$('#popup-message-text').text(text.data);
                        myApp.popup(".message-popup", true, true);
                    }
                    else
                    {
                        myApp.popup(".login-screen", true, true);
                        convert_persian_digit_to_english();
                    }

                }
            },
            error: function(jqXHR, exception) {
                myApp.hideIndicator();
                myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
            },
        });

    }

}

function do_update_profile()
{
    event.preventDefault();

    // Grab the file from the input.
    //var insurance = $$( '#insurance' )[0].files[0];
    var avatar = $$( '#avatar' )[0].files[0];
    var state = $$( '.state_list' ).val();
    var city = $$( '.city_list' ).val();
    var bank = $$( '.bank_list' ).val();
    var iban = $$( '#sidebar-driver-iban-number' ).val();
    var national_id = $$( '#register_national_id' ).val();

    //var Certificates = $$( '#Certificates' )[0].files[0];
    var formData = new FormData();
    var	access_token= window.sessionStorage.getItem('access_token');
    //formData.append( 'insurance', insurance );
    formData.append( 'avatar', avatar );
    //formData.append( 'Certificates', Certificates );
    formData.append( 'access_token', access_token );
    formData.append( 'state', state );
    formData.append( 'city', city );
    formData.append( 'bank', bank );
    formData.append( 'iban', iban );
    formData.append( 'national_id', national_id );
    myApp.showIndicator();
    // Fire the request.
    jQuery.ajax( {
        url: server_url+'updateprofile',
        method: 'POST',
        processData: false,
        contentType: false,
        beforeSend: function ( xhr ) {
            xhr.setRequestHeader( 'X-WP-Nonce',server_url+'updateprofile' );
        },
        data: formData
    } ).success( function ( response ) {
        myApp.hideIndicator();
        myApp.alert(response.data,'توجه', function () {});
        if(response.success == true)
        {

            $$('#popup-message-text').text(response.data);
            //   myApp.popup(".message-popup", true, true);
        } }).error( function( response ) {
        myApp.hideIndicator();
        if(response.success == false)
        {
            $$('#popup-message-text').text(response.data);
            //   myApp.popup(".message-popup", true, true);
        }
        else
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
    });

}

function showTaxiPardaz()
{
    $.ajax({
        url: server_url+'showprofile',
        type: "POST",
        data: JSON.stringify
        ({
            'access_token': window.sessionStorage.getItem('access_token'),
        }),
        //async: true,
        success : function(text)
        {
            myApp.hideIndicator();
            mainView.router.loadPage('taxi_pardaz.html');
            if(text.success == true)
            {
                window.sessionStorage.setItem("access_token",text.data.access_token);
                window.localStorage.setItem("app_data",JSON.stringify(text.data));
                $$("#sidebar-driver-profile-qrcode").attr("src",text.data.qrcode_img);
            }
            else
            {
                var error = text.error;
                if(error=="app_not_updated")
                {
                    $$('#force-update-message').text(text.data.message);
                    myApp.popup(".force-update-popup", true, true);
                    window.sessionStorage.setItem('update_url',text.data.update_url);
                }
                if(error=="user_banned" || error == "registration_not_verified")
                {
                    $$('#popup-message-text').text(text.data);
                    myApp.popup(".message-popup", true, true);
                }
                else
                {
                    myApp.popup(".login-screen", true, true);
                    convert_persian_digit_to_english();
                }

            }
        },
        error: function(jqXHR, exception) {
            myApp.hideIndicator();
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
        },
    });



}
function send_iban()
{
    var val = $$("#sidebar-driver-iban-number").val();
    myApp.showIndicator();
    $.ajax({
        url: server_url+'send_iban',
        type: "POST",
        data: JSON.stringify
        ({
            'text':val,
            'access-token': window.sessionStorage.getItem('access_token')
        }),
        //async: true,
        success : function(text)
        {
            myApp.hideIndicator();
            if(text.success == true)
            {
                myApp.alert(text.data,'توجه', function () {});
                $$("#driver-iban-button").hide();
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

function getSate()
{
    myApp.showIndicator();
    $.ajax({
        url: server_url+'getstate',
        type: "POST",
        data: JSON.stringify
        ({
            'access-token': window.sessionStorage.getItem('access_token')
        }),
        //async: true,
        success : function(text)
        {
            console.log(text);
            myApp.hideIndicator();
            if(text.success == true)
            {
                var arr = text.data;
                var data = [];
                var list ='';
                for(var i=0;i<arr.length;i++)
                {
                    list += '<option value="'+ arr[i].id + '">'+ arr[i].title +'</option>';
                    data.push
                    ({
                        id: arr[i].id,
                        title: arr[i].title

                    });
                }
                /*  myApp.virtualList('.state_list',
                 {
                 items:data,
                 // Template 7 template to render each item
                 template: '<option class="" value=" {{id}} ">{{title}}</option>',

                 });*/
                myApp.smartSelectAddOption('.state_list', list);

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
function getCity()
{
    myApp.showIndicator();
    $.ajax({
        url: server_url+'getcity',
        type: "POST",
        data: JSON.stringify
        ({
            'access-token': window.sessionStorage.getItem('access_token'),
            'state-id':  $(".state_list").find('option:selected').val()
        }),
        //async: true,
        success : function(text)
        {
            console.log(text);
            myApp.hideIndicator();
            if(text.success == true)
            {
                var arr = text.data;
                var data = [];
                var listCity ='';
                for(var i=0;i<arr.length;i++)
                {
                    listCity += '<option value="'+ arr[i].id + '">'+ arr[i].title +'</option>';
                    data.push
                    ({
                        id: arr[i].id,
                        title: arr[i].title

                    });
                }
                /*  myApp.virtualList('.state_list',
                 {
                 items:data,
                 // Template 7 template to render each item
                 template: '<option class="" value=" {{id}} ">{{title}}</option>',

                 });*/
                myApp.smartSelectAddOption('.city_list', listCity);

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

function do_special_user()
{
    var carType = $$( '#car_type' ).val();
    var carColor = $$( '#car_color' ).val();
    var licensePlate = $$( '#license_plate' ).val();
    var carCardOne = $$( '#car_card_one' )[0].files[0];
    var carCardTow = $$( '#car_card_tow' )[0].files[0];

    var carCertifictOne = $$( '#certifict_one' )[0].files[0];
    var carCertifictTow = $$( '#certifict_tow' )[0].files[0];

    var formData = new FormData();
    var	access_token= window.sessionStorage.getItem('access_token');


    formData.append( 'access_token', access_token );
    formData.append( 'car_type', carType );
    formData.append( 'car_color', carColor );
    formData.append( 'license_plate', licensePlate );

    formData.append( 'carCardOne', carCardOne );
    formData.append( 'carCardTow', carCardTow );

    formData.append( 'carCertifictOne', carCertifictOne );
    formData.append( 'carCertifictTow', carCertifictTow );
    myApp.showIndicator();
    jQuery.ajax( {
        url: server_url+'specialprofile',
        type: "POST",
        processData: false,
        contentType: false,
        data:formData
    } ).success(function(text)
    {
        // myApp.hideIndicator();
        //  mainView.router.loadPage('profile.html');
        myApp.hideIndicator();
        //myApp.alert(response.data,'توجه', function () {});
        if(text.success == true)
        {
            window.sessionStorage.setItem("access_token",text.data.access_token);
            window.localStorage.setItem("app_data",JSON.stringify(text.data));

            $$('#sidebar-driver-profile-name').text(text.data.name);
            $$('#sidebar-driver-phone-number').text(text.data.phone_number);
            $$('#sidebar-driver-national-code').text(text.data.national_code);
            //$$('#sidebar-driver-iban-number').text(text.data.iban);
            $$('#sidebar-driver-iban-number').val(text.data.iban);
            $$('#sidebar-driver-bank-name').text(text.data.bank_name);
            $$('#sidebar-driver-profile-car').text(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
            $$("#sidebar-driver-profile-img").attr("src", text.data.profile_pic_url);
            // $$("#sidebar-driver-profile-qrcode_img").text(text.data.qrcode_img);
            $$("#sidebar-driver-profile-qrcode_img").attr("src", text.data.qrcode_img);
            myApp.alert(text.data,'توجه', function () {});

        }
        else
        {
            var error = text.error;
            if(error=="app_not_updated")
            {
                $$('#force-update-message').text(text.data.message);
                myApp.popup(".force-update-popup", true, true);
                window.sessionStorage.setItem('update_url',text.data.update_url);
            }
            if(error=="user_banned" || error == "registration_not_verified")
            {
                myApp.alert(text.data,'توجه', function () {});
            }
            else
            {
                myApp.popup(".login-screen", true, true);
                convert_persian_digit_to_english();
            }

        }
    }).error(function(jqXHR, exception) {
        myApp.hideIndicator();
        myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
    });
}
function logOutUser() {
    window.localStorage.clear();
    // window.localStorage.setItem("access_token", null);
    myApp.popup(".login-screen", true, true);
}
function showPardakht()
{
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));

    $.ajax({
        url: server_url+'showpardakht',
        type: "POST",
        data: JSON.stringify
        ({
            'access_token': window.sessionStorage.getItem('access_token'),
        }),
        success : function(text)
        {
            var content_html='' ;
            myApp.hideIndicator();
            mainView.router.loadPage('pardakht.html');
            if(text.success == true)
            {
                window.sessionStorage.setItem("access_token",text.data.access_token);
                window.localStorage.setItem("app_data",JSON.stringify(text.data));
                //content_html ='<table><tr><th>موبایل</th><th>مبلغ</th><th>شماره پرداخت</th><th>شماره مرجع</th><th>تاریخ پرداخت</th><th>وضعیت پرداخت</th></tr>';
                for (var i = 0; i < text.data.length; i++)
                {

                    content_html += '<div class="pardakht-customer"><table class="table-customer"><tr>';
                    content_html += '<td><span class="content-pardakht">مبلغ پرداختی مسافر</span><br>'+ text.data[i].price+' ریال</td>';
                    content_html += '<td><span>شماره تراکنش</span><br>'+ text.data[i].shomare_pardakht +'</td>';
                    content_html += '<td style="width: 2px;">'+ text.data[i].date_pardakht +'</td>';
                    content_html += '<td class="content-status-pardakht" style="width: 7px;">تسویه نشده</td>';
                    content_html += '</table></div>';

                }
                //content_html += '</table>';
                $$('#list-block').html(content_html);

            }
            else
            {
                content_html += '<span>موردی یافت نشد</span>';
                $$('#list-block').html(content_html);

            }
        },
        error: function(jqXHR, exception) {
            myApp.hideIndicator();
            myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
        },
    });



}