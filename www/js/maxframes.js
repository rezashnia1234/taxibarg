// Init App
var myApp = new Framework7({
    modalTitle: "Maxsolfoo",
    // Enable Material theme
    material: true,

    animateNavBackIcon: true,
    precompileTemplates: true,
    swipeBackPage: true,
    pushState: true,
    template7Pages: true,
    init: false,
    statusbarOverlay: false
});

// Expose Internal DOM library
var $$ = Dom7;

// Add main view
var mainView = myApp.addView('.view-main', {
});



myApp.onPageInit('index', function (page) {
	/*if(check_net(true,false))
	 {
	 check_net_home_page();
	 }*/
});
myApp.onPageInit('landing', function (page) {
    $$('#map_bg').css("height",$$('body').height() - $$('#landing_menu').height() - 50 + "px");
});
myApp.onPageInit('taxi_yar_home', function (page)
{
    function shuffle(a)
    {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--)
        {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    var medias = [];
    for(var i=0;i<app_data.providers.length;i++)
    {
        if(app_data.providers[i].selected_for_slideshow)
        {
            for(var j=0;j<app_data.providers[i].medias.length;j++)
            {
                medias.push(app_data.providers[i].medias[j]);
            }
        }
    }
    shuffle(medias);
    var count = Math.min(5,medias.length);
    for(var i=0;i<count;i++)
    {
        $$('#slideshow-container').append('<div class="swiper-slide taxi_yar_home_slider" style="background-image:url(\''+medias[i]+'\');"></div>');
    }
    var mySwiper = myApp.swiper('.swiper-container', {
        speed: 400,
        spaceBetween: 100,
        pagination:'.swiper-pagination'
    });

    $$('.taxi_yar_home_slider').css("height",$$('body').height() - $$('#taxi_yar_home_menu').height() - $$('#taxi_yar_home_bottom_bar').height() - $$('#taxi_yar_home_navbar').height() - 3 + "px");
});
myApp.onPageInit('location_list', function (page) {
    init_virtual_list_of_locations(window.localStorage.getItem('cat_id'));
});
myApp.onPageInit('location_view', function (page) {
    var location_id = window.localStorage.getItem('location_id');
    location_view(location_id);
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    var providers = app_data.providers;
    function filter_func(obj)
    {
        return obj.id == location_id;
    }
    var provider = providers.filter(filter_func)[0];

    var medias = [];
    for(var j=0;j<provider.medias.length;j++)
    {
        medias.push(provider.medias[j]);
    }
    var count = medias.length;
    for(var i=0;i<count;i++)
    {
        $$('#slideshow-container').append('<div class="swiper-slide location_view_slider" style="background-image:url(\''+medias[i]+'\');"></div>');
    }
    var mySwiper = myApp.swiper('.swiper-container', {
        speed: 400,
        spaceBetween: 100,
        pagination:'.swiper-pagination'
    });


});
myApp.init();

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function (e) {
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function () {
    myApp.hideIndicator();
});





/* ===== Swipe to delete events callback demo ===== */
myApp.onPageInit('swipe-delete', function (page) {
    $$('.demo-remove-callback').on('deleted', function () {
        myApp.alert('Thanks, item removed!');
    });
});
myApp.onPageInit('swipe-delete media-lists', function (page) {
    $$('.demo-reply').on('click', function () {
        myApp.alert('Reply');
    });
    $$('.demo-mark').on('click', function () {
        myApp.alert('Mark');
    });
    $$('.demo-forward').on('click', function () {
        myApp.alert('Forward');
    });
});


/* ===== Action sheet, we use it on few pages ===== */
myApp.onPageInit('swipe-delete modals media-lists', function (page) {
    var actionSheetButtons = [
        // First buttons group
        [
            // Group Label
            {
                text: 'Choose some action',
                label: true
            },
            // First button
            {
                text: 'Alert',
                onClick: function () {
                    myApp.alert('He Hoou!');
                }
            },
            // Second button
            {
                text: 'Second Alert',
                onClick: function () {
                    myApp.alert('Second Alert!');
                }
            },
            // Another red button
            {
                text: 'Nice Red Button ',
                color: 'red',
                onClick: function () {
                    myApp.alert('You have clicked red button!');
                }
            },
        ],
        // Second group
        [
            {
                text: 'Cancel'
            }
        ]
    ];
    $$('.demo-actions').on('click', function (e) {
        myApp.actions(actionSheetButtons);
    });
    $$('.demo-actions-popover').on('click', function (e) {
        // We need to pass additional target parameter (this) for popover
        myApp.actions(this, actionSheetButtons);
    });

});

/* ===== Swipebox Gallery Page ===== */

myApp.onPageInit('gallery', function (page) {
    $('.swipebox' ).swipebox();
});


/* ===== Messages Page ===== */
myApp.onPageInit('messages', function (page) {

    var conversationStarted = false;
    var answers = [
        'Yes!',
        'No',
        'Hm...',
        'I am not sure',
        'And what about you?',
        'May be ;)',
        'Lorem ipsum dolor sit amet, consectetur',
        'What?',
        'Are you sure?',
        'Of course',
        'Need to think about it',
        'Amazing!!!',
    ];
    var people = [
        {
            name: 'Max Johnson',
            avatar: 'img/pic2.png'
        },
        {
            name: 'Stereo Doe',
            avatar: 'img/pic1.png'
        },

    ];
    var answerTimeout, isFocused;

    // Initialize Messages
    var myMessages = myApp.messages('.messages');

    // Initialize Messagebar
    var myMessagebar = myApp.messagebar('.messagebar');

    $$('.messagebar a.send-message').on('touchstart mousedown', function () {
        isFocused = document.activeElement && document.activeElement === myMessagebar.textarea[0];
    });
    $$('.messagebar a.send-message').on('click', function (e) {
        // Keep focused messagebar's textarea if it was in focus before
        if (isFocused) {
            e.preventDefault();
            myMessagebar.textarea[0].focus();
        }
        var messageText = myMessagebar.value();
        if (messageText.length === 0) {
            return;
        }
        // Clear messagebar
        myMessagebar.clear();

        // Add Message
        myMessages.addMessage({
            text: messageText,
            avatar: 'img/i-f7-material.png',
            type: 'sent',
            date: 'Now'
        });
        conversationStarted = true;
        // Add answer after timeout
        if (answerTimeout) clearTimeout(answerTimeout);
        answerTimeout = setTimeout(function () {
            var answerText = answers[Math.floor(Math.random() * answers.length)];
            var person = people[Math.floor(Math.random() * people.length)];
            myMessages.addMessage({
                text: answers[Math.floor(Math.random() * answers.length)],
                type: 'received',
                name: person.name,
                avatar: person.avatar,
                date: 'Just now'
            });
        }, 2000);
    });
});

/* ===== Pull To Refresh Demo ===== */
myApp.onPageInit('contacts', function (page) {
    // Dummy Content
    var songs = ['Sheela Joshi', 'Boxer Car', 'Makbul Ahemad', 'Lia'];
    var authors = ['India', 'Australia', 'Qatar', 'Clifornia'];
    // Pull to refresh content
    var ptrContent = $$(page.container).find('.pull-to-refresh-content');
    // Add 'refresh' listener on it
    ptrContent.on('refresh', function (e) {
        // Emulate 2s loading
        setTimeout(function () {
            var picURL = 'img/pic1.png';
            var song = songs[Math.floor(Math.random() * songs.length)];
            var author = authors[Math.floor(Math.random() * authors.length)];
            var linkHTML = '<li class="item-content">' +
                '<div class="item-media"><img src="' + picURL + '" width="44"/></div>' +
                '<div class="item-inner">' +
                '<div class="item-title-row">' +
                '<div class="item-title">' + song + '</div>' +
                '</div>' +
                '<div class="item-subtitle">' + author + '</div>' +
                '</div>' +
                '</li>';
            ptrContent.find('ul').prepend(linkHTML);
            // When loading done, we need to "close" it
            myApp.pullToRefreshDone();
        }, 2000);
    });
});




/* ===== Color themes ===== */
myApp.onPageInit('color-themes', function (page) {
    $$(page.container).find('.ks-color-theme').click(function () {
        var classList = $$('body')[0].classList;
        for (var i = 0; i < classList.length; i++) {
            if (classList[i].indexOf('theme') === 0) classList.remove(classList[i]);
        }
        classList.add('theme-' + $$(this).attr('data-theme'));
    });
    $$(page.container).find('.ks-layout-theme').click(function () {
        var classList = $$('body')[0].classList;
        for (var i = 0; i < classList.length; i++) {
            if (classList[i].indexOf('layout-') === 0) classList.remove(classList[i]);
        }
        classList.add('layout-' + $$(this).attr('data-theme'));
    });
});

/* ===== contact us  ===== */
myApp.onPageInit('contactus', function (page) {


    $(function () {

        $('#contact-form').validator();

        $('#contact-form').on('submit', function (e) {
            if (!e.isDefaultPrevented()) {
                var url = "contactform/contact.php";

                $.ajax({
                    type: "POST",
                    url: url,
                    data: $(this).serialize(),
                    success: function (data)
                    {
                        var messageAlert = 'alert-' + data.type;
                        var messageText = data.message;

                        var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
                        if (messageAlert && messageText) {
                            $('#contact-form').find('.alertmessage').html(alertBox);
                            $("button.close").click(function(){ $(this).parent().hide();});
                            $('#contact-form')[0].reset();
                        }
                    }
                });
                return false;
            }
        })
    });


});
/* ===== Calendar ===== */
myApp.onPageInit('register', function (page) {
    // Default
    var calendarDefault = myApp.calendar({
        input: '#ks-calendar-default2',
    });
    // With custom date format
    var calendarDateFormat = myApp.calendar({
        input: '#ks-calendar-date-format2',
        dateFormat: 'DD, MM dd, yyyy'
    });
});
myApp.onPageInit('calendar todo', function (page) {
    // Default
    var calendarDefault = myApp.calendar({
        input: '#ks-calendar-default',
    });
    // With custom date format
    var calendarDateFormat = myApp.calendar({
        input: '#ks-calendar-date-format',
        dateFormat: 'DD, MM dd, yyyy'
    });
    // With multiple values
    var calendarMultiple = myApp.calendar({
        input: '#ks-calendar-multiple',
        dateFormat: 'M dd yyyy',
        multiple: true
    });
    // Inline with custom toolbar
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
    var calendarInline = myApp.calendar({
        container: '#ks-calendar-inline-container',
        value: [new Date()],
        weekHeader: false,
        header: false,
        footer: false,
        toolbarTemplate:
        '<div class="toolbar calendar-custom-toolbar">' +
        '<div class="toolbar-inner">' +
        '<div class="left">' +
        '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
        '</div>' +
        '<div class="center"></div>' +
        '<div class="right">' +
        '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
        '</div>' +
        '</div>' +
        '</div>',
        onOpen: function (p) {
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
            $$('.calendar-custom-toolbar .left .link').on('click', function () {
                calendarInline.prevMonth();
            });
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
                calendarInline.nextMonth();
            });
        },
        onMonthYearChangeStart: function (p) {
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        }
    });
});


/* ===== Pickers ===== */
myApp.onPageInit('pickers', function (page) {
    var today = new Date();

    // iOS Device picker
    var pickerDevice = myApp.picker({
        input: '#ks-picker-device',
        cols: [
            {
                textAlign: 'center',
                values: ['iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6 Plus', 'iPad 2', 'iPad Retina', 'iPad Air', 'iPad mini', 'iPad mini 2', 'iPad mini 3']
            }
        ]
    });

    // Describe yourself picker
    var pickerDescribe = myApp.picker({
        input: '#ks-picker-describe',
        rotateEffect: true,
        cols: [
            {
                textAlign: 'left',
                values: ('Super Lex Amazing Bat Iron Rocket Lex Cool Beautiful Wonderful Raining Happy Amazing Funny Cool Hot').split(' ')
            },
            {
                values: ('Man Luthor Woman Boy Girl Person Cutie Babe Raccoon').split(' ')
            },
        ]
    });

    // Dependent values
    var carVendors = {
        Japanese : ['Honda', 'Lexus', 'Mazda', 'Nissan', 'Toyota'],
        German : ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Volvo'],
        American : ['Cadillac', 'Chrysler', 'Dodge', 'Ford']
    };
    var pickerDependent = myApp.picker({
        input: '#ks-picker-dependent',
        rotateEffect: true,
        formatValue: function (picker, values) {
            return values[1];
        },
        cols: [
            {
                textAlign: 'left',
                values: ['Japanese', 'German', 'American'],
                onChange: function (picker, country) {
                    if(picker.cols[1].replaceValues){
                        picker.cols[1].replaceValues(carVendors[country]);
                    }
                }
            },
            {
                values: carVendors.Japanese,
                width: 160,
            },
        ]
    });

    // Custom Toolbar
    var pickerCustomToolbar = myApp.picker({
        input: '#ks-picker-custom-toolbar',
        rotateEffect: true,
        toolbarTemplate:
        '<div class="toolbar">' +
        '<div class="toolbar-inner">' +
        '<div class="left">' +
        '<a href="#" class="link toolbar-randomize-link">Randomize</a>' +
        '</div>' +
        '<div class="right">' +
        '<a href="#" class="link close-picker">That\'s me</a>' +
        '</div>' +
        '</div>' +
        '</div>',
        cols: [
            {
                values: ['Mr', 'Ms'],
            },
            {
                textAlign: 'left',
                values: ('Super Lex Amazing Bat Iron Rocket Lex Cool Beautiful Wonderful Raining Happy Amazing Funny Cool Hot').split(' ')
            },
            {
                values: ('Man Luthor Woman Boy Girl Person Cutie Babe Raccoon').split(' ')
            },
        ],
        onOpen: function (picker) {
            picker.container.find('.toolbar-randomize-link').on('click', function () {
                var col0Values = picker.cols[0].values;
                var col0Random = col0Values[Math.floor(Math.random() * col0Values.length)];

                var col1Values = picker.cols[1].values;
                var col1Random = col1Values[Math.floor(Math.random() * col1Values.length)];

                var col2Values = picker.cols[2].values;
                var col2Random = col2Values[Math.floor(Math.random() * col2Values.length)];

                picker.setValue([col0Random, col1Random, col2Random]);
            });
        }
    });

    // Inline date-time
    var pickerInline = myApp.picker({
        input: '#ks-picker-date',
        container: '#ks-picker-date-container',
        toolbar: false,
        rotateEffect: true,
        value: [today.getMonth(), today.getDate(), today.getFullYear(), today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
        onChange: function (picker, values, displayValues) {
            var daysInMonth = new Date(picker.value[2], picker.value[0]*1 + 1, 0).getDate();
            if (values[1] > daysInMonth) {
                picker.cols[1].setValue(daysInMonth);
            }
        },
        formatValue: function (p, values, displayValues) {
            return displayValues[0] + ' ' + values[1] + ', ' + values[2] + ' ' + values[3] + ':' + values[4];
        },
        cols: [
            // Months
            {
                values: ('0 1 2 3 4 5 6 7 8 9 10 11').split(' '),
                displayValues: ('January February March April May June July August September October November December').split(' '),
                textAlign: 'left'
            },
            // Days
            {
                values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            },
            // Years
            {
                values: (function () {
                    var arr = [];
                    for (var i = 1950; i <= 2030; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Space divider
            {
                divider: true,
                content: '&nbsp;&nbsp;'
            },
            // Hours
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ]
    });
});
myApp.onPageInit('dashboard', function (page) {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Dinosaur', 'Length'],
            ['Acrocanthosaurus (top-spined lizard)', 12.2],
            ['Albertosaurus (Alberta lizard)', 9.1],
            ['Allosaurus (other lizard)', 12.2],
            ['Apatosaurus (deceptive lizard)', 22.9],
            ['Archaeopteryx (ancient wing)', 0.9],
            ['Argentinosaurus (Argentina lizard)', 36.6],
            ['Baryonyx (heavy claws)', 9.1],
            ['Brachiosaurus (arm lizard)', 30.5],
            ['Ceratosaurus (horned lizard)', 6.1],
            ['Coelophysis (hollow form)', 2.7],
            ['Compsognathus (elegant jaw)', 0.9],
            ['Deinonychus (terrible claw)', 2.7],
            ['Diplodocus (double beam)', 27.1],
            ['Dromicelomimus (emu mimic)', 3.4],
            ['Gallimimus (fowl mimic)', 5.5],
            ['Mamenchisaurus (Mamenchi lizard)', 21.0],
            ['Megalosaurus (big lizard)', 7.9],
            ['Microvenator (small hunter)', 1.2],
            ['Ornithomimus (bird mimic)', 4.6],
            ['Oviraptor (egg robber)', 1.5],
            ['Plateosaurus (flat lizard)', 7.9],
            ['Sauronithoides (narrow-clawed lizard)', 2.0],
            ['Seismosaurus (tremor lizard)', 45.7],
            ['Spinosaurus (spiny lizard)', 12.2],
            ['Supersaurus (super lizard)', 30.5],
            ['Tyrannosaurus (tyrant lizard)', 15.2],
            ['Ultrasaurus (ultra lizard)', 30.5],
            ['Velociraptor (swift robber)', 1.8]]);

        var options = {
            legend: { position: 'none' },
        };

        var chart = new google.visualization.Histogram(document.getElementById('chart_div'));


        chart.draw(data, options);

        var data = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Work',	 11],
            ['Eat',	  2],
            ['Sleep',	7]
        ]);

        var options = {
            pieHole: 0.3,
        };

        var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
        chart.draw(data, options);


    }
});

/* ===== masonary Gallery Page ===== */
myApp.onPageInit('masonry', function (page) {
    $(document).ready( function(){
        $('.grid').masonry({
            itemSelector: '.grid-item'
        });
    });

    $('.swipebox' ).swipebox();
    $(".galleryone").click(function(){
        $(".grid").addClass("one");
        $(".grid").removeClass("two three");
        $('.grid').masonry({
            itemSelector: '.grid-item'
        });
    });

    $(".gallerytwo").click(function(){
        $(".grid").addClass("two");
        $(".grid").removeClass("one  three");
        $('.grid').masonry({
            itemSelector: '.grid-item'
        });
    });

    $(".gallerythree").click(function(){
        $(".grid").addClass("three");
        $(".grid").removeClass("two one");
        $('.grid').masonry({
            itemSelector: '.grid-item'
        });
    });

});

/*
 google.charts.load('current', {'packages':['corechart','geochart','bar','table']});

 myApp.onPageInit('chart', function (page) {
 // Load the Visualization API and the corechart package.


 $(document).ready( function(){
 google.charts.setOnLoadCallback(drawChart);
 function drawChart() {

 // Donut chart
 var data = google.visualization.arrayToDataTable([
 ['Task', 'Hours per Day'],
 ['Work',	 11],
 ['Eat',	  2],
 ['Commute',  2],
 ['Watch TV', 2],
 ['Sleep',	7]
 ]);

 var options = {
 title: '',
 pieHole: 0.34
 };

 var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
 chart.draw(data, options);

 // Pie chart //
 var data2 = google.visualization.arrayToDataTable([
 ['Task', 'Hours per Day'],
 ['Work',	 11],
 ['Eat',	  2],
 ['Commute',  2],
 ['Watch TV', 2],
 ['Sleep',	7]
 ]);
 var options2 = {
 title: ''
 };

 var chart2 = new google.visualization.PieChart(document.getElementById('piechart'));

 chart2.draw(data2, options2);




 // bar chart //
 var data3 = google.visualization.arrayToDataTable([
 ['Year', 'Sales', 'Expenses', 'Profit'],
 ['2014', 1000, 400, 200],
 ['2015', 1170, 460, 250],
 ['2016', 660, 1120, 300],
 ['2017', 1030, 540, 350]
 ]);

 var options3 = {
 chart: {
 title: '',
 subtitle: '',
 }
 };
 var chart3 = new google.charts.Bar(document.getElementById('columnchart_material'));
 chart3.draw(data3, options3);



 // tabel chart //
 var data4 = new google.visualization.DataTable();
 data4.addColumn('string', 'Name');
 data4.addColumn('number', 'Salary');
 data4.addColumn('boolean', 'Full Time Employee');
 data4.addRows([
 ['Mike',  {v: 10000, f: '$10,000'}, true],
 ['Jim',   {v:8000,   f: '$8,000'},  false],
 ['Alice', {v: 12500, f: '$12,500'}, true],
 ['Bob',   {v: 7000,  f: '$7,000'},  true]
 ]);

 var table = new google.visualization.Table(document.getElementById('table_div'));

 table.draw(data4, {showRowNumber: true, width: '100%', height: '100%'});



 // Area chart //

 var data5 = google.visualization.arrayToDataTable([
 ['Year', 'Sales', 'Expenses'],
 ['2013',  1000,	  400],
 ['2014',  1170,	  460],
 ['2015',  660,	   1120],
 ['2016',  1030,	  540]
 ]);

 var options5 = {
 title: '',
 hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
 vAxis: {minValue: 0}
 };

 var chart5 = new google.visualization.AreaChart(document.getElementById('areachart_div'));
 chart5.draw(data5, options5);



 };



 google.charts.setOnLoadCallback(drawRegionsMap);

 function drawRegionsMap() {

 var data = google.visualization.arrayToDataTable([
 ['Country', 'Popularity'],
 ['Germany', 200],
 ['United States', 300],
 ['Brazil', 400],
 ['Canada', 500],
 ['France', 600],
 ['India', 600],
 ['RU', 700]
 ]);

 var options = {};

 var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

 chart.draw(data, options);
 }





 });



 });
 */


/* ===== Change statusbar bg when panel opened/closed ===== */
$$('.panel-left').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-left');
});



$$('.panel-left, .panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});



myApp.onPageInit('support', function (page) {

    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    $$("#support_phone_a").attr("href", 'tel:'+app_data['support_phone']);
    $$('#support_phone_a').text(app_data['support_phone']);
});


myApp.onPageInit('map', function (page)
{
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    $$("#map_iframe").attr("src","https://maps.google.com/maps?ll="+app_data['driver_app_map_center']+"&hl=fa&z=13&output=embed");
});

myApp.onPageInit('emergency', function (page)
{
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));

    console.log("awdwdawawd");
    function add(html)
    {
        $$('#phones_table').html($$('#phones_table').html()+html);
    }
    for(var k in app_data['useful_phone_numbers'])
    {
        add("<tr><td>"+k+"</td><td>"+app_data['useful_phone_numbers'][k]+"</td></tr>");
    }



});
myApp.onPageInit('profile', function (page) {
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    $$('#sidebar-driver-profile-name').val(app_data['name']);
    $$('#sidebar-driver-phone-number').val(app_data['phone_number']);
    $$('#sidebar-driver-national-code').val(app_data['national_code']);
    $$('#sidebar-driver-iban-number').val(app_data['iban']);
    $$('#sidebar-driver-bank-name').val(app_data['bank_name']);
    // $$('#sidebar-driver-profile-car').val(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
    $$("#sidebar-driver-profile-img").attr("src",app_data['profile_pic_url']);
    $$('#car_type').val(app_data['car_type']);
    $$('#car_color').val(app_data['car_color']);
    $$('#license_plate').val(app_data['license_plate']);
    // $$("#sidebar-driver-profile-qrcode_img").text(text.data.qrcode_img);
    // $$("#sidebar-driver-profile-qrcode_img").attr("src", text.data.qrcode_img);
    //showProfile();
});

myApp.onPageInit('taxi_padrdaz', function (page) {
    showTaxiPardaz();
});
myApp.onPageInit('updateProfile', function (page) {
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    $$('#register_name').val(app_data['name']);
    $$('#register_phone_number').val(app_data['phone_number']);
    getSate();
});
myApp.onPageInit('special_user', function (page) {
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
});
myApp.onPageInit('final_profile', function (page) {
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));

    $$('#sidebar-driver-profile-name').text(app_data['name']);
    $$('#sidebar-driver-profile-lastname').text(app_data['last_name']);
    $$('#sidebar-driver-phone-number').text(app_data['phone_number']);
    $$('#sidebar-driver-national-code').text(app_data['national_code']);
    $$('#sidebar-driver-iban-number').val(app_data['iban']);
    $$('#sidebar-driver-bank-name').text(app_data['bank_name']);
    $$('#car_type').val(app_data['car_type']);
    $$('#car_color').val(app_data['car_color']);
    $$('#license_plate').val(app_data['license_plate']);
    $$("#sidebar-driver-profile-img").attr("src", app_data['profile_pic_url']);
    // $$("#sidebar-driver-profile-qrcode_img").attr("src", text.data.qrcode_img);
});
myApp.onPageInit('pardakht', function (page) {
    var content_html='' ;
    var app_data = JSON.parse(window.localStorage.getItem('app_data'));
    if(app_data)
    {

        for (var i = 0; i < app_data.length; i++)
        {

            content_html += '<div class="pardakht-customer"><table class="table-customer"><tr>';
            content_html += '<td><span class="content-pardakht">مبلغ پرداختی مسافر</span><br>'+ app_data[i].price+' ریال</td>';
            content_html += '<td><span>شماره تراکنش</span><br>'+ app_data[i].shomare_pardakht +'</td>';
            content_html += '<td style="width: 2px;">'+ app_data[i].date_pardakht +'</td>';
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
});