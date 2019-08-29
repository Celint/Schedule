var recall1, recall2, recall3;
$(function () {
    var affairs = new Array();
    affairs = [{ href: "javascript: changeAffair(0)", text: "系统状态" },
        { href: "javascript: changeAffair(1)", text: "在线用户" },
        { href: "javascript: changeAffair(2)", text: "在线管理员" }];
    var myauths = parent.authorities[0], hides = new Array();
    if (!myauths[1]) {
        hides.push(1);
    }
    if (!myauths[2]) {
        hides.push(2);
    }
    parent.registerAffairs(affairs, hides);
    parent.changeAffair(0);
});

function changeAffair(index) {
    if (!parent.isLogined()) {
        return;
    }
    recall1 = false;
    recall2 = false;
    recall3 = false;
    var contents = $("form > div");
    contents.hide();
    switch (index) {
        case 0:
            recall1 = true;
            getSystemState();
            $(contents[0]).show();
            break;
        case 1:
            recall2 = true;
            getLoginedUsers();
            $(contents[1]).children("h3").text("查看在线用户");
            $("#filter > b").text("用户学号：");
            $("#onlineadmins").hide();
            $("#onlineusers").show();
            $(contents[1]).show();
            break;
        case 2:
            recall3 = true;
            getLoginedAdmins();
            $(contents[1]).children("h3").text("查看在线管理员");
            $("#filter > b").text("管理员名：");
            $("#onlineusers").hide();
            $("#onlineadmins").show();
            $(contents[1]).show();
            break;
        default:
            break;
    }
}

function getSystemState() {
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getsystemstate" },
        success: function (data) {
            var _data = data.split(',');
            if (_data.length == 7) {
                var states = $(".div_sub > b");
                for (var i = 0; i < states.length; i++) {
                    states[i].innerText = _data[i];
                }
                if (_data[6] == "1") {
                    states[6].innerText = "维护中";
                    var button = $("#sysstate > input");
                    button.val("取消维护");
                    button.attr("onclick", "releaseMaintaining()");
                }
                else {
                    states[6].innerText = "正常";
                    var button = $("#sysstate > input");
                    button.val("系统维护");
                    button.attr("onclick", "maintainSystem()");
                }
                setTimeout(function () {
                    if (recall1) {
                        getSystemState();
                    }
                }, 1000);
            }
            else {
                alert(data);
                if (data[0] == '你') {
                    parent.location = "/Admin/Login.aspx";
                }
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("系统状态自动刷新超时！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function maintainSystem() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[0][5]) {
        alert("你没有此操作的权限！");
        return;
    }
    if (!confirm("此操作将会下线所有管理员和用户，并阻止后续用户登录，管理员登录和签到功能不受影响，可以在维护期间修改与用户有关的代码，请确保只有你正在进行此操作\n是否继续？")) {
        button.removeAttr("disabled");
        return;
    }
    var reason;
    while ((reason = prompt("请输入维护原因：") != null)) {
        if (reason == "") {
            continue;
        }
        if (reason.length > 40) {
            alert("输入字数过多，请重新输入！");
            continue;
        }
        break;
    }
    if (reason == null) { //按取消键
        button.removeAttr("disabled");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "maintainsystem", reason: reason },
        success: function (data) {
            if (data == "true") {
                button.val("取消维护");
                $(".div_sub > b:last").text("维护中");
                setTimeout(function () {
                    parent.location = "/Admin/Login.aspx";
                    alert("成功设置系统维护状态，请重新登录！");
                }, 200);
            }
            else {
                button.removeAttr("disabled");
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function releaseMaintaining() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[0][5]) {
        alert("你没有此操作的权限！");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "exitsysmaintain" },
        success: function (data) {
            if (data == "true") {
                alert("成功取消系统维护状态！");
                button.val("系统维护");
                $(".div_sub > b:last").text("正常");
            }
            else {
                button.removeAttr("disabled");
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}

function searchLoginedAccount() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var account = $("#filter > :text").val(), type = $("#filter > b").text().substring(0, 4);
    if (account == "") {
        alert("请先填写" + type + "！");
        button.removeAttr("disabled");
        return;
    }
    if (type[0] == '用') {
        getLoginedUser(account);
    }
    else {
        getLoginedAdmin(account);
    }
}

function getLoginedUser(sno) {
    recall2 = false;
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getlogineduser", sno: sno },
        success: function (data) {
            $("#pager").hide();
            if (data == "") {
                setTimeout(function () {
                    alert("未找到指定的登录用户！");
                }, 200);
                $("#onlineusers tr:gt(0)").remove();
            }
            else {
                var _data = data.split(',');
                _data.push("");
                fillTable($("#onlineusers"), _data, 3);
            }
            $("#filter > :button").removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            $("#filter > :button").removeAttr("disabled");
        }
    });
}
function getLoginedAdmin(name) {
    recall3 = false;
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getloginedadmin", name: name },
        success: function (data) {
            $("#pager").hide();
            if (data == "") {
                setTimeout(function () {
                    alert("未找到指定的登录管理员！");
                }, 200);
                $("#onlineadmins tr:gt(0)").remove();
            }
            else {
                var _data = data.split(',');
                _data.push("");
                fillTable($("#onlineadmins"), _data, 4);
            }
            $("#filter > :button").removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            $("#filter > :button").removeAttr("disabled");
        }
    });
}
function getLoginedUsers() {
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getloginedusers" },
        success: function (data) {
            var len = fillTable($("#onlineusers"), data.split(','), 3);
            if (len > 10) {
                if ($("#pager:visible").length > 0) {
                    var current = $("#current").text();
                    var pagecount = Math.ceil(len / 10);
                    generatePager(pagecount);
                    gotoPage(Math.min(parseInt(current), pagecount));
                }
                else {
                    generatePager(Math.ceil(len / 10));
                    $("#onlineusers tr:gt(10)").hide();
                }
            }
            else {
                $("#pager").hide();
            }
            setTimeout(function () {
                if (recall2) {
                    getLoginedUsers();
                }
            }, 5000);
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("在线用户自动刷新超时！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function getLoginedAdmins() {
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getloginedadmins" },
        success: function (data) {
            var len = fillTable($("#onlineadmins"), data.split(','), 4);
            if (len > 10) {
                if ($("#pager:visible").length > 0) {
                    var current = $("#current").text();
                    var pagecount = Math.ceil(len / 10);
                    generatePager(pagecount);
                    gotoPage(Math.min(parseInt(current), pagecount));
                }
                else {
                    generatePager(Math.ceil(len / 10));
                    $("#onlineadmins tr:gt(10)").hide();
                }
            }
            else {
                $("#pager").hide();
            }
            setTimeout(function () {
                if (recall3) {
                    getLoginedAdmins();
                }
            }, 5000);
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("在线管理员自动刷新超时！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function offlineUser(userid, visitorid) {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[0][3]) {
        alert("你没有此操作的权限！");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "offlineuser", userid: userid, _visitorid: visitorid },
        success: function (data) {
            if (data[0] == 't') {
                var _data = data.split(':');
                var trs = $("#onlineusers tr");
                var i = 0;
                for (; i < trs.length; i++) {
                    if ($(trs[i]).children()[1].innerText == userid) {
                        break;
                    }
                }
                if (i != trs.length) {
                    $(trs[i]).remove(); i++;
                    for (; i < trs.length; i++) {
                        if ($(trs[i]).css("display") == "none") {
                            $(trs[i]).show();
                            break;
                        }
                    }
                }
                if (_data.length == 2) {
                    alert(_data[1]);
                }
            }
            else {
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function offlineAdmin(adminid, visitorid) {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[0][4]) {
        alert("你没有此操作的权限！");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "offlineadmin", adminid: adminid, _visitorid: visitorid },
        success: function (data) {
            if (data[0] == 't') {
                var _data = data.split(':');
                var trs = $("#onlineadmins tr");
                var i = 0;
                for (; i < trs.length; i++) {
                    if ($(trs[i]).children()[1].innerText == adminid) {
                        break;
                    }
                }
                if (i != trs.length) {
                    $(trs[i]).remove(); i++;
                    for (; i < trs.length; i++) {
                        if ($(trs[i]).css("display") == "none") {
                            $(trs[i]).show();
                            break;
                        }
                    }
                }
                if (_data.length == 2) {
                    alert(_data[1]);
                }
            }
            else {
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function fillTable(table, data, datawidth) {
    table.find("tr:gt(0)").remove();
    if (data.length == 1 && data[0] != "") {
        alert(data[0]);
        if (data[0][0] == '你') {
            parent.location = "/Admin/Login.aspx";
        }
        return;
    }
    var datalen = (data.length - 1) / datawidth, html = "";
    for (var i = 0; i < data.length - 1;) {
        html = html + "<tr><td>" + (i / datawidth + 1) + "</td>";
        for (var j = 0; j < datawidth; j++) {
            html = html + "<td>" + data[i++] + "</td>";
        }
        html = html + '<td><u onclick="offlineUser(' + data[i - datawidth] + ', ' + data[i - 2] + ')">下线</u></td></tr>';
    }
    table.append(html);
    return datalen;
}
function generatePager(pagecount) {
    var links = $("#pager > a");
    var spans = $("#pager > span");
    var totalpage = $(spans[2]);
    totalpage.children("b").text(pagecount);
    totalpage.children("input").val(1);
    var i = 0;
    for (; i < 2; i++) {
        $(links[i]).hide();
    }
    for (; i < links.length - 2; i++) {
        $(links[i]).remove();
    }
    $(spans[0]).hide();
    $(links[links.length - 2]).show();
    var starter = $(links[1]);
    if (pagecount > 5) {
        for (var j = 5; j > 1; j--) {
            starter.after('<a href="javascript: gotoPage(' + j + ')">' + j + '</a>');
        }
        starter.after('<a id="current">1</a>');
        $(spans[1]).show();
        $(links[links.length - 1]).show();
    }
    else {
        for (var j = pagecount; j > 1; j--) {
            starter.after('<a href="javascript: gotoPage(' + j + ')">' + j + '</a>');
        }
        starter.after('<a id="current">1</a>');
        $(spans[1]).hide();
        $(links[links.length - 1]).hide();
    }
    $("#pager").show();
}
function gotoFirstPage() {
    $("#pager > span > input").val(1);
    gotoPage();
}
function gotoPrevPage() {
    var current = parseInt($("#current").text());
    gotoPage(current - 1);
}
function gotoNextPage() {
    var current = parseInt($("#current").text());
    gotoPage(current + 1);
}
function gotoEndPage() {
    $("#pager > span > input").val($("#pager > span > b").text());
    gotoPage();
}
function gotoPage(pagenum) {
    var pagecount = parseInt($("#pager > span > b").text());
    if (pagenum == undefined) { //通过按钮跳转
        pagenum = parseInt($("#pager > span > input").val());
        if (pagenum < 1) { //纠正超出范围的输入
            pagenum = 1;
        }
        if (pagenum > pagecount) {
            pagenum = pagecount;
        }
        var links = $("#pager > a");
        var currentfirst = parseInt($(links[2]).text());
        if (pagenum < currentfirst || pagenum > currentfirst + 4) //不在已经显示的页码中
        {
            for (var i = 2; i < links.length - 2; i++) {
                $(links[i]).remove();
            }
            var starter = $(links[1]);
            if (pagenum == 1) {
                for (var i = 5; i > 1; i--) {
                    starter.after('<a href="javascript: gotoPage(' + i + ')">' + i + '</a>');
                }
                starter.after('<a id="current">2</a>');
                starter.after('<a>1</a>');
            }
            else if (pagenum <= pagecount - 4) {
                for (var i = pagenum + 3; i > pagenum; i--) {
                    starter.after('<a href="javascript: gotoPage(' + i + ')">' + i + '</a>')
                }
                starter.after('<a id="current">' + pagenum + '</a>');
                starter.after('<a href="javascript: gotoPage(' + (pagenum - 1) + ')">' + i + '</a>');
            }
            else {
                for (var i = pagecount; i > pagenum; i--) {
                    starter.after('<a href="javascript: gotoPage(' + i + ')">' + i + '</a>')
                }
                starter.after('<a>' + pagenum + '</a>');
                starter.after('<a id="current">' + (pagenum - 1) + '</a>');
                for (var i = pagenum - 1; i > pagecount - 5; i--) {
                    starter.after('<a href="javascript: gotoPage(' + i + ')">' + i + '</a>')
                }
            }
        }
    }

    var links = $("#pager > a");
    var currentfirst = $(links[2]);
    var current = $("#current");
    if (current.text() != pagenum) {
        var trs = $("table:visible tr:gt(0)");
        trs.hide();
        var top = Math.min(trs.length, pagenum * 10);
        for (var i = (pagenum - 1) * 10; i < top; i++) {
            $(trs[i]).show();
        }
        //更改显示的页码
        if (pagenum == parseInt(currentfirst.text())) { //在显示的第一个
            exchangeLinkStatus(current, currentfirst);
            if (pagenum != 1) {
                currentfirst.before('<a href="javascript: gotoPage(' + (pagenum - 1) + ')">' + (pagenum - 1) + '</a>');
                if (links.length == 9) {
                    $(links[6]).remove();
                }
            }
        }
        else if (pagenum < parseInt(currentfirst.text()) + 4) { //在显示的中间三个
            exchangeLinkStatus(current, $(links[pagenum - currentfirst.text() + 2]));
        }
        else { //在显示的最后一个
            var currentend = $(links[6]);
            exchangeLinkStatus(current, currentend);
            if (pagenum != pagecount) {
                currentend.after('<a href="javascript: gotoPage(' + (pagenum + 1) + ')">' + (pagenum + 1) + '</a>');
                currentfirst.remove();
            }
        }
    }
    $("#pager > span > input").val(pagenum)

    //更改首页、上一页等非页码显示状态
    var spans = $("#pager > span");
    currentfirst = $("#pager > a:eq(2)").text();
    if (currentfirst == 1) {
        $(links[0]).hide();
        $(spans[0]).hide();
    }
    else {
        $(links[0]).show();
        $(spans[0]).show();
    }
    if (pagenum == 1) {
        $(links[1]).hide();
    }
    else {
        $(links[1]).show();
    }
    if (pagecount - currentfirst < 5) {
        $(links[links.length - 1]).hide();
        $(spans[1]).hide();
    }
    else {
        $(links[links.length - 1]).show();
        $(spans[1]).show();
    }
    if (pagenum == pagecount) {
        $(links[links.length - 2]).hide();
    }
    else {
        $(links[links.length - 2]).show();
    }
}
function exchangeLinkStatus(current, futurecurrent) {
    current.removeAttr("id");
    current.attr("href", "javascript: gotoPage(" + current.text() + ")");
    futurecurrent.removeAttr("href");
    futurecurrent.attr("id", "current");
}
