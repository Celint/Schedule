var exponent = "010001";
var modulus = "82702BFEF781D17F03A9BA59F4FFC8FC30A0501F8C003EFEE3DFB8845FD6CBE7BA9D5A2D21C8939E0A5E2DFD37B08B6FF5C950FE0B4133C216C52DC0980E9989FABDE846749D8DE698205CA4AD6658FF17C6360E62324A6F59B6DB47F933B54261B0D6A30D806FC53CEB18D0182B0AEE017FF56D7104489023AE2A285C1FFAF3";
var admintypes;
var authorities;
var authrequirematrixs;
var admintype;

if (parent.isLogined()) {
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getadmintypes" },
        success: function (data) {
            admintypes = JSON.parse(data);
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getauthorities" },
        success: function (data) {
            authorities = JSON.parse(data);
            authrequirematrixs = new Array(authorities.length);
            for (var i = 0; i < authorities.length; i++) {
                var auths = authorities[i].auths;
                var requirematrix = new Array(auths.length);
                for (var j = 0; j < auths.length; j++) {
                    var requires = auths[j].requiredauths;
                    requirematrix[j] = new Array(auths.length);
                    for (var k = 0; k < requires.length; k++) {
                        requirematrix[j][requires[k]] = true;
                    }
                }
                authrequirematrixs[i] = requirematrix;
            }
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getadmintype" },
        success: function (data) {
            admintype = data;
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}

$(function () {
    var affairs = new Array();
    affairs = [{ href: "javascript: changeAffair(0)", text: "查看管理员" }, { href: "javascript: changeAffair(1)", text: "添加管理员" }];
    var myauths = parent.authorities[2], hides = new Array();
    if (!myauths[4]) {
        hides.push(1);
    }
    parent.registerAffairs(affairs, hides);
    var alter = $("#alteradmininfo");
    alter.remove();
    if (!parent.document.getElementById("alteradmininfo")) {
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
    $("#filter > select:first").val("");
    methodChange();
    $("table tr:gt(0)").remove();
}
function methodChange() {
    var method = $("#filter > select:first").val();
    $("#filter > b:last").text(method + "：");
    switch (method) {
        case "":
            $("#filter > b:last").text("关键词：");
        case "管理员名":
            var text = $("#filter > :text");
            text.text("");
            text.css("display", "inline");
            $("#filter > select:last").hide();
            break;
        case "类型":
            var select = $("#filter > select:last"), html = "";
            html = html + '<option value="请选择" selected="selected" hidden="hidden">请选择</option>';
            for (var i = 0; i < admintypes.length; i++) {
                if (admintype < admintypes[i].index) {
                    html = html + '<option value="' + admintypes[i].index + '">' + admintypes[i].name + '</option>';
                }
            }
            select.html(html);
            select.css("display", "inline");
            $("#filter > :text").hide();
            break;
        case "状态":
            var select = $("#filter > select:last");
            var html = '<option value="请选择" selected="selected" hidden="hidden">请选择</option>' +
                '<option value="1">可用</option><option value="0">不可用</option>';
            select.html(html);
            select.css("display", "inline");
            $("#filter > :text").hide();
            break;
        default:
            break;
    }
}
function searchAdmin() {
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
        data: { action: "getadmins", method: method, key: key },
        success: function (data) {
            var _data = JSON.parse(data);
            var datalen = fillTable(_data);
            if (_data.length == 0) {
                $("table tr:gt(0)").remove();
                setTimeout(function myfunction() {
                    alert("没有找到符合条件的管理员！");
                }, 200)
            }
            else {
                setTimeout(function myfunction() {
                    alert("找到" + datalen + "个管理员！");
                }, 200)
            }
            if ($("table").height() > 360) {
                $(".tablebox").css("height", "357px");
            }
            else {
                $(".tablebox").css("height", "auto");
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
function fillTable(data) {
    $("table tr:gt(0)").remove();
    var datawidth = 6, datalen = data.length / datawidth, html = "";
    for (var i = 0; i < data.length; i++) {
        html = html + '<tr adminid="' + data[i++] + '"><td><input type="checkbox" />' + ((i - 1) / datawidth + 1) + '</td>';
        html = html + '<td>' + data[i++] + '</td>'; //管理员名

        var index = 0; while (data[i] != admintypes[index].index) index++;
        html = html + '<td>' + admintypes[index].name + '</td>'; //类型

        var auths = data[++i].split(')'), authstr = ""; //权限
        for (var j = 0; j < auths.length - 1; j++) {
            authstr = authstr + authorities[parseInt(auths[j])].describe + '，';
        }
        if (auths.length > 3) {
            var reducedstr = authstr.substring(0, authstr.indexOf('，', authstr.indexOf('，') + 1)) + "...";
            html = html + '<td title="' + authstr.substring(0, authstr.length - 1) + '">' + reducedstr + '</td>';
        }
        else {
            html = html + '<td>' + authstr.substring(0, authstr.length - 1) + '</td>';
        }

        if (data[++i]) { //可用状态
            html = html + '<td class="td_usable">可用</td>';
        }
        else {
            html = html + '<td class="td_unusable">不可用</td>';
        }
        if (data[++i]) { //附加说明
            if (data[i].length > 10) {
                html = html + '<td title="' + data[i] + '">' + data[i].substring(0, 10) + "..." + '</td>';
            }
            else {
                html = html + '<td>' + data[i] + '</td>';
            }
        }
        else {
            html = html + '<td></td>'
        }
        html = html + '<td><u onclick="alter()">修改</u><u onclick="resetPwd()">重置密码</u></td></tr>';
    }
    $("table").append(html);
    return datalen;
}
function alter() {
    if (!parent.isLogined()) {
        return;
    }
    if (parent.authorities[2][1]) {
        alert("你没有此操作的权限！");
        return;
    }
    var row = $(event.target).parent().parent();
    var infos = new Array();
    var tds = row.children();
    infos.push(tds[1].innerText);
    if (tds[5].title != "") {
        infos.push(tds[5].title);
    }
    else {
        infos.push(tds[5].innerText);
    }
    parent.alterrow = row;
    parent.showFloatingNode(function () {
        parent.showAlter(infos);
    });
}
function alterSuccess(row, changes) {
    var tds = row.children();
    for (var j = 0; j < changes.length / 2; j++) {
        tds[changes[j * 2]].innerText = changes[j * 2 + 1];
    }
}
function resetPwd() {
    if (!parent.isLogined()) {
        return;
    }
    if (parent.authorities[2][1]) {
        alert("你没有此操作的权限！");
        return;
    }
    if (!confirm("该管理员的登录密码将会被重置为初始密码，是否继续？")) {
        return;
    }
    var adminid = $(event.target).parent().parent().attr("adminid");
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "resetadminpwd", adminid: adminid },
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
function deactiveSelection() {
    changeUserStatus("被禁用管理员将不能使用系统的任何功能，但其信息将得到保留，如果管理员信息不需要保留建议将其删除。\n要继续吗？", 0, function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var td = $(rows[i]).children(":eq(4)");
            td.text("不可用");
            td.attr("class", "td_unusable");
        }
    })
}
function activeSelection() {
    changeUserStatus("确定要恢复管理员可用状态吗？", 1, function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var td = $(rows[i]).children(":eq(4)");
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
    if (parent.authorities[2][2]) {
        alert("你没有此操作的权限！");
        return;
    }
    var rows = getSelectedRows();
    if (rows.length == 0) {
        alert("没有选中任何项！");
        button.removeAttr("disabled");
        return;
    }
    if (!confirm(message)) {
        button.removeAttr("disabled");
        return;
    }
    var ids = getSelectedAdminsId(rows);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "changeadminstatus", adminsid: ids.join(','), status: status },
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
    if (parent.authorities[2][3]) {
        alert("你没有此操作的权限！");
        return;
    }
    var rows = getSelectedRows();
    if (rows.length == 0) {
        alert("没有选中任何项！");
        button.removeAttr("disabled");
        return;
    }
    if (!confirm("确定要删除所选管理员吗？\n该管理员所有信息都将被删除，此操作不可逆！")) {
        button.removeAttr("disabled");
        return;
    }
    var ids = getSelectedAdminsId(rows);
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "deleteadmin", adminsid: ids.join(',') },
        success: function (data) {
            if (data == "true") {
                $(rows).remove();
                var trs = $("table tr");
                for (var i = 1; i < trs.length; i++) {
                    $(trs[i]).children(":first").html("<input type=\"checkbox\" />" + i);
                }
                if ($("table").height() < 350) {
                    $(".tablebox").css("height", "auto");
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
function getSelectedAdminsId(selectedrows) {
    var selectedid = new Array();
    for (var i = 0; i < selectedrows.length; i++) {
        selectedid.push(selectedrows[i].getAttribute("adminid"));
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
    $(".text").val("");
    if (!$("#admintypes").attr("admintype")) {
        generateAdminTypes();
    }
    $(".admintype:eq(0) input").click();
}
function generateAdminTypes() {
    var html = "";
    for (var i = 0; i < admintypes.length ; i++) {
        if (admintype >= admintypes[i].index) {
            continue;
        }
        var hasauth = false, defaultauths = admintypes[i].defaultauthorities;
        for (var j = 0; j < defaultauths.length; j++) { //去除没有其默认权限的管理员类型
            if (parent.authorities[defaultauths[j]] != null) {
                hasauth = true; break;
            }
        }
        if (hasauth) {
            html = html + '<div class="admintype"><label title="' + admintypes[i].describe +
                '"><input type="radio" class="radio" name="type" index="' + admintypes[i].index +
                '" onclick="changeAddAdminType(' + admintypes[i].index + ')" />' + admintypes[i].name + '</label></div>';
        }
    }
    $("#admintypes").html(html);
}
function changeAddAdminType(type) {
    $("#admintypes").attr("admintype", type);
    var index = 0;
    while (admintypes[index].index != type) {
        index++;
    }
    var html = "", defaultauths = admintypes[index].defaultauthorities, myauths = parent.authorities;
    for (var i = 0; i < defaultauths.length; i++) {
        var myauth = myauths[defaultauths[i]];
        if (myauth != null) {
            var authority = authorities[defaultauths[i]];
            html = html + ' <div class="auth_sub" index="' + authority.index + '"><div class="auth_prev">' +
                '<p title="展开" onclick="changeAuthDisplayMode()">▶</p><div></div></div><div class="auth"><div class="auth_high">' +
                '<label><input type="checkbox" class="check" onchange="highAuthStatusChanged()" />' + authority.describe + '</label></div>';
            var auths = authority.auths;
            for (var j = 0; j < auths.length; j++) {
                if (myauth[j]) {
                    html = html + '<div class="auth_low"><label><input type="checkbox" class="check" index="' +
                        auths[j].index + '" onchange="lowAuthStatusChanged()" />' + auths[j].describe + '</label></div>';
                }
            }
            html = html + '</div></div>';
        }
    }
    $("#authorities").html(html);
}
function changeAuthDisplayMode() {
    var p = $(event.target);
    if (p.attr("title") == "展开") {
        var sub = p.parent().parent();
        sub.find(".auth_low").css("display", "inline-block");
        var height = sub.height();
        p.next().height(parseInt(height) - 46);
        p.addClass("rotate");
        p.attr("title", "收起");
    }
    else {
        p.parent().next().children(".auth_low").hide();
        p.next().height(0);
        p.removeClass("rotate");
        p.attr("title", "展开");
    }
}
function highAuthStatusChanged() {
    var check = $(event.target);
    var lowchecks = check.parent().parent().nextAll().find("input");
    if (check.prop("checked")) {
        lowchecks.prop("checked", true)
    }
    else {
        lowchecks.prop("checked", false)
    }
}
function lowAuthStatusChanged() {
    var check = $(event.target);
    var index = parseInt(check.attr("index"));
    var auth = check.parents(".auth_sub");
    var checks = auth.find("input");
    var requiredauthmatrix = authrequirematrixs[auth.attr("index")];
    if (check.prop("checked")) {
        var requiredauths = requiredauthmatrix[index];
        for (var i = 1; i < checks.length; i++) {
            if (requiredauths[checks[i].getAttribute("index")]) {
                checks[i].checked = true;
            }
        }
        checks[0].checked = true;
    }
    else {
        var nonechecked = true;
        for (var i = 1; i < checks.length; i++) {
            if (requiredauthmatrix[checks[i].getAttribute("index")][index]) {
                checks[i].checked = false;
            }
            if (checks[i].checked) {
                nonechecked = false;
            }
        }
        if (nonechecked) {
            checks[0].checked = false;
        }
    }
}
function scanInput() {
    var data = {};
    var texts = $(".text");
    if (texts[0].value == "") {
        showMessage("请填写管理员名！");
        return;
    }
    data.name = texts[0].value;
    var pwd = texts[1].value;
    if (pwd != "") {
        if (pwd.length < 8) {
            showMessage("密码长度不能小于8位！");
            return;
        }
        setMaxDigits(131); //请保持该方法参数值为131
        var rsakey = new RSAKeyPair(exponent, "", modulus);
        var pwd = encryptedString(rsakey, pwd); //使用RSA加密密码，防止密码被盗
    }
    data.pwd = pwd;
    var admintype = $("#admintypes").attr("admintype");
    if (!admintype) {
        showMessage("请选择管理员类型！");
        return;
    }
    data.remark = texts[2].value;
    data.type = admintype;
    var _authorities = $(".auth_sub");
    var authcollections = new Array();
    for (var i = 0; i < _authorities.length; i++) {
        var checks = $(_authorities[i]).find("input");
        if (checks[0].checked) {
            var index = _authorities[i].getAttribute("index");
            var auths = new Array(authorities[index].auths.length), _j = 1;
            for (var j = 0; j < authorities[index].auths.length; j++) {
                if (j == checks[_j].getAttribute("index") && checks[_j++].checked) {
                    auths[j] = true;
                }
                else {
                    auths[j] = false;
                }
            }
            authcollections[index] = auths;
        }
    }
    if (authcollections.length == 0) {
        showMessage("请选择至少一项管理员权限！");
        return;
    }
    data.authorities = JSON.stringify(authcollections);
    return data;
}
function add() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    var formdata = scanInput();
    if (!formdata) {
        button.removeAttr("disabled");
        return;
    }
    formdata.action = "addadmin";
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: formdata,
        success: function (data) {
            if (data == "true") {
                alert("添加成功！");
                parent.changeAffair(0);
            }
            else {
                showMessage(data);
            }
            button.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                showMessage("添加管理员超时，请重试！");
            }
            else {
                showMessage("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function showMessage(message) {
    var msg = $(".message");
    msg.text(message);
    msg.fadeIn(500);
    msg.fadeOut(4000);
}