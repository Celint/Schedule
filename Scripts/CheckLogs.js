var usereventtypes;
var admineventtypes;
$(function () {
    var affairs = new Array();
    affairs = [{ href: "javascript: changeAffair(0)", text: "用户日志" }, { href: "javascript: changeAffair(1)", text: "管理员日志" }];
    parent.registerAffairs(affairs);
    parent.changeAffair(0);
});

function changeAffair(index) {
    switch (index) {
        case 0:
            $("#lookup > h3").text("查看用户日志");
            $("th:eq(1)").text("用户ID");
            $(".conditions:first > b").text("用户ID：");
            getUserEventTypes();
            fillSelect2($(".conditions > select"), usereventtypes);
            break;
        case 1:
            $("#lookup > h3").text("查看管理员日志");
            $("th:eq(1)").text("管理员ID");
            $(".conditions:first > b").text("管理员ID：");
            getAdminEventTypes();
            fillSelect2($(".conditions > select"), admineventtypes);
            break;
        default:
            break;
    }
    $(".conditions > input").val("");
    resetTable();
}

function getUserEventTypes() {
    if (!parent.isLogined()) {
        return;
    }
    if (usereventtypes) {
        return;
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getusereventtypes" },
        success: function (data) {
            usereventtypes = JSON.parse(data);
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}
function getAdminEventTypes() {
    if (!parent.isLogined()) {
        return;
    }
    if (admineventtypes) {
        return;
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getadmineventtypes" },
        success: function (data) {
            admineventtypes = JSON.parse(data);
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}
function resetTable() {
    $("table tr:gt(0)").remove();
    $("#pager").hide();
    var inputs = $("#lookup > input");
    $(inputs[0]).attr("onclick", "selectAll()");
    $(inputs[0]).val("全选列表");
    $(inputs[0]).attr("disabled", "disabled");
    $(inputs[1]).attr("onclick", "selectPage()");
    $(inputs[1]).val("选中此页");
    $(inputs[1]).attr("disabled", "disabled");
}
function scanFilter() {
    var conditions = "", _conditions = $(".conditions");
    var text = $(".conditions > :text"), accountid;
    if (text.val() != "") {
        if (isNaN(accountid = parseInt(text.val()))) {
            if ($("#lookup > h3").text()[2] == '用') {
                alert("用户ID应是一个正整数！");
            }
            else {
                alert("管理员ID应是一个正整数！");
            }
        }
        else {
            if ($("#lookup > h3").text()[2] == '用') {
                conditions = conditions + "userid:" + accountid + ","
            }
            else {
                conditions = conditions + "adminid:" + accountid + ","
            }
        }
    }
    var select = $(".conditions > select");
    if (select.val() != "") {
        conditions = conditions + "eventtype:" + select.val() + ","
    }
    var timespan = $(".conditions > input[type=datetime-local]");
    if (timespan[0].value != "") {
        conditions = conditions + "starttime:" + timespan[0].valueAsNumber + ","
    }
    if (timespan[1].value != "") {
        conditions = conditions + "endtime:" + timespan[1].valueAsNumber + ","
    }
    if (conditions == "") {
        alert("请至少输入一项过滤条件！");
    }
    else {
        return { conditions: conditions.substring(0, conditions.length - 1) };
    }
}
function searchLogs() {
    var button = $(event.target)
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var formdata = scanFilter();
    if (!formdata) {
        button.removeAttr("disabled");
        return;
    }
    var logeventtypes;
    if ($("#lookup > h3").text()[2] == '用') {
        formdata.action = "getuserlogs";
        logeventtypes = usereventtypes;
    }
    else {
        formdata.action = "getadminlogs";
        logeventtypes = admineventtypes;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: formdata,
        success: function (data) {
            var _data = JSON.parse(data);
            var datalen = fillTable(_data, logeventtypes);
            if (_data.length == 0) {
                $("table tr:gt(0)").remove();
                setTimeout(function myfunction() {
                    alert("没有找到符合条件的日志！");
                }, 200);
            }
            else {
                setTimeout(function myfunction() {
                    alert("找到" + datalen + "条日志！");
                }, 200);
                $("#lookup > input").removeAttr("disabled");
                var pagecount = Math.ceil(datalen / 10);
                if (pagecount > 1) {
                    generatePager(pagecount);
                    $("table tr:gt(10)").hide();
                }
                else {
                    $("#pager").hide();
                }
            }
            button.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("查找超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function fillTable(data, eventtypes) {
    $("table tr:gt(0)").remove();
    var datawidth = 4, datalen = data.length / datawidth, html = "";
    for (var i = 0; i < data.length; i++) {
        html = html + '<tr logid="' + data[i] + '"><td><input type="checkbox" />' + (i / datawidth + 1) + '</td>';
        html = html + '<td>' + data[++i] + '</td>'; //用户ID
        var index = data[++i].indexOf('{');
        var eventtype = findEventType(eventtypes, data[i].substring(0, index));
        var describes = eventtype.argsdescribe, args = data[i].substring(index + 1, data[i].length - 1).split('\r'), s = "";
        for (var j = 0; j < describes.length; j++) {
            s = s + describes[j] + '：' + args[j] + '   ';
        }
        var time = new Date(parseInt(data[++i].substring(6, 20)));
        html = html + '<td>' + time.toLocaleDateString() + "  " + time.toTimeString().substring(0, 8) + '</td>'; //时间
        html = html + '<td>' + eventtype.describe + (s == "" ? "" : '  详细信息：' + s) + '</td>'; //用户ID
    }
    $("table").append(html);
    return datalen;
}
function findEventType(types, type) {
    var i = 0;
    while (type != types[i].sqlname) i++;
    return types[i];
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
                for (var i = 5; i > 2; i--) {
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
                for (var i = pagenum - 2; i > pagecount - 5; i--) {
                    starter.after('<a href="javascript: gotoPage(' + i + ')">' + i + '</a>')
                }
            }
        }
    }

    var links = $("#pager > a");
    var currentfirst = $(links[2]);
    var current = $("#current");
    if (current.text() != pagenum) {
        var trs = $("table tr:gt(0)");
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
function selectPage() {
    var inputs = $("table tr:visible > td > input").prop("checked", true);
    var button = $(event.target);
    button.attr("onclick", "unselectPage()")
    button.val("非选此页");
}
function unselectPage() {
    var inputs = $("table tr:visible > td > input").prop("checked", false);
    var button = $(event.target);
    button.attr("onclick", "selectPage()")
    button.val("选中此页");
}
function selectAll() {
    var inputs = $("table tr > td > input").prop("checked", true);
    var button = $(event.target);
    button.attr("onclick", "unselectAll()")
    button.val("取消全选");
}
function unselectAll() {
    var inputs = $("table tr > td > input").prop("checked", false);
    var button = $(event.target);
    button.attr("onclick", "selectAll()")
    button.val("全选列表");
}
function deleteLogs() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var rows = getSelectedRows();
    if (rows.length == 0) {
        alert("没有选中任何项！");
        button.removeAttr("disabled");
        return;
    }
    if (!parent.authorities[1][1]) {
        alert("你没有此操作的权限！");
        button.removeAttr("disabled");
        return;
    }
    if (!confirm("确定要删除所选日志吗？")) {
        button.removeAttr("disabled");
        return;
    }
    var action;
    if ($("#lookup > h3").text()[2] == '用') {
        action = "deleteuserlog";
    }
    else {
        action = "deleteadminlog";
    }
    var ids = getSelectedLogsId(rows);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: action, logsid: ids.join(',') },
        success: function (data) {
            if (data == "true") {
                $(rows).remove();
                var trs = $("table tr");
                for (var i = 1; i < trs.length; i++) {
                    $(trs[i]).children(":first").html("<input type=\"checkbox\" />" + i);
                }
                trs.show();
                if (trs.length < 11) {
                    $("#pager").hide();
                    if (trs.length == 0) {
                        resetTable();
                    }
                }
                else {
                    trs.filter(":gt(10)").hide();
                    generatePager(Math.ceil((trs.length - 1) / 10))
                }
                setTimeout(function myfunction() {
                    alert("删除成功！");
                }, 200)
            }
            else {
                alert(data);
            }
            button.removeAttr("disabled");
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
function getSelectedLogsId(selectedrows) {
    var selectedid = new Array();
    for (var i = 0; i < selectedrows.length; i++) {
        selectedid.push(selectedrows[i].getAttribute("logid"));
    }
    return selectedid;
}
function getSelectedRows() {
    var trs = $("table tr");
    var selectedrow = new Array();
    for (var i = 1; i < trs.length; i++) {
        if ($(trs[i]).find("td > input")[0].checked) {
            selectedrow.push(trs[i]);
        }
    }
    return selectedrow;
}

function fillSelect(select, texts, values, prompt) {
    var html = "";
    if (values == undefined) {
        values = texts;
    }
    if (prompt) {
        html = html + '<option value="">' + prompt + '</option>';
    }
    for (var i = 0; i < texts.length; i++) {
        html = html + '<option value="' + values[i] + '">' + texts[i] + '</option>';
    }
    select.html(html);
}
function fillSelect2(select, data) {
    var html = '<option value="">请选择</option>';
    for (var i = 0; i < data.length; i++) {
        html = html + '<option value="' + data[i].sqlname + '">' + data[i].describe + '</option>';
    }
    select.html(html);
}