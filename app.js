/**
 * Created by hoil
 * 세종대 강의 조회하기
 */
var http = require('http');
var url = require('url');
var async = require('async');
var querystring = require('querystring');
var cookies = [];
var postOptions = {
    host: 'portal.sejong.ac.kr',
    path: '/jsp/login/login_action.jsp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 0,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': cookies,
        'Referer': 'https://portal.sejong.ac.kr/jsp/login/uisloginSSL.jsp',
        'Upgrade-Insecure-Requests': 1
    }
};
var getOptions = {
    host: '',
    path: '',
    method: 'GET',
    headers:{
        'Cookie': cookies,
        'Upgrade-Insecure-Requests': 1,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0'
    }
};

function updateCookie(setCookie){
    for(var i = 0; i<setCookie.length;i++){
        cookies.push(setCookie[i].split(";")[0]);
    }
};

function convertPostData(data){
    var processedData = querystring.stringify(data);
    postOptions.headers["Content-Length"] = Buffer.byteLength(processedData);

    return processedData;
};

var getLogin = function(){
    /*
        첫 접속시 WMONID, PO1_JSESSIONID를 얻는다

        Request
            GET /jsp/login/uisloginSSL.jsp HTTP/1.1
            Host: portal.sejong.ac.kr

        Response
            Set-Cookie: WMONID, PO1_JSESSIONID
    */
    return new Promise (function(resolve, reject){
        http.get("http://portal.sejong.ac.kr/jsp/login/uisloginSSL.jsp",function(res) {
            if(res.statusCode != 200){
                reject(Error("1. Response of login page status code is not 200 OK " + " with statusCode " + res.statusCode));
            }
            res.setEncoding('utf8');
            updateCookie(res.headers["set-cookie"]);

            console.log("1. GET /login " + res.statusCode);
            console.log("===== cookie =====");
            console.log(cookies);
            resolve();
        });
    });
};

var postLogin = function(){
    return new Promise(function(resolve, reject){
        var loginForm = {
            "rtUrl": "uis.sejong.ac.kr%2Fapp%2Fsys.Login.servj%3FstrCommand%3DSSOLOGIN",
            "loginUrl": "uisloginSSL.jsp",
            "id": "",
            "password": ""
        };
        /*
         아이디, 비밀번호를 입력하여 로그인 한다

         Request
         POST /jsp/login/login_action.jsp HTTP/1.1
         Host: portal.sejong.ac.kr
         Cookie: WMONID, PO1_JSESSIONID

         Body: {
         rtUrl: 'https://portal.sejong.ac.kr/jsp/login/login_action.jsp',
         loginUrl: 'uisloginSSL.jsp',
         id:,
         password:

         Response
         Set-Cookie: ssotoken
         */
        var loginPostData = convertPostData(loginForm);
        var req_login = http.request(postOptions, function(res){
            if(res.statusCode != 200){
                reject(Error("2. Response status Code of 'Post /login' is not 200 OK " + " with statusCode " + res.statusCode));
            }
            res.setEncoding('utf8');
            updateCookie(res.headers["set-cookie"]);

            console.log("2. POST /login " + res.statusCode);
            console.log("===== cookie =====");
            console.log(cookies);

            resolve();
        });
        req_login.write(loginPostData);
        req_login.end();
    });

};

var getSSOLogin = function(){
    /*
        새로운 WMONID 값과 SJ_JSESSIONID, COOKIE_USER_INFO, COOKIE_MENU_SYS_ID를 받는다.

        Request
            GET /app/sys.Login.servj?strCommand=SSOLOGIN HTTP/1.1
            Host: uis.sejong.ac.kr
            Cookie: ssotoken

        Response
            Set-Cookie: WMONID, SJ_JSESSIONID, COOKIE_MENU_SYS_ID, COOKIE_USER_INFO

    */
    return new Promise(function (resolve, reject){
        getOptions.host = 'uis.sejong.ac.kr';
        getOptions.path = '/app/sys.Login.servj?strCommand=SSOLOGIN';
        /*
         현재 Cookie : [WMONID, PO1_JSESSIONID, SSO_TOKEN]

         실제로 ssotoken만 전송하므로 쿠키에서 0,1번째 값을 제외.
         */
        getOptions.headers["Cookie"].splice(0,2);

        var req_SSO = http.request(getOptions, function(res){
            if(res.statusCode != 200){
                reject(Error("2. Response status Code of 'getSSO' is not 200 OK " + " with statusCode " + res.statusCode));
            }
            res.setEncoding('utf8');
            var currentCookie = res.headers["set-cookie"];

            for(var i = 0; i<currentCookie.length;i++){
                cookies.push(currentCookie[i].split(";")[0]);
            }

            console.log("3. GET /SSOLogin " + res.statusCode);
            console.log("===== cookie =====");
            console.log(cookies);

            resolve();
        });
        req_SSO.end();
    });

};

var postForLectureData = function(){

    return new Promise(function(resolve, reject){
        var schsueForm = {
            "pgauth_sys_id":"SELF_STUD",
            "pgauth_sub_id":"SELF_SUB_30",
            "pgauth_menu_id":"SELF_MENU_10",
            "pgauth_pg_id":"SueOpenTimeQ",
            "pgauth_self_yn":"Y",
            "pgauth_orgn_clsf_map_cd":"MAP-001",
            "pgauth_orgn_clsf_ctrl_yn":"Y",
            "pgauth_auth_depth_cd":"9",
            "pgauth_upd_posb_yn":"Y",
            "pgauth_dwn_posb_yn":"Y",
            "pguser_member_no":"101954",
            "pguser_login_dt":"",
            "pgauth_login_dt":"",
            "param_member_no":"101954",
            "param_login_dt":"",
            "strCommand":"List",
            "strOrgn":20,
            "strYear":2017,
            "strSmtCd":10,
            "strDeptCd":2920,
            "strCuriTypeCd":"",
            "strCuriNm":"",
            "strSltDomainCd":"",
            "strYearSmt":"2017/10",
            "strCuriNo":"",
            "strClass":	"",
            "strSmtNm":	"",
            "strSltDeptCd":	"",
            "strPlanRegYn":	"",
            "strEmpNm":	"",
            "strCorsScheGrpCd":0,
            "strLangChk":0
        };
        var schsuePostData = convertPostData(schsueForm);

        postOptions.host="uis.sejong.ac.kr";
        postOptions.path="/app/modules/sch_sue/sch_sue.SueOpenTimeQ.do";

        var schsueOptions = {
            "Accept": "*/*",
            "req-protocol": "urlencoded",
            "res-protocol": "json",
            "eXria-Version": "eXria.1.0",
            "req-charset": "UTF-8",
            "res-charset": "utf-8",
            "Referer": "http://uis.sejong.ac.kr/app/modules/sch_sue/SueOpenTimeQ.xrf"
        };
        for (var key in schsueOptions){
            postOptions["headers"][key] = schsueOptions[key];
        }
        var req_schsue = http.request(postOptions, function(res){
            if(res.statusCode != 200){
                reject(Error("2. Response status Code of 'Post For lecture data' is not 200 OK " + " with statusCode " + res.statusCode));
            }
            res.setEncoding('utf8');

            console.log("4. postForTimestamp " + res.statusCode);
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
        });
        req_schsue.write(schsuePostData);
        req_schsue.end();
    });
};

getLogin()
    .then(function(){
        return postLogin();
    }, function (error) {
        console.error(error);
    })
    .then(function(){
        return getSSOLogin();
    }, function (error) {
        console.error(error);
    })
    .then(function(){
        return postForLectureData();
    }, function (error) {
        console.error(error);
    });