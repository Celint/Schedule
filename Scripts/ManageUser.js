var departments;
var schools;
var grades;
$(function () {
    var affairs = new Array();
    affairs = [{ href: "javascript: changeAffair(0)", text: "查看用户" }, { href: "javascript: changeAffair(1)", text: "添加用户" }];
    var myauths = parent.authorities[3], hides = new Array();
    if (!myauths[4]) {
        hides.push(1);
    }
    parent.registerAffairs(affairs, hides);
    getDepartments();
    var select = $(".div_info > select");
    var alter = $("#alteruserinfo");
    alter.remove();
    if (!parent.document.getElementById("alteruserinfo")) {
        var html = "";
        html = html + "<option value=\"\" selected=\"selected\" hidden=\"hidden\">请选择</option>";
        for (var i = 0; i < departments.length; i++) {
            html = html + "<option value=\"" + i + "\">" + departments[i].name + "</option>";
        }
        select.html(html);
        parent.registerFloatingNode(alter, function () {
            parent.successcall = alterSuccess;
        });
    }
    parent.changeAffair(0);
});

function changeAffair(index) {
    var contents = $("form > div");
    contents.hide();
    $(contents[index]).show();
    switch (index) {
        case 0:
            displayLookup();
            break;
        case 1:
            displayAdd();
            break;
        default:
            break;
    }
}

function displayLookup() {
    if ($(".th_operate > span").text() == "<") {
        changeTableStatus();
    }
    getSchools();
    getGrades();
    $("#filter > select:first").val("");
    methodChange();
    fillTable(new Array());
    resetDisplayMode(0);
}
function changeTableStatus() {
    var span = $(".th_operate > span");
    if (span.text() == "<") {
        span.text(">");
        span.attr("title", "展开");
    }
    else {
        span.text("<");
        span.attr("title", "折叠");
    }
    performTableStatus();
}
function performTableStatus() {
    if ($(".th_operate > span").text() == ">") {
        $(".td_canhide").hide();
        $(".firstrow > th:gt(7)").hide();
        $(".th_operate").show();
    }
    else {
        $(".td_canhide").show();
        $(".firstrow > th:gt(7)").show();
    }
}
function getDepartments() {
    if (!parent.isLogined()) {
        return;
    }
    if (departments != undefined) {
        return;
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getdepartments" },
        success: function (data) {
            var _data = JSON.parse(data);
            departments = new Array();
            for (var i = 0; i < _data.length / 2; i++) {
                departments[i] = {
                    name: _data[2 * i],
                    shortname: _data[2 * i + 1]
                }
            }
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}
function getSchools() {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getschools" },
        success: function (data) {
            schools = JSON.parse(data);
        },
    });
}
function getGrades() {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getgrades" },
        success: function (data) {
            grades = JSON.parse(data);
        },
    });
}
function methodChange() {
    var method = $("#filter > select:first").val();
    $("#filter > b:last").text(method + "：");
    switch (method) {
        case "":
            $("#filter > b:last").text("关键词：");
        case "姓名":
        case "学号":
        case "班级":
            var text = $("#filter > :text");
            text.text("");
            text.css("display", "inline");
            $("#filter > select:last").hide();
            break;
        case "部门":
            var select = $("#filter > select:last");
            var html = "";
            html = html + '<option value="请选择" selected="selected" hidden="hidden">请选择</option>';
            for (var i = 0; i < departments.length; i++) {
                html = html + '<option value="' + i + '">' + departments[i].name + '</option>';
            }
            select.html(html);
            select.css("display", "inline");
            $("#filter > :text").hide();
            break;
        case "学院":
            var select = $("#filter > select:last");
            select.css("display", "inline");
            fillSelect(select, schools, schools, "请选择");
            $("#filter > :text").hide();
            break;
        case "年级":
            var select = $("#filter > select:last");
            select.css("display", "inline");
            fillSelect(select, grades, grades, "请选择");
            $("#filter > :text").hide();
            break;
        case "状态":
            var select = $("#filter > select:last");
            fillSelect(select, ['可用', '不可用'], [1, 0], "请选择");
            select.css("display", "inline");
            $("#filter > :text").hide();
            break;
        default:
            break;
    }
}
function searchUser() {
    var button = $(event.target)
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var method = $("#filter > select:first").val();
    var key = "";
    if (method != "") {
        var select = $("#filter > select:last:visible");
        if (select.length == 1) {
            if ((key = select.val()) == "请选择") {
                alert("请先选择" + method + "！");
                button.removeAttr("disabled");
                return;
            }
        }
        else if ((key = $("#filter > :text").val()) == "") {
            alert("请先填写" + method + "！");
            button.removeAttr("disabled");
            return;
        }
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getusers", method: method, key: key },
        success: function (data) {
            var _data = JSON.parse(data);
            var datalen = fillTable(_data);
            if (_data.length == 0) {
                $("#userinfo table tr:gt(0)").remove();
                setTimeout(function myfunction() {
                    alert("没有找到符合条件的用户！");
                }, 200);
            }
            else {
                setTimeout(function myfunction() {
                    alert("找到" + datalen + "个用户！");
                }, 200);
            }
            resetDisplayMode(Math.ceil(datalen / 10));
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
function fillTable(data) {
    $("table tr:gt(0)").remove();
    var datawidth = 16, datalen = data.length / datawidth, html = "";
    for (var i = 0; i < data.length; i++) {
        html = html + '<tr userid="' + data[i] + '"><td><input type="checkbox" />' + (i / datawidth + 1) + '</td>';

        html = html + '<td>' + data[++i] + '</td>'; //姓名
        html = html + '<td>' + data[++i] + '</td>'; //学号

        html = html + '<td>' + departments[parseInt(data[++i])].name + '</td>'; //部门

        for (var j = 4; j < 7; j++) { //学院、专业班级、年级
            if (data[++i] != null) {
                html = html + '<td>' + data[i] + '</td>';
            }
            else {
                html = html + '<td></td>';
            }
        }

        if (data[++i]) { //可用状态
            html = html + '<td class="td_usable">可用</td>';
        }
        else {
            html = html + '<td class="td_unusable">不可用</td>';
        }

        if (data[++i] != null) { //性别
            html = html + '<td class="td_canhide">' + data[i] + '</td>';
        }
        else {
            html = html + '<td class="td_canhide"></td>';
        }

        if (data[++i] != null) { //生日
            html = html + '<td class="td_canhide">' + getDateString(new Date(parseInt(data[i].substring(6, 20)))) + '</td>';
        }
        else {
            html = html + '<td class="td_canhide"></td>';
        }

        for (var j = 10; j < datawidth; j++) { //QQ号～家庭住址
            if (data[++i] != null) {
                html = html + '<td class="td_canhide">' + data[i] + '</td>';
            }
            else {
                html = html + '<td class="td_canhide"></td>';
            }
        }
        html = html + '<td><u onclick="alterSingle()">修改</u><u onclick="resetPwd()">重置密码</u></td></tr>';
    }
    $("table").append(html);
    return datalen;
}
function resetDisplayMode(pagecount) {
    var inputs = $("#lookup > input:lt(3)");
    inputs.attr("disabled", true);
    $(inputs[0]).attr("onclick", "showTotal()");
    $(inputs[0]).val("全部显示");
    $(inputs[1]).attr("onclick", "selectAll()");
    $(inputs[1]).val("全选列表");
    $(inputs[2]).attr("onclick", "selectPage()");
    $(inputs[2]).val("选中此页");
    $(".tablebox").css("height", "auto");
    if (pagecount > 1) {
        inputs.removeAttr("disabled");
        generatePager(pagecount);
        $("table tr:gt(10)").hide();
    }
    else {
        if (pagecount == 1) {
            inputs.filter(":gt(0)").removeAttr("disabled");
        }
        $("#pager").hide();
    }

    if ($(".th_operate > span").text() == ">") {
        performTableStatus();
    }
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
function resetPwd() {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[3][1]) {
        alert("你没有此操作的权限！");
        return;
    }
    if (!confirm("该用户的登录密码将会被重置为初始密码，是否继续？")) {
        return;
    }
    var userid = $(event.target).parent().parent().attr("userid");
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "resetuserpwd", userid: userid },
        success: function (data) {
            if (data == "true") {
                alert("重置成功！");
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
        }
    });
}
function showTotal() {
    $("table tr").show();
    if ($("table").height() > 400) {
        $(".tablebox").css("height", "407px");
    }
    $("#pager").hide();
    var button = $(event.target);
    button.attr("onclick", "showPage()")
    button.val("分页显示");
    $("#lookup > input:eq(2)").attr("disabled", true);
}
function showPage() {
    var trs = $("table tr:gt(10)");
    generatePager(Math.ceil(trs.length / 10) + 1);
    trs.hide();
    $(".tablebox").css("height", "auto");
    var button = $(event.target);
    button.attr("onclick", "showTotal()")
    button.val("全部显示");
    $("#lookup > input:eq(2)").removeAttr("disabled");
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
function alterSingle() {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[3][1]) {
        alert("你没有此操作的权限！");
        return;
    }
    var row = $(event.target).parent().parent();
    var infos = new Array();
    var tds = row.children(":gt(0):lt(15)");
    for (var i = 0; i < 6; i++) {
        infos.push(tds[i].innerText);
    }
    for (var i = 7; i < 15; i++) {
        infos.push(tds[i].innerText);
    }
    parent.alterrows = row;
    parent.showFloatingNode(function () {
        parent.showAlter(infos);
    });
}
function alterSelection() {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[3][1]) {
        alert("你没有此操作的权限！");
        return;
    }
    var rows = getSelectedRows();
    if (rows.length == 0) {
        alert("没有选中任何项！");
        return;
    }
    parent.alterrows = rows;
    parent.showFloatingNode(function () {
        parent.showAlter();
    });
}
function alterSuccess(rows, changes) {
    for (var i = 0; i < rows.length; i++) {
        var tds = $(rows[i]).children();
        for (var j = 0; j < changes.length / 2; j++) {
            tds[changes[j * 2]].innerText = changes[j * 2 + 1];
        }
    }
}
function deactiveSelection() {
    changeUserStatus("被禁用用户将不能使用系统的任何功能，但其信息将得到保留，如果用户信息不需要保留建议将其删除。\n要继续吗？", 0, function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var td = $(rows[i]).children(":eq(7)");
            td.text("不可用");
            td.attr("class", "td_unusable");
        }
    })
}
function activeSelection() {
    changeUserStatus("确定要恢复用户可用状态吗？", 1, function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var td = $(rows[i]).children(":eq(7)");
            td.text("可用");
            td.attr("class", "td_usable");
        }
    })
}
function changeUserStatus(message, status, successfunc) {
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
    if (!parent.authorities[3][2]) {
        alert("你没有此操作的权限！");
        button.removeAttr("disabled");
        return;
    }
    if (!confirm(message)) {
        button.removeAttr("disabled");
        return;
    }
    var ids = getSelectedUsersId(rows);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "changeuserstatus", usersid: ids.join(','), status: status },
        success: function (data) {
            if (data == "true") {
                successfunc(rows);
                setTimeout(function myfunction() {
                    alert("操作成功！");
                }, 10)
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
function deleteSelection() {
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
    if (!parent.authorities[3][3]) {
        alert("你没有此操作的权限！");
        button.removeAttr("disabled");
        return;
    }
    if (!confirm("确定要删除所选用户吗？\n该用户所有信息（包括值班信息、课表信息、日志等）都将被删除，此操作不可逆！")) {
        button.removeAttr("disabled");
        return;
    }
    var ids = getSelectedUsersId(rows);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "deleteuser", usersid: ids.join(',') },
        success: function (data) {
            if (data == "true") {
                $(rows).remove();
                var trs = $("table tr");
                for (var i = 1; i < trs.length; i++) {
                    $(trs[i]).children(":first").html("<input type=\"checkbox\" />" + i);
                }
                if ($("#lookup > input:eq(2)").attr("disabled")) { //全部显示
                    if (trs.length < 11) {
                        var pagecount = Math.ceil((trs.length - 1) / 10);
                        resetDisplayMode(pagecount);
                    }
                }
                else { //分页显示
                    trs.show();
                    var pagecount = Math.ceil((trs.length - 1) / 10);
                    resetDisplayMode(pagecount);
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
function getSelectedUsersId(selectedrows) {
    var selectedid = new Array();
    for (var i = 0; i < selectedrows.length; i++) {
        selectedid.push(selectedrows[i].getAttribute("userid"));
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

function displayAdd() {
    var select = $(".div_sub > select");
    var html = "";
    html = html + "<option value=\"\" selected=\"selected\" hidden=\"hidden\">请选择</option>";
    for (var i = 0; i < departments.length; i++) {
        html = html + "<option value=\"" + i + "\">" + departments[i].name + "</option>";
    }
    select.html(html);
    addMethodChange();
}
function addMethodChange() {
    $("#add > div:gt(0)").hide();
    if ($("#addmethod > select").val() == "batch") {
        showAddBatch();
    }
    else {
        showAddSingle();
    }
}
function showAddBatch() {
    $("#add_batch :file").val("");
    $("#add_batch").show();
}
function showAddSingle() {
    $(".div_sub > select").val("");
    $(".text").val("");
    var ckdradio = $(".div_sub > :checked");
    for (var i = 0; i < ckdradio.length; i++) {
        ckdradio[i].checked = false;
    }
    $("#add_single").show();
}
function addBatch() {
    if (!parent.isLogined()) {
        return;
    }
    var file = event.target;
    if (!file.files[0]) {
        return;
    }
    else {
        var reg = /^.+(\.xls|\.XLS)$/;
        if (!reg.test(file.value)) {
            alert("请选择xls格式的文件！");
            file.value = "";
            return;
        }
    }
    var formdata = new FormData();
    formdata.append("action", "adduser_batch");
    formdata.append("file", file.files[0]);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 10000,
        processData: false,
        contentType: false,
        data: formdata,
        success: function (data) {
            if (data[0] == 't') {
                alert("上传成功！");
                if (data.length > 4) {
                    if (confirm("部分数据存在错误，已整理好，是否下载？")) {
                        window.open(data.split(':')[1]);
                    }
                }
            }
            else {
                alert(data);
            }
            file.value = "";
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("上传超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            file.value = "";
        }
    });
}
function addSingle() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var inputs = $("#add_single .text");
    var info = new Array();
    var msg = "";
    if (inputs[0].value != "") { //姓名
        info.push('"' + inputs[0].id + '":"' + inputs[0].value + '"')
    }
    else {
        msg = msg + "姓名、"
    }
    if (inputs[1].value != "") { //学号
        info.push('"' + inputs[1].id + '":"' + inputs[1].value + '"')
    }
    else {
        msg = msg + "学号、"
    }
    if (msg.length != 0) {
        alert(msg.substr(0, msg.length - 1) + "不能为空！");
        button.removeAttr("disabled");
        return;
    }
    var select = $(".div_sub > select");  //部门
    if (select.val() != "") {
        info.push('"department":"' + select.val() + '"')
    }
    else {
        alert("请选择部门！");
        button.removeAttr("disabled");
        return;
    }

    var radios = $(".radio"); //性别
    if (radios[0].checked) {
        info.push('"sex":"男"');
    }
    else if (radios[1].checked) {
        info.push('"sex":"女"');
    }

    for (var i = 2; i < inputs.length; i++) {
        if (inputs[i].value != "") {
            info.push('"' + inputs[i].id + '":"' + inputs[i].value + '"')
        }
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "adduser_single", userinfo: '{' + info.join(',') + '}' },
        success: function (data) {
            if (data == "true") {
                alert("添加成功！");
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

function fillSelect(select, texts, values, prompt) {
    var html = "";
    if (prompt != undefined) {
        html = html + '<option value="' + prompt + '" selected="selected" hidden="hidden">' + prompt + '</option>';
    }
    if (values == undefined) {
        values = texts;
    }
    for (var i = 0; i < texts.length; i++) {
        if (texts[i] == null) {
            html = html + '<option value="null">(空)</option>';
        }
        else {
            html = html + '<option value="' + values[i] + '">' + texts[i] + '</option>';
        }
    }
    select.html(html);
}
function getDateString(date) {
    var datestr = date.getFullYear() + '-'
    datestr = datestr + (date.getMonth() < 9 ? '0' : "") + (date.getMonth() + 1) + '-'; //getMonth()要+1才是真正的月份
    datestr = datestr + (date.getDate() < 10 ? '0' : "") + date.getDate();
    return datestr;
}