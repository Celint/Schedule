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
    $("#loginbutton").attr("disabled", "disabled");
    interval = startAnimation();
    var sno = $("#sno");
    var pwd = $("#password");
    var vcode = $("#vcode");
    sno.removeClass("inputarea_wrong");
    pwd.removeClass("inputarea_wrong");
    vcode.removeClass("inputarea_wrong");
    sno.next().hide();
    pwd.next().hide();
    vcode.next().hide();
    if (judgeInput(sno, pwd, vcode)) {
        login(sno, pwd, vcode)
    }
    else {
        loginFall();
    }
}
//输入框获得焦点事件
function inputFocus() {
    $(event.currentTarget).parent().addClass("inputarea_focus");
}
//输入框失去焦点事件
function inputBlur() {
    $(event.currentTarget).parent().removeClass("inputarea_focus");
}
//隐藏提示信息
function hidePrompt() {
    var inputarea = $(event.currentTarget).parent();
    inputarea.removeClass("inputarea_wrong");
    inputarea.next().fadeOut(2000);
}

//判断输入框是否都已填写，如有未填写会显示提示信息
function judgeInput(sno, password, verifycode) {
    var allpass = true;
    if (sno.children("input").val().length == 0) {
        showPrompt("请输入学号！", sno.next());
        allpass = false;
    }
    if (password.children("input").val().length == 0) {
        showPrompt("请输入密码！", password.next());
        allpass = false;
    }
    if (verifycode.children("input").val().length == 0) {
        showPrompt("请输入验证码！", verifycode.next());
        allpass = false;
    }
    return allpass;
}
//发送登录请求
function login(sno, password, verifycode) {
    var pwd = password.children("input").val() + verifycode.children("input").val(); //将验证码作为随机盐值追加到密码后面，确保他人无法通过截得的信息作为登录凭证非法登录
    setMaxDigits(131); //请保持该方法参数值为131
    var rsakey = new RSAKeyPair(exponent, "", modulus);
    var encodedpwd = encryptedString(rsakey, pwd); //使用RSA加密密码，防止密码被盗
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        timeout: 5000,
        data: { action: "login_user", sno: sno.children("input").val(), pwd: encodedpwd, vcode: verifycode.children("input").val() },
        success: function (data) {
            if (data == "true") {
                loginSuccess();
            }
            else {
                if (data[0] == '学' || data[0] == '该') {
                    showPrompt(data, sno.next())
                }
                else if (data[0] == '密') {
                    showPrompt(data, password.next())
                }
                else if (data[0] == '验') {
                    showPrompt(data, verifycode.next())
                }
                else {
                    alert(data);
                }
                loginFall();
                refreshVCode();
            }
        },
        error: function (response, status) {
            if (status == "error") {
                alert("系统错误，请联系管理员！");
                //var newwindow = window.open('', '_blank');
                //newwindow.document.write(response.responseText); //查看错误信息
            }
            loginFall();
            refreshVCode();
        }
    });
}

//显示提示信息
function showPrompt(message, promptarea) {
    promptarea.children("p").text(message);
    promptarea.fadeIn(500);
    promptarea.css("display", "inline-block");
    promptarea.prev().addClass("inputarea_wrong");
}
//刷新验证码
function refreshVCode() {
    var vcodetxt = $("#vcode > input");
    vcodetxt.val("");
    vcodetxt.next().attr("src", "../Handler/Verification Code.ashx?t=" + (new Date()).valueOf());
    vcodetxt.focus();
}
//开始动画
function startAnimation() {
    return setInterval(function () {
        var button = $("#loginbutton");
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
    var button = $("#loginbutton");
    button.val("登录成功");
    button.css("padding-left", "64px");
    setTimeout(function () {
        window.location.replace("Index.aspx");
    }, 700);
}
//登录失败
function loginFall() {
    clearInterval(interval);
    var loginbutton = $("#loginbutton");
    loginbutton.val("登录");
    loginbutton.removeAttr("disabled");
    document.onkeypress = function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            button_click();
        }
    };
}