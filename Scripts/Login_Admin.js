var interval;
var exponent = "010001";
var modulus = "82702BFEF781D17F03A9BA59F4FFC8FC30A0501F8C003EFEE3DFB8845FD6CBE7BA9D5A2D21C8939E0A5E2DFD37B08B6FF5C950FE0B4133C216C52DC0980E9989FABDE846749D8DE698205CA4AD6658FF17C6360E62324A6F59B6DB47F933B54261B0D6A30D806FC53CEB18D0182B0AEE017FF56D7104489023AE2A285C1FFAF3";
//按键事件
document.onkeypress = function () {
    if (event.keyCode == 13) {
        event.preventDefault();
        button_click();
    }
};
//登录按钮单击事件
function button_click() {
    document.onkeypress = null;
    $("#button > input").attr("disabled", "disabled");
    interval = startAnimation();
    var acct = $("#account > input");
    var pwd = $("#password > input");
    var vcode = $("#vcode > input");
    acct.next().hide();
    pwd.next().hide();
    vcode.next().hide();
    $("#message").stop(true, true);
    if (judgeInput(acct, pwd, vcode)) {
        login(acct, pwd, vcode)
    }
    else {
        loginFall();
    }
}
//隐藏输入框后面的“*”
function hideNext() {
    $(event.currentTarget).next().hide();
}

//判断输入框是否都已填写，如有未填写会显示提示信息
function judgeInput(account, password, verifycode) {
    var wrongmsg = "";
    if (account.val().length == 0) {
        account.next().css("display", "inline-block");
        wrongmsg = wrongmsg + "账号、";
    }
    if (password.val().length == 0) {
        password.next().css("display", "inline-block");
        wrongmsg = wrongmsg + "密码、";
    }
    if (verifycode.val().length == 0) {
        verifycode.next().css("display", "inline-block");
        wrongmsg = wrongmsg + "验证码、";
    }
    if (wrongmsg.length != 0) {
        wrongmsg = "请输入" + wrongmsg.substring(0, wrongmsg.length - 1) + "！";
        showMessage(wrongmsg);
        return false
    }
    else {
        return true;
    }
}
//获取RSA密钥
function getEncodeKey() {
    var key;
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        async: false,
        timeout: 5000,
        data: { action: "getkey" },
        success: function (data) {
            key = data;
        },
        error: function (response, status) {
            if (status == "timeout") {
                showMessage("请求超时，请重试！");
            }
            else {
                showMessage("系统错误，请联系管理员！");
            }
        }
    });
    return key;
}
//发送登录请求
function login(account, password, verifycode) {
    var pwd = password.val() + verifycode.val(); //将验证码作为随机盐值追加到密码后面，确保他人无法通过截得的信息作为登录凭证非法登录
    setMaxDigits(131); //请保持该方法参数值为131
    var rsakey = new RSAKeyPair(exponent, "", modulus);
    var encodedpwd = encryptedString(rsakey, pwd); //使用RSA加密密码，防止密码被盗
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        timeout: 5000,
        data: { action: "login_admin", account: account.val(), pwd: encodedpwd, vcode: verifycode.val() },
        success: function (data) {
            if (data == "true") {
                loginSuccess();
            }
            else {
                if (data[0] == '验') {
                    verifycode.next().css("display", "inline-block");
                }
                else if (data[0] == '账') {
                    account.next().css("display", "inline-block");
                    password.next().css("display", "inline-block");
                }
                showMessage(data);
                loginFall();
                refreshVCode();
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                showMessage("请求超时，请重试！");
            }
            else {
                showMessage("系统错误，请联系管理员！");
            }
            //var newwindow = window.open('', '_blank');
            //newwindow.document.write(response.responseText); //查看错误信息
            loginFall();
            refreshVCode();
        }
    });
}

//提示信息
function showMessage(message) {
    var msgarea = $("#message");
    msgarea.text(message);
    msgarea.fadeIn(500);
    msgarea.fadeOut(4000);
}
//刷新验证码
function refreshVCode() {
    var vcodetxt = $("#vcode > input");
    vcodetxt.val("");
    vcodetxt.prev().attr("src", "../Handler/Verification Code.ashx?t=" + (new Date()).valueOf());
}
//开始动画
function startAnimation() {
    return setInterval(function () {
        var button = $("#button > input");
        var button_val = button.val();
        if (button_val.length < 5) {
            button.val(button_val + "·");
        }
        else {
            button.val("登录");
        }
    }, 500);
}
//登录成功
function loginSuccess() {
    clearInterval(interval);
    showMessage("登录成功，跳转中…");
    $("#button > input").val("登录");
    setTimeout(function () {
        window.location.replace("Index.aspx");
    }, 700);
}
//登录失败
function loginFall() {
    clearInterval(interval);
    var loginbutton = $("#button > input");
    loginbutton.val("登录");
    loginbutton.removeAttr("disabled");
    document.onkeypress = function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            button_click();
        }
    };
}