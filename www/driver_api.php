<?php

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Driver;
use App\Invoice;
use App\Category;
use App\Provider;
use App\DriverPayment;
use App\DriverNotification;
use App\DriverLocationRecord;
use App\PerPersonInvoiceConfirmation;
use \App\Helpers\AppHelper;
use App\State;
use App\City;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
function my_send_sms($text,$to)
{
//	$url="http://newpida87319005141045413600sms.pidasms.com/APPs/SMS/WebService.php?wsdl";
    $url="http://khadamati.pidasms.com/APPs/SMS/WebService.php?wsdl";
    $client=new nusoap_client($url, 'wsdl');
    $err = $client->getError();
    if ($err) {
        echo '<h2>Constructor error</h2><pre>' . $err . '</pre>';
    }

    // send sms function

    $username	= "shakiba10007";
    $password	= "369147";
    //$from		= "10003333444455";
    //$from		= "10009005";
    $from		= "100033554334";
    $id = $client->call('sendSMS', array(
        'domain' => 'khadamati.pidasms.com',
        'username' => $username,//your username
        'password' => $password,//yourpassword
        'from' => $from, //your panle number for example 100045545244
        "to"=>$to, // to which numers?
        "text"=>$text,//your sms text
        "isflash"=>"0"));
}

Route::post('/authwithphonenumber', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'phone_number' => 'required|phone:IR'
            //'phone_number' => 'required|phone:IR|size:11|exists:drivers,phone_number'
        ],
        [
            'phone_number.required' => 'شماره تلفن را وارد کنید.',
            'phone_number.phone' => 'شماره تلفن اشتباه است.',
            'phone_number.size' => 'شماره تلفن اشتباه است.',
            'phone_number.exists' => 'راننده ای با این شماره ثبت نشده است.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    $phone_number = $request->input("phone_number");

    $user = App\Driver::where('phone_number',$phone_number)->get();
    if(isset($user->first()->phone_number))
        $accountOpen = $user->first()->account_open;

    if(!isset($user->first()->phone_number))
    {

        $ip_count = DB::table('register_ips')->where('ip',$request->ip())->whereRaw('Date(at) = CURDATE()')->count();
        if($ip_count>10)
        {
            $arr = ["success"=>true,"data"=>"کد فعال سازی برای شما پیامک خواهد شد."];
            return response()->json($arr);
        }
        DB::table('register_ips')->insert(
            ['ip' => $request->ip()]
        );

        $new_driver = new Driver;
        $new_driver->name = '';
        $new_driver->last_name = '';
        $new_driver->phone_number = $request->input('phone_number');
        $new_driver->registration_verified = true;
        $new_driver->account_open = true;
        $new_driver->car_type = '';
        $new_driver->car_color = '';
        $new_driver->license_plate = '';
        $new_driver->iban_number = '';
        $new_driver->bank_name = '';
        $new_driver->profile_pic_url = '';
        $new_driver->save();
        $accountOpen = true ;

    }

    if ($accountOpen == false) {
        $arr = ["success" => false, "data" => 'حساب شما غیر فعال شده است.'];
        return response()->json($arr);
    }

    $digits = 5;
    $secutity_code = (string)(rand(pow(10, $digits - 1), pow(10, $digits) - 1));
    if(!empty($secutity_code))
    {
        my_send_sms('کد فعال سازی تاکسی یار شما:' . $secutity_code, $phone_number);
        $user->first()->sms_security_code = $secutity_code;
        $user->first()->save();
    }
    $arr = ["success" => true, "data" => null];
    return response()->json($arr);

});


Route::post('/register',function (Request $request)
{

    $validator = Validator::make($request->all(), [
        'name' => 'required',
        'last_name'=>'required',
        //	'national_code'=>'required|iran_national_code',
        //	'car_type_2'=>'required|in:taxi,private'
    ],
        [
            'last_name.required' => 'نام خانوادگی را وارد کنید.',
            'phone_number.phone' => 'شماره تلفن اشتباه است.',
            'phone_number.size' => 'شماره تلفن اشتباه است.',
            'phone_number.unique'=>'این شماره تلفن قبلا ثبت شده است',
            'name.required' => 'لطفا نام خود را وارد کنید.',
            //	'national_code.required'=>'لطفا کد ملی خود را وارد کنید.',
            //	'national_code.iran_national_code'=>'کد ملی وارد شده صحیح نیست. لطفا کد ملی را به صورت ده رقمی وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }

    $ip_count = DB::table('register_ips')->where('ip',$request->ip())->whereRaw('Date(at) = CURDATE()')->count();
    if($ip_count>10)
    {
        $arr = ["success"=>true,"data"=>"کد فعال سازی برای شما پیامک خواهد شد."];
        return response()->json($arr);
    }
    DB::table('register_ips')->insert(
        ['ip' => $request->ip()]
    );

    $phone_number = $request->input('phone_number');
    $new_driver = App\Driver::where('phone_number',$phone_number)->get();
    //$new_driver = new Driver;
    $new_driver->first()->name = $request->input('name');
    $new_driver->first()->last_name = $request->input('last_name');
    //$new_driver->phone_number = $request->input('phone_number');
    //$new_driver->national_code = $request->input('national_code');
//	$new_driver->car_type_2 = $request->input('car_type_2');
    $new_driver->first()->registration_verified = true;
    $new_driver->first()->account_open = true;
    /*these fields does not have default values*/
    $new_driver->first()->car_type = '';
    $new_driver->first()->car_color = '';
    if($request->has('license_plate'))
        $new_driver->first()->license_plate = $request->input('license_plate');
    else
        $new_driver->first()->license_plate = '';
    $new_driver->first()->iban_number = '';
    $new_driver->first()->bank_name = '';
    $new_driver->first()->profile_pic_url = '';
    $new_driver->first()->sexuality = $request->input('register_sex');
    $new_driver->first()->save();

    $arrList = ["list"=>[
        "id"=> $new_driver->first()->id,
        "access_token"=>$new_driver->first()->access_token,
        "name"=> $new_driver->first()->name,
        "last_name"=> $new_driver->first()->last_name,
        "phone_number"=> $new_driver->first()->phone_number,
        "profile_pic_url"=>URL::to('/'. $new_driver->first()->profile_pic_url),
        "iban"=> $new_driver->first()->iban_number,
        "car_type"=> $new_driver->first()->car_type,
        "car_color"=> $new_driver->first()->car_color,
        "license_plate"=> $new_driver->first()->license_plate,
        'state'=>$new_driver->first()->state_id,
        'city'=>$new_driver->first()->city_id,
        'national_code'=>$new_driver->first()->national_code,
        'bank_name'=>$new_driver->first()->bank_name,
    ]];
    $arr = ["success"=>true,'list'=>$arrList,"data"=> $request->input('name')." "." عزیز خوش آمدید. <br>جهت استفاده از امکانات پروفایل خود را تکمیل کنید."];
    //$arr = ["success"=>true,"data"=> $request->input('name')." "." عزیز خوش آمدید./nجهت استفاده از امکانات پروفایل خود را تکمیل کنید."];
    return response()->json($arr);

});
Route::post('/confirmphone', function (Request $request)
{
    $validator = Validator::make($request->all(), [
        'phone_number' => 'required|phone:IR|size:11|exists:drivers,phone_number',
        'security_code' => 'required',
        'os'=>'required',
        'notification_id'=>'required',
        'device_id'=>'required'
    ],
        [
            'phone_number.required' => 'شماره تلفن را وارد کنید.',
            'phone_number.phone' => 'شماره تلفن اشتباه است.',
            'phone_number.size' => 'شماره تلفن اشتباه است.',
            'phone_number.exists' => 'راننده ای با این شماره ثبت نشده است.',
            'security_code.required' => 'کد تایید را وارد کنید.',
            'os.required'=>'سیستم عامل را وارد کنید.',
            'notification_id.required'=>'notification id is not sent',
            'device_id.required'=>'device id is not sent'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }

    $phone_number = $request->input("phone_number");
    $security_code = $request->input("security_code");

    $user = App\Driver::where('phone_number',$phone_number)->where('sms_security_code',$security_code)->get();
    if($user->count())//if user exists
    {
        $auth_token = str_random(16);
        $user->first()->auth_token = $auth_token;
        $user->first()->sms_security_code = null;
        $user->first()->os = $request->input("os");
        $user->first()->notification_id = $request->input("notification_id");
        $user->first()->device_id = $request->input("device_id");
        $user->first()->save();
        $arr = ["success"=>true,"data"=>["auth_token"=>$auth_token , 'name'=>$user->first()->name , 'last_name' => $user->first()->last_name]];
        return response()->json($arr);
    }
    else
    {
        $arr = ["success"=>false,"data"=>"کد تایید صحیح نیست."];
        return response()->json($arr);
    }
});

Route::post('/loginwithauthtoken', function (Request $request)
{
    $validator = Validator::make($request->all(), [
        'auth_token' => 'required',
        'client_version'=>'required|numeric'
    ],
        [
            'auth_token.required' => 'کد ورود را وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"error"=>"bad_input","data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    if($request->input('client_version')<config('app.min_driver_client_version'))
    {
        $arr = ["success"=>false,"error"=>'app_not_updated',"data"=>['message'=>config('app.force_update_message'),"update_url"=>config('app.driver_client_update_url')]];
        return response()->json($arr);
    }
    $auth_token = $request->input("auth_token");
    $user = App\Driver::where('auth_token',$auth_token)->get();
    if($user->count())//if user exists
    {
        if($user->first()->account_open==false)
        {
            $arr = ["success"=>false,"error"=>"user_banned","data"=>'حساب شما غیر فعال شده است.'];
            return response()->json($arr);
        }
        if($user->first()->registration_verified != true)
        {
            $arr = ["success"=>false,"error"=>"registration_not_verified","data"=>'اطلاعات حساب شما تایید نشده است. به محض تایید حساب از طریق پیامک به شما اطلاع داده خواهد شد.'];
            return response()->json($arr);
        }
        $access_token = str_random(16);
        $user->first()->access_token = $access_token;
        $user->first()->last_login_at = Carbon::now()->format('Y-m-d H:i:s');
        $ballance = Invoice::where('driver_id','=',$user->first()->id)->where('state','=','acceped')->sum('driver_commision');
        $payable =  Invoice::where('driver_id','=',$user->first()->id)->where('state','=','payed_by_provider')->sum('driver_commision');
        $user->first()->save();
        $arr = ["success"=>true,"data"=>[
            "id"=>$user->first()->id,
            "access_token"=>$access_token,
            "name"=>$user->first()->name,
            "last_name"=>$user->first()->last_name,
            "phone_number"=>$user->first()->phone_number,
            "profile_pic_url"=>URL::to('/'.$user->first()->profile_pic_url),
            "iban"=>$user->first()->iban_number,
            "car_type"=>$user->first()->car_type,
            "car_color"=>$user->first()->car_color,
            "license_plate"=>$user->first()->license_plate,
            "ballance"=>$ballance,
            'payable'=>$payable,
            'support_phone'=>config('app.support_phone'),
            'driver_app_map_center'=>config('app.driver_app_map_center'),
            'useful_phone_numbers'=>json_decode(File::get(public_path().'/phones.json')),
            "categories"=> Category::all(),
            'state'=>$user->first()->state_id,
            'city'=>$user->first()->city_id,
            'national_code'=>$user->first()->national_code,
            'bank_name'=>$user->first()->bank_name,
        ]];
        $providers = Provider::where('account_open','=',true)->get();
        $arr['data']['providers'] = [];
        foreach ($providers as $provider)
        {
            $p['id'] = $provider['id'];
            $p['category_id'] = $provider['category_id'];
            $p['name'] = $provider['name'];
            $p['description'] = $provider['description'];
            $p['priceMode'] = $provider['priceMode'];
            $p['lat'] = $provider['lat'];
            $p['lng'] = $provider['lng'];
            $p['per_person_mode_unit_name'] = $provider['per_person_mode_unit_name'];
            $p['require_passenger_number'] = intval($provider['require_passenger_number']);

            if($provider['priceMode']=='free')
                $p['driver_share'] = $provider['purchase_commision']*$provider['driver_share'];
            else
                $p['driver_share'] = $provider['price_per_person']*$provider['driver_share'];

            $p['manual_offline_since'] = $provider['manual_offline_since'];
            $p['daily_on_time'] = $provider['daily_on_time'];
            $p['daily_off_time'] = $provider['daily_off_time'];
            $p['lat'] = $provider['lat'];
            $p['lng'] = $provider['lng'];
            $p['selected_for_slideshow'] = intval($provider['selected_for_slideshow']);
            $p['medias'] = [];
            foreach ($provider->medias as $media)
            {
                if($media->external)
                    $p['medias'][] = $media->media_url;
                else
                    $p['medias'][] = URL::to('/'.$media->media_url);
            }
            $arr['data']['providers'][] = $p;
        }
        return response()->json($arr);

    }
    else
    {
        $arr = ["success"=>false,"error"=>"wrong_code","data"=>"کد رورد صحیح نیست."];
        return response()->json($arr);
    }
});


Route::middleware('driver_auth')->post('/getinvoicehistory', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'provider_id'=>'exists:providers,id',
            'state'=>'in:generated,acceped,rejected,payed_by_provider,payed_to_driver',
            'date_from'=>'date_format:Y-m-d H:i:s',
            'date_to'=>'date_format:Y-m-d H:i:s',
            'page'=>'integer'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr,400);
    }
    $driver_id = $request->get("auth_user_id");
    $invoices = Invoice::where('driver_id','=',$driver_id)->orderBy('created_at', 'DESC');
    if($request->has('state'))
        $invoices = $invoices->where('state','=',$request->input('state'));
    if($request->has('provider_id'))
        $invoices = $invoices->where('provider_id','=',$request->input('provider_id'));
    if($request->has('date_from'))
        $invoices = $invoices->where('created_at','>',$request->input('date_from'));
    if($request->has('date_to'))
        $invoices = $invoices->where('created_at','<',$request->input('date_to'));
    if($request->has('page'))
    {
        $invoices = $invoices->offset($request->input('page')*10);
        $invoices = $invoices->take(10)->get();
    }
    else
    {
        $invoices = $invoices->get();
    }
    $output = [];
    foreach ($invoices as $invoice)
    {
        $i = [];
        $i['id'] = $invoice->id;
        $i['provider_name'] = $invoice->provider->name;
        $i['provider_id'] = $invoice->provider_id;
        $i['state'] = $invoice->state;
        $i['time'] = $invoice->created_at->format('Y-m-d H:i:s');
        $i['invoice_number'] = $invoice->id;
        $i['driver_share'] = $invoice->driver_commision;
        if($invoice->state == 'acceped' || $invoice->state == 'payed_by_provider')
            $i['state'] = '1';
        if($invoice->state == 'rejected')
            $i['state'] = '2';
        if($invoice->state == 'generated')
            $i['state'] = '3';
        if($invoice->state == 'payed_to_driver')
            $i['state'] = '4';
        $output[] = $i;
    }
    $arr = ["success"=>true,"data"=>$output];
    return response()->json($arr);
});

Route::middleware('driver_auth')->post('/getpaymentshistory', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'page'=>'integer'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr,400);
    }
    $driver_id = $request->get("auth_user_id");
    $payments = DriverPayment::where('driver_id','=',$driver_id);
    if($request->has('page'))
    {
        $payments = $payments->offset($request->input('page')*10);
        $payments = $payments->take(10)->get();
    }
    else
    {
        $payments = $payments->get();
    }
    $output = [];
    foreach ($payments as $payment)
    {
        $i = [];
        $i['timestamp'] = $payment->created_at->format('Y-m-d H:i:s');
        $i['value'] = $payment->value;
        $output[] = $i;
    }
    $arr = ["success"=>true,"data"=>$output];
    return response()->json($arr);
});


Route::middleware('driver_auth')->post('/getnotifications', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'page'=>'integer'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr,400);
    }
    $driver_id = $request->get("auth_user_id");
    $notifications = DriverNotification::where('driver_id','=',$driver_id)->orderBy('created_at', 'DESC');
    if($request->has('page'))
    {
        $notifications = $notifications->offset($request->input('page')*10);
        $notifications = $notifications->take(10)->get(['created_at','type','message']);
    }
    else
    {
        $notifications = $notifications->get(['created_at','type','message']);
    }

    $arr = ["success"=>true,"data"=>$notifications];
    return response()->json($arr);

});


Route::middleware('driver_auth')->post('/submitlocation', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'lat'=>'required|numeric',
            'lng'=>'required|numeric'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr,400);
    }
    $driver_id = $request->get("auth_user_id");
    $rec = new DriverLocationRecord;
    $rec->driver_id = $driver_id;
    $rec->lat = $request->input('lat');
    $rec->lng = $request->input('lng');
    $rec->save();

    $arr = ["success"=>true,"data"=>null];
    return response()->json($arr);
});


Route::middleware('driver_auth')->post('/issuediscountcode', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'client_phone_number'=>'sometimes|phone:IR',
            'provider_id'=>'required|exists:providers,id',
            'passenger_count'=>'required|integer',
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr,400);
    }
    $driver_id = $request->get("auth_user_id");
    $dirver = Driver::find($driver_id);
    $provider = Provider::find($request->input('provider_id'));
    if($provider->priceMode=='per_person')
    {
        $arr = ["success"=>false,"data"=>'invalid_provider_type'];
        return response()->json($arr,401);
    }
    if($provider->require_passenger_number && $request->has('client_phone_number')==false)
    {
        $arr = ["success"=>false,"data"=>'لطفا شماره تلفن مسافر را وارد کنید.'];
        return response()->json($arr,401);
    }
    $invoice = new Invoice;
    $digits = 8;
    $discount_code = (string)(rand(pow(10, $digits-1), pow(10, $digits)-1));

    $provider_text = $provider->sms_text;
    $send_to_number = '';

    if($provider->send_discount_code_to == 'passenger' && $request->has('client_phone_number'))
        $send_to_number = $request->input('client_phone_number');

    if($provider->send_discount_code_to == 'driver')
        $send_to_number = $dirver->phone_number;

    if(strlen($provider_text)>0)
    {
        $sms_text = str_replace(['%dc%','%dp%'],[$discount_code,$provider->client_discount*100],$provider_text);
        my_send_sms($sms_text,$send_to_number);
    }
    else
    {
        my_send_sms('کد تخفیف شما برای '.$provider->name."\r\n".$discount_code,$send_to_number);
    }




    $invoice->discount_code = $discount_code;
    $invoice->provider_id = $request->input('provider_id');
    $invoice->driver_id = $driver_id;
    $invoice->state = 'generated';
    if($request->has('client_phone_number'))
        $invoice->passenger_phone_number = $request->input('client_phone_number');
    else
        $invoice->passenger_phone_number = '';

    $invoice->save();

    $conf = new PerPersonInvoiceConfirmation();
    $conf->passenger_count = $request->input('passenger_count');
    $conf->invoice_id = $invoice->id;
    $conf->state = 'registered';
    $conf->save();

    $arr = ["success"=>true,"data"=>null];
    return response()->json($arr);
});


Route::middleware('driver_auth')->post('/submitarrival', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'number_of_persons'=>'required|integer',
            'provider_id'=>'required|exists:providers,id',
            'passenger_phone_number'=>'sometimes|phone:IR'
        ],
        [
            'passenger_phone_number.phone'=>'شماره تلفن همراه مسافر را به درستی وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    $driver_id = $request->get("auth_user_id");
    $dirver = Driver::find($driver_id);
    $provider = Provider::find($request->input('provider_id'));
    $now = Carbon::now();
    $now_mins = $now->hour*60+$now->minute;
    if($provider->priceMode=='free')
    {
        $arr = ["success"=>false,"data"=>'invalid_provider_type'];
        return response()->json($arr);
    }
    if($provider->require_passenger_number==1)
    {
        if($request->has('passenger_phone_number')==false || empty($request->input('passenger_phone_number')))
        {
            $arr = ["success"=>false,"data"=>'لطفا شماره تلفن مسافر را وارد کنید.'];
            return response()->json($arr);
        }
    }

    if($provider->manual_offline_since!==null && $provider->manual_offline_since<$now)
    {
        $arr = ["success"=>false,"data"=>'خدمات دهنده در حال ارایه خدمات نیست.'];
        return response()->json($arr);
    }
    if($provider->daily_on_time>$now_mins || $provider->daily_off_time<$now_mins)
    {
        $arr = ["success"=>false,"data"=>'خدمات دهنده در حال ارایه خدمات نیست.',"debug"=>$now_mins];
        return response()->json($arr);
    }
    $invoice = new Invoice;

    $invoice->provider_id = $request->input('provider_id');
    $invoice->driver_id = $driver_id;
    $invoice->passenger_count = $request->input('number_of_persons');
    $invoice->state = 'generated';
    $invoice->total_value = $invoice->passenger_count*$provider->price_per_person;
    $invoice->taken_form_provider = $invoice->total_value;
    $invoice->driver_commision = $invoice->total_value*$provider->driver_share;
    $invoice->system_commision = $invoice->total_value*(1-$provider->driver_share);
    if($request->has('passenger_phone_number'))
        $invoice->passenger_phone_number = $request->input('passenger_phone_number');
    else
        $invoice->passenger_phone_number = '';

    $invoice->save();

    $notif_text = str_replace(['%car%','%count%'],
        [$invoice->driver->car_type.' '.$invoice->driver->car_color.' '.$invoice->driver->license_plate ,$invoice->passenger_count],
        config('app.provider_notification_arrival_request'));
    AppHelper::sendNotifificationTo([],[$invoice->provider_id],true,false,$notif_text);


    $provider_text = $provider->sms_text;
    if(strlen($provider_text)>0)
    {
        $sms_text = str_replace(['%dc%','%dp%'],['',''],$provider_text);
        if($provider->send_discount_code_to == 'passenger' && $request->has('passenger_phone_number'))
            my_send_sms($sms_text,$request->input('passenger_phone_number'));
        if($provider->send_discount_code_to == 'driver')
            my_send_sms($sms_text,$invoice->driver->phone_number);

    }

    $arr = ["success"=>true,"data"=>null];
    return response()->json($arr);
});
Route::middleware('driver_auth')->post('/send_support_message', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'text'=>'required'
        ],
        [
            'text.required'=>'لطفا متن پیام خود را وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    $driver_id = $request->get("auth_user_id");
    $driver = Driver::find($driver_id);
    $text = $request->input('text');
    $data = ["app"=>"راننده","phone_number"=>$driver->phone_number,"id"=>$driver_id,"name"=>$driver->name,"message_text"=>$text,"url"=>route("driver_show",$driver_id)];
    Mail::send('emails.support_message', $data, function ($message) use ($driver)
    {
        $message->from('support@taxiyar.net', 'تاکسی یار');
        $message->to(config('app.support_email'));
        $message->subject('پیام از طرف کاربر تاکسی یار '. $driver->name);
    });
    $arr = ["success"=>true,"data"=>"پیام شما برای پشتیبانی ارسال شد."];
    return response()->json($arr);
});

Route::post('/showprofile', function (Request $request)
{
    $validator = Validator::make($request->all(), [
        'access_token' => 'required'
    ],
        [
            'access_token.required' => 'کد ورود را وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"error"=>"bad_input","data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    /*if($request->input('client_version')<config('app.min_driver_client_version'))
    {
        $arr = ["success"=>false,"error"=>'app_not_updated',"data"=>['message'=>config('app.force_update_message'),"update_url"=>config('app.driver_client_update_url')]];
        return response()->json($arr);
    }*/
    $access_token = $request->input("access_token");
    $user = App\Driver::where('access_token',$access_token)->get();
    if($user->count())//if user exists
    {
        if($user->first()->account_open==false)
        {
            $arr = ["success"=>false,"error"=>"user_banned","data"=>'حساب شما غیر فعال شده است.'];
            return response()->json($arr);
        }
        if($user->first()->registration_verified != true)
        {
            $arr = ["success"=>false,"error"=>"registration_not_verified","data"=>'اطلاعات حساب شما تایید نشده است. به محض تایید حساب از طریق پیامک به شما اطلاع داده خواهد شد.'];
            return response()->json($arr);
        }

        //$access_token = str_random(16);
        //$user->first()->access_token = $access_token;
        //$user->first()->last_login_at = Carbon::now()->format('Y-m-d H:i:s');
        //$ballance = Invoice::where('driver_id','=',$user->first()->id)->where('state','=','acceped')->sum('driver_commision');
        //$payable =  Invoice::where('driver_id','=',$user->first()->id)->where('state','=','payed_by_provider')->sum('driver_commision');
        //$user->first()->save();
        $arr = ["success"=>true,"data"=>[
            "id"=>$user->first()->id,
            "access_token"=>$user->first()->access_token,
            "name"=>$user->first()->name,
            "phone_number"=>$user->first()->phone_number,
            "profile_pic_url"=>URL::to('/'.$user->first()->profile_pic_url),
            "qrcode_img"=>URL::to('/'.$user->first()->qrcode_img),
            "uid"=>$user->first()->uid,
            "national_code"=>$user->first()->national_code,
            "bank_name"=>$user->first()->bank_name,
            "iban"=>$user->first()->iban_number,
            "car_type"=>$user->first()->car_type,
            "car_color"=>$user->first()->car_color,
            "license_plate"=>$user->first()->license_plate,
            //	"ballance"=>$ballance,
            //'payable'=>$payable,
            'support_phone'=>config('app.support_phone'),
            'driver_app_map_center'=>config('app.driver_app_map_center'),
            'useful_phone_numbers'=>json_decode(File::get(public_path().'/phones.json')),
            "categories"=> Category::all(),
            'state'=>$user->first()->state_id,
            'city'=>$user->first()->city_id,
        ]];

        $providers = Provider::where('account_open','=',true)->get();
        $arr['data']['providers'] = [];
        foreach ($providers as $provider)
        {
            $p['id'] = $provider['id'];
            $p['category_id'] = $provider['category_id'];
            $p['name'] = $provider['name'];
            $p['description'] = $provider['description'];
            $p['priceMode'] = $provider['priceMode'];
            $p['lat'] = $provider['lat'];
            $p['lng'] = $provider['lng'];
            $p['per_person_mode_unit_name'] = $provider['per_person_mode_unit_name'];
            $p['require_passenger_number'] = intval($provider['require_passenger_number']);

            if($provider['priceMode']=='free')
                $p['driver_share'] = $provider['purchase_commision']*$provider['driver_share'];
            else
                $p['driver_share'] = $provider['price_per_person']*$provider['driver_share'];

            $p['manual_offline_since'] = $provider['manual_offline_since'];
            $p['daily_on_time'] = $provider['daily_on_time'];
            $p['daily_off_time'] = $provider['daily_off_time'];
            $p['lat'] = $provider['lat'];
            $p['lng'] = $provider['lng'];
            $p['selected_for_slideshow'] = intval($provider['selected_for_slideshow']);
            $p['medias'] = [];
            foreach ($provider->medias as $media)
            {
                if($media->external)
                    $p['medias'][] = $media->media_url;
                else
                    $p['medias'][] = URL::to('/'.$media->media_url);
            }
            $arr['data']['providers'][] = $p;
        }
        return response()->json($arr);

    }
    else
    {
        $arr = ["success"=>false,"error"=>"wrong_code","data"=>"کد رورد صحیح نیست."];
        return response()->json($arr);
    }
});

Route::middleware('driver_auth')->post('/send_iban', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'text'=>'required'
        ],
        [
            'text.required'=>'لطفا شماره شبا را وارد کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }
    $driver_id = $request->get("auth_user_id");
    $driver = App\Driver::find($driver_id);
    $text = $request->input('text');
    $driver->iban_number = $text;

    $result = $driver->save();
    if($result)
    {
        $arr = ["success"=>true,"data"=>"شماره شبا با موفقیت ذخیره شد."];
        return response()->json($arr);
    }
    else
    {
        $arr = ["success"=>false,"error"=>"wrong_code","data"=>"عملیات ناموفق"];
        return response()->json($arr);
    }
});

Route::post('/updateprofile', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'access_token' => 'required',
            'avatar'=>'required'
        ],
        [
            'avatar.required'=>'لطفا عکس کاربری خود را انتخاب کنید.'
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }


    $access_token = $request->input("access_token");
    $driver = App\Driver::where('access_token',$access_token)->get();

    $insuranceIpload =false;
    $avatarUpload=false;
    $CertificatesUpload=false;

    $avatar = $request->file('avatar');
    $state = $request->input('state');
    $city = $request->input('city');
    $bank = $request->input('bank');
    $iban = $request->input('iban');
    $national_id = $request->input('national_id');

    if ($request->hasFile('avatar')) {

        $destinationPath = 'uploads/driver_profile_pics';


        /*$insurance = $request->file('insurance');
        if (!empty($insurance)) {
            $fname = str_random(12) . '.' . $insurance->getClientOriginalExtension();
            $insuranceIpload = $insurance->move($destinationPath, $fname);
            $finalInsurance = $destinationPath . '/' . $fname;
        }*/
        $avatar = $request->file('avatar');
        if (!empty($avatar)) {
            $fnameAvatar = str_random(12) . '.' . $avatar->getClientOriginalExtension();
            $avatarUpload = $avatar->move($destinationPath, $fnameAvatar);
            $finalAvatar = $destinationPath . '/' . $fnameAvatar;
        }
        /* $Certificates = $request->file('Certificates');
         if (!empty($Certificates)) {
             $fnameCertificates = str_random(12) . '.' . $Certificates->getClientOriginalExtension();
             $CertificatesUpload =   $Certificates->move($destinationPath, $fnameCertificates);
             $finalCertificates = $destinationPath . '/' . $fnameCertificates;
         }*/
    }
    //if( ($insuranceIpload == true) || ($avatarUpload == true) || ($CertificatesUpload == true ) )
    if( $avatarUpload == true)
    {
        $driver->first()->profile_pic_url = $finalAvatar ;
        // $driver->first()->insurance_pic_url = $finalInsurance ;
        // $driver->first()->certificates_pic_url = $finalCertificates ;
        $driver->first()->iban_number = $iban;
        $driver->first()->bank_name = $bank;
        $driver->first()->national_code = $national_id ;
        $driver->first()->state_id = $state;
        $driver->first()->city_id = $city;
        $driver->first()->save();

        $arrList = ["list"=>[
            "id"=> $driver->first()->id,
            "access_token"=>$driver->first()->access_token,
            "name"=> $driver->first()->name,
            "last_name"=> $driver->first()->last_name,
            "phone_number"=> $driver->first()->phone_number,
            "profile_pic_url"=>URL::to('/'. $driver->first()->profile_pic_url),
            "iban"=> $driver->first()->iban_number,
            "car_type"=> $driver->first()->car_type,
            "car_color"=> $driver->first()->car_color,
            "license_plate"=> $driver->first()->license_plate,
            'bank_name'=>$driver->first()->bank_name,
            'national_code'=>$driver->first()->national_code,
            'state'=>$driver->first()->state_id,
            'city'=>$driver->first()->city_id,

        ]];
        $arr = ["success"=>true,'list_data'=>$arrList,"data"=>"ارسال با موفقیت انجام شد."];
        return response()->json($arr);
    }

    else
    {
        $arr = ["success"=>false,"data"=>"ارسال اطلاعات با موفقیت انجام نشد."];
        return response()->json($arr);
    }
});
Route::post('/specialprofile', function (Request $request)
{
    $validator = Validator::make($request->all(),
        [
            'access_token' => 'required',
            'licensePlate'=>'required',
            'carCardOne'=>'required',
            'carCertifictOne'=>'required',
        ],
        [
            'licensePlate.required'=>'شماره پلاک را کامل کنید.',
            'carCardOne.required'=>'لطفا تصویر کارت خودرو را انتخاب کنید.',
            'carCertifictOne.required'=>'لطفا تصویر گوای نامه خود را انتخاب کنید.',
        ]
    );
    if($validator->fails())
    {
        $arr = ["success"=>false,"data"=>$validator->errors()->first()];
        return response()->json($arr);
    }


    $access_token = $request->input("access_token");
    $driver = App\Driver::where('access_token',$access_token)->get();

    $carCardOneUpload =false;
    $carCardTowUpload=false;
    $carCertifictOneUpload=false;
    $carCertifictTowUpload=false;


    $carType = $request->input('carType');
    $carColor = $request->input('carColor');
    $licensePlate = $request->input('licensePlate');

    $carCardOne = $request->file('carCardOne');
    $carCardTow = $request->file('carCardTow');

    $carCertifictOne = $request->file('carCertifictOne');
    $carCertifictTow = $request->file('carCertifictTow');


    if ($request->hasFile('carCardOne')) {

        $destinationPath = 'uploads/driver_profile_pics';

        $carCardOne = $request->file('carCardOne');
        if (!empty($carCardOne)) {
            $fnameCarCardOne = str_random(12) . '.' . $carCardOne->getClientOriginalExtension();
            $carCardOneUpload = $carCardOne->move($destinationPath, $fnameCarCardOne);
            $finalCarCardOne = $destinationPath . '/' . $fnameCarCardOne;
        }

        if (!empty($carCardTow)) {
            $fnameCarCardTow = str_random(12) . '.' . $carCardTow->getClientOriginalExtension();
            $carCardTowUpload = $carCardTow->move($destinationPath, $fnameCarCardTow);
            $finalCarCardTow = $destinationPath . '/' . $fnameCarCardTow;
        }
        if (!empty($carCertifictOne)) {
            $fnameCarCertifictOne = str_random(12) . '.' . $carCertifictOne->getClientOriginalExtension();
            $carCertifictOneUpload = $carCertifictOne->move($destinationPath, $fnameCarCertifictOne);
            $finalCarCertifictOne = $destinationPath . '/' . $fnameCarCertifictOne;
        }
        if (!empty($carCertifictTow)) {
            $fnameCarCertifictTow = str_random(12) . '.' . $carCertifictTow->getClientOriginalExtension();
            $carCertifictTowUpload = $carCertifictOne->move($destinationPath, $fnameCarCertifictTow);
            $finalCarCertifictTow = $destinationPath . '/' . $fnameCarCertifictTow;
        }


    }
    //if( ($insuranceIpload == true) || ($avatarUpload == true) || ($CertificatesUpload == true ) )
    if( $carCardOneUpload == true)
    {
        $driver->first()->car_card_one = $carCardOneUpload ;
        $driver->first()->car_card_tow = $carCardOneUpload ;
        $driver->first()->car_certifict_one = $carCertifictOneUpload ;
        $driver->first()->car_certifict_tow = $carCertifictTowUpload ;
        // $driver->first()->insurance_pic_url = $finalInsurance ;
        // $driver->first()->certificates_pic_url = $finalCertificates ;
        $driver->first()->car_type = $carType;
        $driver->first()->car_color = $carColor;
        $driver->first()->license_plate = $licensePlate ;
        $driver->first()->save();

        $arrList = ["list"=>[
            "id"=> $driver->first()->id,
            "access_token"=>$driver->first()->access_token,
            "name"=> $driver->first()->name,
            "last_name"=> $driver->first()->last_name,
            "phone_number"=> $driver->first()->phone_number,
            "profile_pic_url"=>URL::to('/'. $driver->first()->profile_pic_url),
            "iban"=> $driver->first()->iban_number,
            "car_type"=> $driver->first()->car_type,
            "car_color"=> $driver->first()->car_color,
            "license_plate"=> $driver->first()->license_plate,
            'bank_name'=>$driver->first()->bank_name,
            'national_code'=>$driver->first()->national_code,
            'state'=>$driver->first()->state_id,
            'city'=>$driver->first()->city_id,

        ]];
        $msg = "تبریک !" .'<br>'. "شما کاربر ویژه شدید.";
        $arr = ["success"=>true,'list_data'=>$arrList,"data"=>$msg];
        return response()->json($arr);
    }

    else
    {
        $arr = ["success"=>false,"data"=>"ارسال اطلاعات با موفقیت انجام نشد."];
        return response()->json($arr);
    }
});


Route::post('/getstate', function (Request $request)
{
    $States = State::all();
    //$States = $States->get();
    $output = [];
    foreach ($States as $State)
    {
        $i = [];
        $i['id'] = $State->id;
        $i['title'] = $State->persian_name;
        $output[] = $i;
    }
    $arr = ["success"=>true,"data"=>$output];
    return response()->json($arr);
});
Route::post('/getcity', function (Request $request)
{
    $id = $request->input("state-id");
    $citys = City::where('state_id',$id)->get();
    //$States = $States->get();
    $output = [];
    foreach ($citys as $city)
    {
        $i = [];
        $i['id'] = $city->id;
        $i['title'] = $city->persian_name;
        $output[] = $i;
    }
    $arr = ["success"=>true,"data"=>$output];
    return response()->json($arr);
});

