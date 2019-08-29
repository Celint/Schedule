var exponent = "010001";
var modulus = "82702BFEF781D17F03A9BA59F4FFC8FC30A0501F8C003EFEE3DFB8845FD6CBE7BA9D5A2D21C8939E0A5E2DFD37B08B6FF5C950FE0B4133C216C52DC0980E9989FABDE846749D8DE698205CA4AD6658FF17C6360E62324A6F59B6DB47F933B54261B0D6A30D806FC53CEB18D0182B0AEE017FF56D7104489023AE2A285C1FFAF3";
var timetables;
var timetableindex
//jquery事件绑定
$(function () {
    setHeight();
    getUserName();
    changeContent(0);
    setTimeout(function () {
        alert("在处理完你的事务后，请及时退出登录！");
    }, 1000);
});
window.onresize = function () {
    setHeight();
}
window.onclose = function () {
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        data: { action: "logout_user" }
    });
}
function setHeight() {
    var height_window = window.innerHeight;
    var dl = $("dl");
    var top = dl.offset().top;
    var padding_top = parseInt(dl.css("padding-top"));
    var margin_top = parseInt(dl.css("margin-top"));
    var margin_bottom = parseInt(dl.css("margin-bottom"));
    dl.height(height_window - top - padding_top - margin_bottom);
    $("#content").height(height_window - top + margin_top);
}
function hideNext() {
    $(event.currentTarget).next().hide();
}

function logout() {
    $.ajax({
        type: "POST",
        url: "../Handler/Login.ashx",
        data: { action: "logout_user" },
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
        data: { action: "islogined_user" },
        success: function (data) {
            if (data != "True") {
                alert('你还未登录或登录信息已过期！');
                location.href = "Login.aspx";
                return false;
            }
        }
    });
    return islogined;
}

function getUserName() {
    if (!isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "getusername" },
        timeout: 3000,
        success: function (data) {
            $("#username").text(data);
        }
    });
}

function changeContent(index) {
    if (!isLogined()) {
        return;
    }
    if (!checkTimetableSaved()) {
        return;
    }
    var affairs = $("#affair > a");
    affairs.removeClass("affair-a_hover");
    $(affairs[index]).addClass("affair-a_hover");
    $("#timetable").hide();
    $("#alterpwd").hide();
    $("#alterinfo").hide();
    switch (index) {
        case 0:
            loadTimetables();
            break;
        case 1:
            loadInfo();
            break;
        case 2:
            displayPwd();
            break;
        default:
            break;
    }
}

function loadTimetables() {
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "gettimetables" },
        timeout: 3000,
        success: function (data) {
            dataarray = JSON.parse(data);
            timetables = new Array();
            for (var i = 0; i < dataarray.length / 3; i++) {
                timetables[i] = {
                    id: dataarray[3 * i],
                    name: dataarray[3 * i + 1],
                    status: dataarray[3 * i + 2]
                }
            }
            showTimetables();
            //加载正在使用的课表
            for (var i = 0; i < timetables.length; i++) {
                if (timetables[i].status) {
                    getTimetable(i);
                    break;
                }
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("加载课表超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function showTimetables() {
    var dl = $("#side > dl");
    var html = "<dt>我的课表</dt>";
    for (var i = 0; i < timetables.length; i++) {
        html = html + "<dd><a href=\"javascript: getTimetable(" + i + ")\" class=\"side-a\">" + timetables[i].name + "</a></dd>";
    }
    html = html + "<dd><a href=\"javascript: addTimetable()\" class=\"side-a_add side-a\">添加</a></dd>";
    dl.html(html);
    $("#navi").text("更新空闲课表 》 我的课表");
}
function getTimetable(index) {
    if (!isLogined()) {
        return;
    }
    if (!checkTimetableSaved()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "gettimetabledata", timetableid: timetables[index].id },
        timeout: 3000,
        success: function (data) {
            timetableindex = index;
            displayTimetable(data);
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("加载课表数据超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function displayTimetable(timetabledata) {
    $("#navi").text("更新空闲课表 》 我的课表 》 " + timetables[timetableindex].name);
    var timetablenames = $("#side > dl > dd > a");
    timetablenames.removeClass("side-a_hover");
    $(timetablenames[timetableindex]).addClass("side-a_hover");
    var data_day = timetabledata.split(';');
    var select = $("#timetable select");
    for (var i = 0; i < 7; i++) {
        var data_thisday = data_day[i].split(',');
        for (var j = 0; j < 5; j++) {
            $(select[7 * j + i]).val(data_thisday[j]);
        }
    }
    $("#timetable-p + span").remove(); //防止重复添加
    $("#timetable-p").after("<span>*</span>");
    $("#timetable").show();
    var p = $("#timetable-p");
    p.text(timetables[timetableindex].name);
    if (timetables[timetableindex].status) {
        p.css("color", "red");
        p.next().css("color", "red")
        $("#timetable > :button:first").attr("disabled", "disabled");
    }
    else {
        p.css("color", "black");
        p.next().css("color", "black");
        $("#timetable > :button:first").removeAttr("disabled");
    }
}
function addTimetable() {
    if (!isLogined()) {
        return;
    }
    if (!checkTimetableSaved()) {
        return;
    }
    var timetablename = prompt("请输入空闲课表名称：");
    if (!judgeTimetableName(timetablename)) {
        return;
    }
    var defaultdata = "0,0,0,0,0;0,0,0,0,0;0,0,0,0,0;0,0,0,0,0;0,0,0,0,0;0,0,0,0,0;0,0,0,0,0;";
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "addtimetable", timetablename: timetablename, timetabledata: defaultdata },
        timeout: 5000,
        success: function (data) {
            if (data[0] == 't') {
                var thisindex = timetables.length;
                timetables[thisindex] = {
                    id: parseInt(data.split(':')[1]),
                    name: timetablename,
                    status: false
                }
                showTimetables();
                timetableindex = thisindex;
                displayTimetable(defaultdata);
            }
            else {
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("添加课表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function timetable_p_click() {
    var p = $("#timetable-p");
    var text = $("#timetable-text");
    text.val(p.text());
    p.hide();
    $("#timetable-p + span").css("margin-right", "-14px");
    text.show();
    text.focus();
}
function timetable_text_blur() {
    var p = $("#timetable-p");
    var text = $("#timetable-text");
    if (text.val() != timetables[timetableindex].name) {
        renameTimetable(text.val());
    }
    text.hide();
    $("#timetable-p + span").css("margin-right", "-10px");
    p.show();
}
function renameTimetable(name) {
    if (!isLogined()) {
        return;
    }
    if (!judgeTimetableName(name)) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "renametimetable", timetableid: timetables[timetableindex].id, timetablename: name },
        timeout: 3000,
        success: function (data) {
            if (data == "true") {
                timetables[timetableindex].name = name;
                $("#timetable-p").text(name);
                $($("#side > dl > dd > a")[timetableindex]).text(name);
                $("#navi").text("更新空闲课表 》 我的课表 》 " + name);
            }
            else {
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("重命名超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function judgeTimetableName(name) {
    if (name == undefined) {
        return false;
    }
    else if (name == "") {
        alert("课表名为空！");
        return false;
    }
    else if (name.length > 7) {
        alert("课表名太长！");
        return false;
    }
    else {
        for (var i = 0; i < timetables.length; i++) {
            if (name == timetables[i].name) {
                alert("课表名重复！");
                return false;
            }
        }
    }
    return true;
}
function select_change() {
    $("#timetable-p + span").show();
}
function activeTimetable() {
    var activebutton = $(event.currentTarget);
    activebutton.attr("disabled", "disabled");
    if (!isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "activetimetable", timetableid: timetables[timetableindex].id },
        timeout: 3000,
        success: function (data) {
            if (data == "true") {
                for (var i = 0; i < timetables.length; i++) {
                    if (timetables[i].status) {
                        timetables[i].status = false;
                        break;
                    }
                }
                timetables[timetableindex].status = true;
                $("#timetable-p").css("color", "red");
                $("#timetable-p + span").css("color", "red");
            }
            else {
                alert(data);
                activebutton.removeAttr("disabled");
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("激活课表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            activebutton.removeAttr("disabled");
        }
    });
}
function allSpare() {
    $("#timetable select").val(0);
    $("#timetable-p + span").show();
}
function allOccupied() {
    $("#timetable select").val(1);
    $("#timetable-p + span").show();
}
function saveTimetable() {
    var savebutton = $(event.currentTarget);
    savebutton.attr("disabled", "disabled");
    if (!isLogined()) {
        return;
    }
    if ($("#timetable-p + span").css("display") == "none") {
        savebutton.removeAttr("disabled");
        return;
    }
    var data_day = new Array(7);
    var select = $("#timetable select");
    for (var i = 0; i < 7; i++) {
        var data_thisday = new Array(5);
        for (var j = 0; j < 5; j++) {
            data_thisday[j] = select[7 * j + i].value;
        }
        data_day[i] = data_thisday.join(',');
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "updatetimetabledata", timetableid: timetables[timetableindex].id, timetabledata: data_day.join(';') + ';' },
        timeout: 3000,
        success: function (data) {
            if (data == "true") {
                alert("保存成功！");
                $("#timetable-p + span").hide();
            }
            else {
                alert(data);
            }
            savebutton.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("保存课表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            savebutton.removeAttr("disabled");
        }
    });
}
function deleteTimetable() {
    var deletebutton = $(event.currentTarget);
    deletebutton.attr("disabled", "disabled");
    if (!isLogined()) {
        return;
    }
    if (timetables[timetableindex].status) {
        alert("当前正在使用的课表不可删除！");
        deletebutton.removeAttr("disabled");
        return;
    }
    if (!confirm("确定要删除此课表？")) {
        deletebutton.removeAttr("disabled");
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "deletetimetable", timetableid: timetables[timetableindex].id },
        timeout: 3000,
        success: function (data) {
            timetables.splice(timetableindex, 1);
            showTimetables();
            //加载正在使用的课表
            for (var i = 0; i < timetables.length; i++) {
                if (timetables[i].status) {
                    getTimetable(i);
                    break;
                }
            }
            deletebutton.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("删除课表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            deletebutton.removeAttr("disabled");
        }
    });
}
function checkTimetableSaved() {
    if ($("#timetable").css("display") != "none" && $("#timetable-p + span").css("display") != "none") {
        return confirm("课表还未保存，确定要离开吗？");
    }
    else {
        return true;
    }
}

function loadInfo() {
    var html1 = "<dd><a href=\"javascript: alterInfo()\" class=\"side-a\" >确认</a></dd>";
    var html2 = "<dd><a href=\"javascript: changeContent(0)\" class=\"side-a\" >取消</a></dd>";
    $("#side > dl").html("<dt>修改信息</dt>" + html1 + html2);
    $("#navi").text("修改个人信息 》 我的信息");
    $("#alterinfo").show();
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "getuserinfo" },
        timeout: 3000,
        success: function (data) {
            displayInfo(data);
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("加载用户信息超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function displayInfo(data) {
    var info = JSON.parse(data);
    var texts = $("#alterinfo :text");
    texts[0].value = $("#username").text();
    if (info[0] == '男') {
        $("#alterinfo :radio:first").attr("checked", "checked");
    }
    if (info[0] == '女') {
        $("#alterinfo :radio:last").attr("checked", "checked");
    }
    if (info[1] != null) {
        var date = new Date(parseInt(info[1].substring(6, 20)));
        var datestr = date.getFullYear() + '-'
        datestr = datestr + (date.getMonth() < 9 ? '0' : "") + (date.getMonth() + 1) + '-'; //getMonth要+1才是真正的月份
        datestr = datestr + (date.getDate() < 10 ? '0' : "") + date.getDate();
        $("#birthday").val(datestr);
    }
    var i = 1;
    for (; i < texts.length; i++) {
        texts[i].value = info[i + 1];
    }
    $("#alterinfo :enabled").removeAttr("valuechanged");
}
function info_keypress() {
    if (event.keyCode == 13) {
        event.target.blur();
        event.preventDefault();
        alterInfo();
    }
}
function valueChanged() {
    $(event.currentTarget).attr("valuechanged", "valuechanged");
}
function alterInfo() {
    $("#alterinfo-button").attr("disabled", "disabled");
    $("#alterinfo").unbind("keypress");
    if (!isLogined()) {
        return;
    }
    var info = new Array();
    var inputs = $("#alterinfo :enabled");
    for (var i = 0; i < 7; i++) {
        if (inputs[i].getAttribute("valuechanged") == "valuechanged") {
            info.push('"' + inputs[i].id + "\":\"" + inputs[i].value + '"')
        }
    }
    if (info.length == 0) {
        alert("未改动任何信息！");
        alterInfoComplete();
        return;
    }
    $.ajax({
        type: "POST",
        url: "../Handler/User.ashx",
        data: { action: "updateuserinfo", userinfo: '{' + info.join(',') + '}' },
        timeout: 5000,
        success: function (data) {
            var _data = data.split(':');
            if (_data[0] == "true") {
                alert("保存成功！")
                if (_data.length == 2) {
                    displayInfo(_data[1]);
                }
                else {
                    alert("部分信息未能保存：\n" + _data[1].substring(0, _data[1].length - 1));
                    displayInfo(_data[2]);
                }
            }
            else {
                alert(_data[0]);
                displayInfo(_data[1]);
            }
            alterInfoComplete();
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            alterInfoComplete();
        }
    });
}
function alterInfoComplete() {
    $("#alterinfo-button").removeAttr("disabled");
    $("#alterinfo").keypress(function () { pwd_keypress(); });
}

function displayPwd() {
    var html1 = "<dd><a href=\"javascript: alterPwd()\" class=\"side-a\" >确认</a></dd>";
    var html2 = "<dd><a href=\"javascript: changeContent(0)\" class=\"side-a\" >取消</a></dd>";
    $("#side > dl").html("<dt>修改密码</dt>" + html1 + html2);
    $("#navi").text("更换登录密码");
    $("#alterpwd :password").val("");
    $("#alterpwd .span_next").hide();
    $("#alterpwd > .message").stop(true, true);
    $("#alterpwd").show();
}
function pwd_keypress() {
    if (event.keyCode == 13) {
        event.preventDefault();
        alterPwd();
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
function alterPwd() {
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
        url: "../Handler/User.ashx",
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
function showMessage(message) {
    var msgelement = $(".message");
    msgelement.stop(true, true);
    msgelement.text(message);
    msgelement.fadeIn(500);
    msgelement.fadeOut(4000);
}