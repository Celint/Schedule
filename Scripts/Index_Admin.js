var exponent = "010001";
var modulus = "82702BFEF781D17F03A9BA59F4FFC8FC30A0501F8C003EFEE3DFB8845FD6CBE7BA9D5A2D21C8939E0A5E2DFD37B08B6FF5C950FE0B4133C216C52DC0980E9989FABDE846749D8DE698205CA4AD6658FF17C6360E62324A6F59B6DB47F933B54261B0D6A30D806FC53CEB18D0182B0AEE017FF56D7104489023AE2A285C1FFAF3";
var authorities;
//jquery事件绑定
$(function () {
    setHeight();
    getName();
    getAuthorities();
    setTimeout(function () {
        alert("在处理完你的事务后，请及时退出登录！");
    }, 1500);
});
window.onresize = function () {
    setHeight();
}
window.onclose = function () {
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        data: { action: "logout_admin" }
    });
}
function setHeight() {
    var height_window = window.innerHeight;
    var elements = new Array($("dl"), $("#content"), $("iframe"));
    for (var i = 0; i < elements.length; i++) {
        var top = elements[i].offset().top;
        var padding_top = parseInt(elements[i].css("padding-top"));
        var padding_bottom = parseInt(elements[i].css("padding-bottom"));
        var margin_bottom = parseInt(elements[i].css("margin-bottom"));
        elements[i].height(height_window - top - padding_top - padding_bottom - margin_bottom);
    }
}

function getName() {
    if (!isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/Admin.ashx",
        data: { action: "getname" },
        timeout: 3000,
        success: function (data) {
            $("#adminname").text(data);
        }
    });
}
function getAuthorities() {
    if (!isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "../Handler/Admin.ashx",
        data: { action: "getauthority" },
        success: function (data) {
            authorities = JSON.parse(data);
            var funcs = $("#functions > a");
            var funcindex;
            for (var i = 0; i < 5; i++) {
                if (authorities[i] != null) {
                    funcindex = 4 - i;
                }
                else {
                    $(funcs[4 - i]).hide();
                }
            }
            changeFunction(funcindex);
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}

function changeFunction(index) {
    if (!isLogined()) {
        return;
    }
    if (index == 5) {
        displayPwd();
        return;
    }
    var funcs = $("#functions > a");
    funcs.removeClass("function-a_hover");
    $(funcs[index]).addClass("function-a_hover");
    var funstr = $(funcs[index]).text();
    $("dl").html("<dt>" + funstr + "</dt>");
    $("#navi").text(funstr + " 》");
    switch (index) {
        case 0:
            $("iframe")[0].src = "Manage/Schedule.aspx";
            break;
        case 1:
            $("iframe")[0].src = "Manage/ManageUser.aspx";
            break;
        case 2:
            $("iframe")[0].src = "Manage/ManageAdmin.aspx";
            break;
        case 3:
            $("iframe")[0].src = "Manage/CheckLogs.aspx";
            break;
        case 4:
            $("iframe")[0].src = "Manage/MonitorSystem.aspx";
            break;
        default:
            break;
    }
}

function registerAffairs(affairs, hides) {
    var dl = $("dl"), html = "";
    html = html + dl.children()[0].outerHTML;
    for (var i = 0; i < affairs.length; i++) {
        html = html + "<dd><a href=\"" + affairs[i].href + "\" class=\"side-a\" >" + affairs[i].text + "</a></dd>";
    }
    dl.html(html);
    if (hides) {
        var _affairs = $("#side a");
        for (var i = 0; i < hides.length; i++) {
            $(_affairs[hides[i]]).hide();
        }
    }
}
function changeAffair(index) {
    var result = $("iframe")[0].contentWindow.changeAffair(index);
    if (result == undefined || result) {
        var affairs = $("#side a");
        affairs.removeClass("side-a_hover");
        $(affairs[index]).addClass("side-a_hover");
        var text = $("#navi").text();
        $("#navi").text(text.substring(0, text.indexOf('》') + 1) + $(affairs[index]).text());
    }
}
function registerFloatingNode(node, completecall) {
    var backgound = $(".background").html("");
    backgound.append(node);
    if (completecall) {
        completecall();
    }
}
function showFloatingNode(completecall) {
    $(".background").show();
    if (completecall) {
        completecall();
    }
}
function hideFloatingNode(completecall) {
    $(".background").fadeOut(1000);
    if (completecall) {
        completecall();
    }
}

function logout() {
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        data: { action: "logout_admin" },
        timeout: 500,
        complete: function () {
            location.href = "Login.aspx";
        }
    });
}
function isLogined() {
    var islogined = true;
    $.ajax({
        type: "POST",
        async: false,
        url: "../Handler/Login.ashx",
        data: { action: "islogined_admin" },
        success: function (data) {
            if (data != "True") {
                alert('你还未登录或登录信息已过期！');
                location.href = "Login.aspx";
                islogined = false;
            }
        }
    });
    return islogined;
}

function displayPwd() {
    $("#alterpwd :password").val("");
    $("#alterpwd .span_next").hide();
    $("#alterpwd > .message").stop(true, true);
    $("#alterpwd-background").show();
}
function pwd_keypress() {
    if (event.keyCode == 13) {
        event.preventDefault();
        confirmAlterPwd();
    }
}
function pwdnew_blur() {
    var pwds = $("#alterpwd :password");
    if (pwds[0].value != "" && pwds[1].value.length < 8) {
        $(pwds[1]).next().css("display", "inline");
        showMessage("密码长度不符合要求！");
    }
}
function pwdrepeat_blur() {
    var pwds = $("#alterpwd :password");
    if (pwds[0].value != "" && pwds[1].value != "" && pwds[2].value != pwds[1].value) {
        $(pwds[2]).next().css("display", "inline");
        showMessage("确认密码与新密码不同！");
    }
}
function hideNext() {
    $(event.currentTarget).next().hide();
}
function confirmAlterPwd() {
    $("#alterpwd-button").attr("disabled", "disabled");
    $("#alterpwd").unbind("keypress");
    if (!isLogined()) {
        return;
    }
    $(".message").stop(true, true);
    var pwds = $("#alterpwd :password");
    pwds.next().hide();
    if (!judgePwdInput(pwds)) {
        alterPwdFall();
        return;
    }
    setMaxDigits(131); //请保持该方法参数值为131
    var rsakey = new RSAKeyPair(exponent, "", modulus);
    var oldpwd = encryptedString(rsakey, pwds[0].value); //使用RSA加密密码，防止密码被盗
    var newpwd = encryptedString(rsakey, pwds[1].value);
    $.ajax({
        type: "POST",
        url: "../Handler/Admin.ashx",
        data: { action: "alterpassword", oldpwd: oldpwd, newpwd: newpwd },
        timeout: 3000,
        success: function (data) {
            if (data == "true") {
                showMessage("修改成功，请重新登录！");
                setTimeout(function () {
                    logout();
                }, 1000);
            }
            else {
                if (data[0] == '原') {
                    $(pwds[0]).next().css("display", "inline");
                }
                if (data[0] == '新') {
                    $(pwds[1]).next().css("display", "inline");
                }
                showMessage(data);
                alterPwdFall();
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                showMessage("请求超时，请重试！");
            }
            else {
                showMessage("系统错误，请联系管理员！");
            }
            alterPwdFall();
        }
    });
}
function judgePwdInput(pwdinputs) {
    var strs = new Array("原", "新", "确认");
    var wrongmsg = "";
    for (var i = 0; i < 3; i++) {
        if (pwdinputs[i].value.length == 0) {
            $(pwdinputs[i]).next().css("display", "inline");
            wrongmsg = wrongmsg + strs[i] + "密码、";
        }
    }
    if (wrongmsg.length != 0) {
        wrongmsg = "请输入" + wrongmsg.substring(0, wrongmsg.length - 1) + "！";
        showMessage(wrongmsg);
        return false;
    }
    var pwdinputs = $("#alterpwd :password");
    if (pwdinputs[1].value.length < 8) {
        $(pwdinputs[1]).next().css("display", "inline");
        showMessage("密码长度不符合要求！");
        return false;
    }
    if (pwdinputs[2].value != pwdinputs[1].value) {
        $(pwdinputs[2]).next().css("display", "inline");
        showMessage("确认密码与新密码不同！");
        return false;
    }
    return true;
}
function alterPwdFall() {
    $("#alterpwd-button").removeAttr("disabled");
    $("#alterpwd").keypress(function () { pwd_keypress(); });
}
function cancelAlterPwd() {
    $("#alterpwd-background").fadeOut(1000);
}
function showMessage(message) {
    var msgelement = $("#alterpwd > .message");
    msgelement.stop(true, true);
    msgelement.text(message);
    msgelement.fadeIn(500);
    msgelement.fadeOut(4000);
}
