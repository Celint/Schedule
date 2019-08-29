var departments;
var dutytimes;
var yearsfetched;
var startdate;
var startdatestr;
var scheduledata;
var schedule;
var signresult;
var resetTable;
var getDataOfWeek;
//jquery事件绑定
$(function () {
    var affairs = new Array();
    affairs = [{ href: "javascript: changeAffair(0)", text: "自动排班" },
        { href: "javascript: changeAffair(1)", text: "值班统计" },
        { href: "javascript: changeAffair(2)", text: "学期信息" }];
    var myauths = parent.authorities[4], hides = new Array();
    if (!myauths[1]) {
        hides.push(1);
    }
    if (!myauths[4]) {
        hides.push(2);
    }
    parent.registerAffairs(affairs, hides);
    parent.changeAffair(0);
    getNextWeek();
});

function changeAffair(index) {
    if ($("#schedule").css("display") != "none" && $("#schedule").attr("schedulechanged") && !confirm("排班表还未保存，要离开吗？")) {
        return false;
    }
    var contents = $("form > div");
    contents.hide();
    $(contents[index + 1]).show();
    switch (index) {
        case 0:
            $(contents[0]).show();
            displaySchedule();
            break;
        case 1:
            $(contents[0]).show();
            displayAudit();
            break;
        case 2:
            displayAddTerm();
            break;
        default:
            break;
    }
    return true;
}

function getDutyTimes(successcall) {
    if (!parent.isLogined()) {
        return;
    }
    if (dutytimes) {
        successcall();
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getdutytimes" },
        success: function (data) {
            dutytimes = JSON.parse(data);
            successcall();
        }
    });
}
function getYears(successcall) {
    if (!parent.isLogined()) {
        return;
    }
    var selects = $(".title-select");
    if (yearsfetched && !successcall) {
        return;
    }
    $(selects[1]).html("");
    $(selects[2]).html("");
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getyears" },
        success: function (data) {
            if (!yearsfetched || successcall) {
                fillSelect($(selects[0]), JSON.parse(data), "");
                yearsfetched = true;
                if (successcall) {
                    successcall();
                }
            }
        }
    });
}
function yearChanged(successcall) {
    if (!parent.isLogined()) {
        return;
    }
    var selects = $(".title-select");
    $(selects[2]).html("");
    resetTable();
    startdate = undefined;
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getterms", year: selects[0].value },
        success: function (data) {
            fillSelect($(selects[1]), JSON.parse(data), "");
            if (successcall) {
                successcall();
            }
        }
    });
}
function termChanged(successcall) {
    if (!parent.isLogined()) {
        return;
    }
    var selects = $(".title-select");
    resetTable();
    startdate = undefined;
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getweekcount", year: selects[0].value, term: selects[1].value },
        success: function (data) {
            var weeks = new Array();
            for (var i = 0; i < parseInt(data) ; i++) {
                weeks.push(i + 1)
            }
            fillSelect($(selects[2]), weeks, "");
            if (successcall) {
                successcall();
            }
        }
    });
}
function weekChanged() {
    if (!parent.isLogined()) {
        return;
    }
    var selects = $(".title-select");
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getstartdate", year: selects[0].value, term: selects[1].value, week: selects[2].value },
        success: function (data) {
            startdate = new Date(parseInt(data.substring(8, 22)));
            startdatestr = startdate.getFullYear() + '/' + (startdate.getMonth() + 1) + '/' + startdate.getDate();
            getDataOfWeek();
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            resetTable();
            startdate = undefined;
            selects[2].value = "";
        }
    });
}
function getNextWeek() {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "getnextweek" },
        success: function (data) {
            if (data != "") {
                _data = data.split(':');
                var selects = $(".title-select");
                getYears(function () {
                    $(selects[0]).val(_data[0]);
                    yearChanged(function () {
                        $(selects[1]).val(_data[1]);
                        termChanged(function () {
                            $(selects[2]).val(_data[2]);
                            startdate = new Date(_data[3]);
                            startdatestr = startdate.getFullYear() + '/' + (startdate.getMonth() + 1) + '/' + startdate.getDate();
                            getDataOfWeek();
                        });
                    });
                });
            }
        }
    });

}
function nextWeek() {
    if (!startdate) {
        alert("请先选择一周！");
        return;
    }
    var weekselect = $(".title-select_week");
    if (weekselect.val() == weekselect.children("option:last").val()) {
        alert("已是该学期的最后一周！");
    }
    else {
        weekselect.val(parseInt(weekselect.val()) + 1);
        weekChanged();
    }
}
function prevWeek() {
    if (!startdate) {
        alert("请先选择一周！");
        return;
    }
    var weekselect = $(".title-select_week");
    if (weekselect.val() == 1) {
        alert("已是该学期的第一周！");
    }
    else {
        weekselect.val(parseInt(weekselect.val()) - 1);
        weekChanged();
    }
}

function displaySchedule() {
    getDepartments();
    getScheduleData();
    if (!$("#schedule").attr("timeloaded")) {
        getDutyTimes(function () {
            var ths = $("#schedule th:gt(7)");
            for (var i = 0; i < 5; i++) {
                $(ths[i]).append("<br />" + dutytimes[2 * i] + '～' + dutytimes[2 * i + 1]);
            }
            $("#schedule").attr("timeloaded", true);
        });
    }
    resetTable = function () {
        var ths = $("#schedule th:gt(0)");
        var nums = new Array('一', '二', '三', '四', '五', '六', '日');
        for (var i = 0; i < 7; i++) {
            $(ths[i]).html("星期" + nums[i]);
        }
        $("#schedule td").html("");
        $("#schedule").removeAttr("schedulechanged");
    };
    getDataOfWeek = function () {
        var ths = $("#schedule th:gt(0)");
        var nums = new Array('一', '二', '三', '四', '五', '六', '日');
        for (var i = 0; i < 7; i++) {
            $(ths[i]).html("星期" + nums[i] + "<br />" + getDateString(new Date(startdate.valueOf() + i * 86400000)));
        }
        $("#schedule").removeAttr("schedulechanged");
        getSchedule();
    };
    if (startdate) {
        getDataOfWeek();
    }
    else {
        resetTable();
        getYears();
    }
}
function getDepartments() {
    if (!parent.isLogined()) {
        return;
    }
    if (departments) {
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
//获取排班数据
function getScheduleData() {
    if (!parent.isLogined()) {
        return;
    }
    if (scheduledata) {
        return;
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "getscheduledata" },
        success: function (data) {
            var _data = JSON.parse(data);
            scheduledata = new Array(35);
            for (var i = 0; i < _data.length; i++) {
                scheduledata[i] = new Array(_data[i].length / 3);
                for (var j = 0; j < _data[i].length;) {
                    scheduledata[i][j / 3] = {
                        id: _data[i][j++],
                        name: _data[i][j++],
                        department: _data[i][j++]
                    };
                }
            }
        },
        error: function () {
            alert("系统错误，请联系管理员！");
            window.close();
        }
    });
}
//获取排班表
function getSchedule() {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getschedule", startdate: startdatestr },
        success: function (data) {
            var _data = JSON.parse(data);
            var tds = $("#schedule td");
            tds.html("<b onclick=\"addAttendant()\">+</b>");
            schedule = new Array(35);
            for (var i = 0; i < 35; i++) {
                schedule[i] = new Array();
            }
            for (var i = 0; i < _data.length; i++) {
                var index = i % 5 * 7 + Math.floor(i / 5);
                for (var j = 0; j < _data[i].length;) {
                    var id = _data[i][j];
                    tdAddAttendant($(tds[index]), _data[i][j++], _data[i][j++], departments[_data[i][j++]].shortname);
                    schedule[i].push(id);
                }
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("请求排班数据超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            var tds = $("#schedule td");
            tds.html("<b onclick=\"addAttendant()\">+</b>");
        }
    });
}
function addAttendant() {
    if (!canChangeSchedule()) {
        return;
    }
    var td = $(event.target).parent();
    var index = parseInt(td.attr("index")); //单元格对应排班数据的索引
    var _scheduledata = scheduledata[index];
    var _schedule = schedule[index];
    if (_schedule.length == 3) {
        alert("此班值班人数不超过3人！");
        return;
    }
    if (_schedule.length == _scheduledata.length) {
        alert("此班无更多人空闲！");
        return;
    }
    var _index = getRandomIndex(_scheduledata, _schedule);
    tdAddAttendant(td, _scheduledata[_index].id, _scheduledata[_index].name, departments[_scheduledata[_index].department].shortname);
    _schedule.push(_scheduledata[_index].id);
    $("#schedule").attr("schedulechanged", true);
}
function deleteAttendant() {
    if (!canChangeSchedule()) {
        return;
    }
    var attendant = $(event.target).parent();
    var td = attendant.parent();
    var selects = td.find(".attendant > select");
    var index = parseInt(td.attr("index")); //单元格对应排班数据的索引
    var _schedule = schedule[index];
    var _index = 0; //select在单元格中的索引
    for (; _index < selects.length; _index++) {
        if (_schedule[_index] == parseInt($(event.target).prev().val())) {
            break;
        }
    }
    selects.splice(_index, 1);
    selectAddValue(selects, _schedule[_index], index); //给该单元格中其它select中删除的值的选项
    _schedule.splice(_index, 1);
    attendant.remove();
    $("#schedule").attr("schedulechanged", true);
}
function select_change() {
    if (!canChangeSchedule()) {
        return;
    }
    var td = $(event.target).parent().parent();
    var selects = td.find(".attendant > select");
    var index = parseInt(td.attr("index")); //单元格对应排班数据的索引
    var _scheduledata = scheduledata[index];
    var _schedule = schedule[index];
    var _index = 0; //select在单元格中的索引
    for (; _index < selects.length; _index++) {
        if (_schedule[_index] != selects[_index].value) {
            break;
        }
    }
    var oldid = _schedule[_index], newid = parseInt(event.target.value);
    selects.splice(_index, 1);
    if (newid > oldid) { //先处理id大的选项（在后面），防止计算添加或删除的位置时出错
        selectDeleteValue(selects, newid, index); //删除该单元格中其它select中新值班人的选项
        selectAddValue(selects, oldid, index); //给该单元格中其它select中加入旧值班人的选项
    }
    else {
        selectAddValue(selects, oldid, index); //给该单元格中其它select中加入旧值班人的选项
        selectDeleteValue(selects, newid, index); //删除该单元格中其它select中新值班人的选项
    }
    _schedule[_index] = newid;
    $("#schedule").attr("schedulechanged", true);
}
function tdAddAttendant(td, userid, username, department) {
    var index = parseInt(td.attr("index")); //单元格对应排班数据的索引
    var _scheduledata = scheduledata[index];
    var _schedule = schedule[index];
    var selects = td.find(".attendant > select");
    var html = "<div class=\"attendant\"><select title=\"" + department + "  " + username + "\" onchange=\"select_change()\">";
    selectDeleteValue(selects, userid, index); //删除该单元格已经存在的select中此值班人的选项
    if (binarySearch(_scheduledata, userid) == -1) { //不在排班数据中的用户
        html = html + "<option value=\"" + userid + "\" selected=\"selected\" hidden=\"hidden\">" + username + "</option>"
    }
    for (var i = 0; i < _scheduledata.length; i++) { //计算要添加的option的html值
        var isrepeated = false;
        for (var j = 0; j < _schedule.length; j++) { //不添加该单元格已经存在的select的值
            if (_scheduledata[i].id == _schedule[j]) {
                isrepeated = true;
                break;
            }
        }
        if (!isrepeated) {
            html = html + "<option value=\"" + _scheduledata[i].id + "\" title=\"" +
            departments[_scheduledata[i].department].shortname + "  " +
            _scheduledata[i].name + "\">" + _scheduledata[i].name + "</option>";
        }
    }
    html = html + "</select><b onclick=\"deleteAttendant()\">×</b></div>";
    td.children("b").before(html);
    td.find(".attendant:last > select").val(userid);
}
function selectDeleteValue(selects, value, index) {
    var _scheduledata = scheduledata[index];
    var _schedule = schedule[index];
    var index1 = binarySearch(_scheduledata, value);
    if (index1 == -1 || selects.length == 0) {
        return;
    }
    for (var i = 0; i < _schedule.length; i++) { //计算删除位置
        if (value > _schedule[i] && binarySearch(_scheduledata, _schedule[i]) != -1) {
            index1--;
        }
    }
    for (var i = 0; i < selects.length; i++) { //执行删除
        var _index1 = index1;
        var options = $(selects[i]).children();
        if ($(options[0]).attr("hidden") || value > selects[i].value) { //修正删除位置
            _index1++;
        }
        $(options[_index1]).remove();
    }
}
function selectAddValue(selects, value, index) {
    var _scheduledata = scheduledata[index];
    var _schedule = schedule[index];
    var index1 = binarySearch(_scheduledata, value);
    if (index1 == -1 || selects.length == 0) {
        return;
    }
    var _index1 = index1;
    for (var i = 0; i < _schedule.length; i++) { //计算添加位置
        if (value > _schedule[i] && binarySearch(_scheduledata, _schedule[i]) != -1) {
            _index1--;
        }
    }
    for (var i = 0; i < selects.length; i++) { //执行添加
        var __index1 = _index1
        var options = $(selects[i]).children();
        if ($(options[0]).attr("hidden") || value > selects[i].value) { //修正添加位置
            __index1++;
        }
        var html = "<option value=\"" + value + "\" title=\"" +
        departments[_scheduledata[index1].department].shortname + "  " +
        _scheduledata[index1].name + "\">" + _scheduledata[index1].name + "</option>";
        if (__index1 == 0) {
            $(options[__index1]).before(html);
        }
        else {
            $(options[__index1 - 1]).after(html);
        }
    }
}
function binarySearch(array, value) {
    if (array.length == 0) {
        return -1;
    }
    var minindex = 0, maxindex = array.length - 1, midindex;
    while (minindex < maxindex) {
        midindex = Math.floor((minindex + maxindex) / 2);
        if (value <= array[midindex].id) {
            maxindex = midindex;
        }
        else {
            minindex = midindex + 1;
        }
    }
    if (array[minindex].id != value) {
        return -1;
    }
    else {
        return minindex;
    }
}
function getRandomIndex(array, except) {
    var index = Math.floor(Math.random() * (array.length - except.length));
    while (true) {
        var isexcepted = false;
        for (var j = 0; j < except.length; j++) {
            if (array[index].id == except[j]) {
                isexcepted = true;
                break;
            }
        }
        if (!isexcepted) {
            break;
        }
        else {
            index = ++index % array.length;
        }
    }
    return index;
}
function autoSchedule() {
    if (!startdate) {
        alert("请先选择一周！");
        return;
    }
    if (!canChangeSchedule()) {
        return;
    }
    var count = prompt("请输入每班人数：");
    if (!count) {
        return;
    }
    count = parseInt(count);
    if (isNaN(count) || count < 1) {
        alert("输入错误！");
        return;
    }
    if (count > 3) {
        alert("每班人数不超过3人！");
        return;
    }
    var tds = $("#schedule td");
    tds.html("<b onclick=\"addAttendant()\">+</b>");
    schedule = new Array(35);
    for (var i = 0; i < 35; i++) {
        schedule[i] = new Array();
    }
    for (var i = 0; i < tds.length; i++) {
        var index = parseInt(tds[i].getAttribute("index")); //单元格对应排班数据的索引
        var _scheduledata = scheduledata[index];
        var _schedule = schedule[index];
        for (var j = 0; j < count; j++) {
            if (_scheduledata.length == j) {
                break;
            }
            var _index = getRandomIndex(_scheduledata, _schedule);
            tdAddAttendant($(tds[i]), _scheduledata[_index].id, _scheduledata[_index].name, departments[_scheduledata[_index].department].shortname);
            _schedule.push(_scheduledata[_index].id);
        }
    }
    $("#schedule").attr("schedulechanged", true);
}
function updateSchedule() {
    if (!startdate) {
        alert("请先选择一周！");
        return;
    }
    if (!canChangeSchedule()) {
        return;
    }
    var tds = $("#schedule td");
    for (var i = 0; i < tds.length; i++) {
        var attendants = $(tds[i]).children("div");
        for (var j = 0; j < attendants.length; j++) {
            if ($(attendants[j]).find("option:first").attr("hidden")) {
                $(attendants[j]).remove();
            };
        }
    }
    setTimeout(function () {
        alert("更新成功！");
    }, 100);
}
function saveSchedule() {
    var button = $(event.target)
    button.attr("disabled", "disabled");
    if (!parent.isLogined()) {
        return;
    }
    if (!$("#schedule").attr("schedulechanged")) {
        alert("未做任何更改！");
        button.removeAttr("disabled");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        async: false,
        data: { action: "saveschedule", startdate: startdatestr, schedule: JSON.stringify(schedule) },
        success: function (data) {
            if (data == "true") {
                alert("保存成功！");
                $("#schedule").removeAttr("schedulechanged");
            }
            else {
                alert(data);
            }
        },
        error: function () {
            alert("系统错误，请联系管理员！");
        }
    });
    button.removeAttr("disabled");
}
function outputSchedule() {
    var button = $(event.target)
    button.attr("disabled", "disabled");
    if (!parent.isLogined()) {
        return;
    }
    if (!startdate) {
        alert("请先选择一周！");
        button.removeAttr("disabled");
        return;
    }
    if ($("#schedule").attr("schedulechanged")) {
        if (confirm("排班表还未保存，要先保存吗？")) {
            saveSchedule();
        }
        else if (!confirm("将导出之前的排班表，是否导出？")) {
            button.removeAttr("disabled");
            return;
        }
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "outputschedule", startdate: startdatestr },
        success: function (data) {
            if (data[0] == 't') {
                window.open(data.split(':')[1]);
            }
            else {
                alert(data);
            }
            button.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("导出排班表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function outputFreeUsers() {
    var button = $(event.target)
    button.attr("disabled", "disabled");
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "outputfreeusers" },
        success: function (data) {
            if (data[0] == 't') {
                window.open(data.split(':')[1]);
            }
            else {
                alert(data);
            }
            button.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("导出空闲人员表请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function canChangeSchedule() {
    if (!parent.authorities[4][2]) {
        alert("你没有修改排版表的权限！");
        return;
    }
    if (new Date() >= startdate) {
        var _startdate = startdate.getFullYear() + '年' + (startdate.getMonth() + 1) + '月' + startdate.getDate() + '日';
        alert("该周排班时间（" + _startdate + " 之前）已过！");
        return false;
    }
    else {
        return true;
    }
}

function displayAudit() {
    if (!$("#audit").attr("timeloaded")) {
        getDutyTimes(function () {
            var ths = $("#audit th:gt(14)");
            for (var i = 0; i < 5; i++) {
                $(ths[i]).append("<br />" + dutytimes[2 * i] + '～' + dutytimes[2 * i + 1]);
            }
            $("#audit").attr("timeloaded", true);
        });
    }
    resetTable = function () {
        var ths = $("#audit th:gt(0)");
        var nums = new Array('一', '二', '三', '四', '五', '六', '日');
        for (var i = 0; i < 7; i++) {
            $(ths[i]).html("星期" + nums[i]);
        }
        $("#audit > table td").html("");
        var actions = $(".th_action");
        if (actions.css("display") != "none") {
            actions.hide();
            if ($("#tablemode").prop("checked")) {
                $("#audit > table").hide(); //强制浏览器重新渲染table
                setTimeout(function () {
                    $("#audit > table").show();
                }, 10);
            }
        }

        $("#divider > select").val("");
        var table = $(".tablebox > table:first");
        table.nextAll().remove();
        table.find("tr:gt(0)").remove();
    };
    getDataOfWeek = function () {
        var ths = $("#audit th:gt(0)");
        var nums = new Array('一', '二', '三', '四', '五', '六', '日');
        for (var i = 0; i < 7; i++) {
            $(ths[i]).html("星期" + nums[i] + "<br />" + getDateString(new Date(startdate.valueOf() + i * 86400000)));
        }
        $(".th_action").show();
        getSignResult();
    }
    if ($(".th_operate > span").text() == "<") {
        $(".tablebox > table:first tr:gt(0)").remove();
        changeTableStatus($(".tablebox > table .th_operate > span"));
    }
    if (startdate) {
        getDataOfWeek();
    }
    else {
        resetTable();
        getYears();
    }
}
function getSignResult() {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "getsignresult", startdate: startdatestr },
        success: function (data) {
            signresult = JSON.parse(data);
            if ($("#tablemode").prop("checked")) {
                showResultAsTable();
            }
            else {
                showResultAsList();
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("请求值班数据超时，请重试！");
                resetTable();
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function showResultAsTable() {
    $("#audit_list").hide();
    $("#audit > table").show();
    var tds = $("#audit > table td");
    if (!signresult) {
        return;
    }
    for (var i = 0; i < 35; i++) {
        var index = i % 5 * 7 + Math.floor(i / 5);
        if (!signresult[i] || signresult[i].length == 0) {
            $(tds[index]).text("无数据"); continue;
        }
        var _signresult = signresult[i], html = "";
        for (var j = 1; j < _signresult.length; j = j + 4) {
            html = html + '<div class="signaudit"><p title="' + departments[_signresult[j + 1]].shortname + "  " +
                _signresult[j] + '">' + _signresult[j++] + '</p><div>';
            var signintime = _signresult[++j];
            if (signintime != null) {
                var timestr = signintime.Hours + ':' +
                    (signintime.Minutes > 9 ? signintime.Minutes : '0' + signintime.Minutes) + ':' +
                    (signintime.Seconds > 9 ? signintime.Seconds : '0' + signintime.Seconds);
                html = html + '<span class="span_signed" title="签入时间：' + timestr + '">√</span><i></i>'
            }
            else {
                html = html + '<span class="span_unsigned" title="未签入">×</span><i></i>'
            }
            var signouttime = _signresult[++j];
            if (signouttime != null) {
                var timestr = signouttime.Hours + ':' +
                    (signouttime.Minutes > 9 ? signouttime.Minutes : '0' + signouttime.Minutes) + ':' +
                    (signouttime.Seconds > 9 ? signouttime.Seconds : '0' + signouttime.Seconds);
                html = html + '<span class="span_signed" title="签出时间：' + timestr + '">√</span></div></div>'
            }
            else {
                html = html + '<span class="span_unsigned" title="未签出">×</span></div></div>'
            }
        }
        $(tds[index]).html(html);
    }
}
function showResultAsList() {
    $("#audit > table").hide();
    $("#audit_list").show();
    var dividerselect = $("#divider > select");
    var table = $(".tablebox > table");
    table.nextAll().remove();
    table.find("tr:gt(0)").remove();
    table.show();
    dividerselect.val("");
    if (!signresult) {
        dividerselect.attr("disabled", true);
        return;
    }
    var html = "", signcount = 0, totalminutes = 0,
        latecounts = 0, earlyleavecount = 0, nosignincount = 0, nosignoutcount = 0;
    for (var i = 0; i < signresult.length; i++) {
        if (!signresult[i] || signresult[i].length == 0) {
            continue;
        }
        var _signresult = signresult[i];
        var date = new Date(startdate.valueOf() + Math.floor(i / 5) * 86400000), seq = i % 5 + 1;
        for (var j = 0; j < _signresult.length;) {
            html = html + '<tr scheduleid="' + _signresult[j++] + '"><td>' + getDateString(date) + '</td><td>' + seq + '</td><td>' +
                _signresult[j++] + '</td><td>' + departments[_signresult[j++]].shortname + '</td>';
            var signintime = _signresult[j++], signouttime = _signresult[j++], absentminutes;
            if (signintime != null) { //签入情况
                var diffseconds = differenceOfTime(signintime, dutytimes[seq * 2 - 2]);
                if (diffseconds > 0) {
                    absentminutes = Math.ceil(diffseconds / 60);
                    html = html + '<td class="td_notontime">迟到' + absentminutes + '分钟</td>';
                    latecounts++;
                }
                else {
                    html = html + '<td class="td_ontime">按时签入</td>';
                    absentminutes = 0;
                }
                signintime = signintime.Hours + ':' + (signintime.Minutes > 9 ? signintime.Minutes : '0' + signintime.Minutes) + ':'
                    + (signintime.Seconds > 9 ? signintime.Seconds : '0' + signintime.Seconds);
            }
            else {
                html = html + '<td class="td_absent">未签入</td>';
                signintime = "";
                nosignincount++;
            }
            html = html + '<td class="td_canhide">' + signintime + '</td>'; //签入时间
            if (_signresult[j++] != null) { //签入备注
                html = html + '<td class="td_canhide">' + _signresult[j - 1] + '</td>';
            }
            else {
                html = html + '<td class="td_canhide"></td>';
            }

            if (signouttime != null) { //签出情况
                var diffseconds = differenceOfTime(signouttime, dutytimes[seq * 2 - 1]);
                if (diffseconds < 0) {
                    var minutes = (-Math.floor(diffseconds / 60));
                    html = html + '<td class="td_notontime">早退' + minutes + '分钟</td>';
                    absentminutes = absentminutes + minutes;
                    earlyleavecount++;
                }
                else {
                    html = html + '<td class="td_ontime">按时签出</td>';
                }
                signouttime = signouttime.Hours + ':' + (signouttime.Minutes > 9 ? signouttime.Minutes : '0' + signouttime.Minutes) + ':' +
                    (signouttime.Seconds > 9 ? signouttime.Seconds : '0' + signouttime.Seconds);
            }
            else {
                html = html + '<td class="td_absent">未签出</td>';
                signouttime = "";
                nosignoutcount++;
            }
            html = html + '<td class="td_canhide">' + signouttime + '</td>'; //签出时间
            if (_signresult[j++] != null) { //签出备注
                html = html + '<td class="td_canhide">' + _signresult[j - 1] + '</td>';
            }
            else {
                html = html + '<td class="td_canhide"></td>';
            }
            if (absentminutes && signouttime != "") { //值班时间
                var t1 = dutytimes[seq * 2 - 2].split(':'), t2 = dutytimes[seq * 2 - 1].split(':');
                var scheduleminutes = (parseInt(t2[0]) - parseInt(t1[0])) * 60 + parseInt(t2[1]) - parseInt(t1[1]) - absentminutes;
                var hours = Math.floor(scheduleminutes / 60), minutes = scheduleminutes % 60;
                html = html + '<td minutes="' + scheduleminutes + '">' + (hours != 0 ? hours + '小时' : '') + (minutes != 0 ? minutes + '分钟' : '') + '</td>';
                totalminutes = totalminutes + scheduleminutes;
            }
            else {
                html = html + '<td minutes="0"></td>';
            }
            html = html + '<td><u onclick="deleteResult(' + (++signcount) + ')">删除</u></td></tr>';
        }
    }
    if (html != "") { //加上统计信息
        table.append(html);
        var hours = Math.floor(totalminutes / 60), minutes = totalminutes % 60;
        table.append('<tr><td colspan="12" class="td_audit">总班次:<span>' + signcount + '</span>，总值班时长:<span>' +
            (totalminutes != 0 ? (hours != 0 ? hours + '小时' : '') + (minutes != 0 ? minutes + '分钟' : '') : '0分钟') +
            '</span>，迟到次数:<span>' + latecounts + '</span>，早退次数:<span>' + earlyleavecount +
            '</span>，未签入次数:<span>' + nosignincount + '</span>，未签出次数:<span>' + nosignoutcount + '</span></td></tr>');
        dividerselect.removeAttr("disabled");
    }
    else {
        table.append('<tr><td colspan="12" class="td_audit">无数据</td></tr>');
        dividerselect.attr("disabled", true);
    }
    if ($(".th_operate > span").text() == ">") {
        performTableStatus(table);
    }
}
function changeTableStatus(span) {
    if (!span) {
        span = $(event.target);
    }
    if (span.text() == "<") {
        span.text(">");
        span.attr("title", "展开");
    }
    else {
        span.text("<");
        span.attr("title", "折叠");
    }
    performTableStatus(span.parents("table"));
}
function performTableStatus(table) {
    if (table.find(".th_operate > span").text() == ">") {
        table.find(".td_canhide").hide();
        table.find(".th_canhide").hide();
        table.find(".td_audit").attr("colspan", 8);
    }
    else {
        table.find(".td_canhide").show();
        table.find(".th_canhide").show();
        table.find(".td_audit").attr("colspan", 12);
    }
}
function divideResult() {
    var dividemethod = $("#divider > select").val();
    var table = $(".tablebox > table");
    if (dividemethod == "none") {
        table.nextAll().hide();
        table.show();
    }
    else {
        table.nextAll().remove();
        var columnindex = { "name": 2, "dept": 3, "date": 0, "seq": 1, "signinsitu": 4, "signoutsitu": 7 }[dividemethod];
        var values = new Array(""), tables = new Array(table);
        var trs = table.find("tr");
        for (var i = 1; i < trs.length - 1; i++) {
            var val, groupindex = -1;
            if (columnindex == 4 || columnindex == 7) {
                val = $(trs[i]).children(":eq(" + columnindex + ")").attr("class");
            }
            else {
                val = $(trs[i]).children(":eq(" + columnindex + ")").text();
            }
            for (var j = 1; j < values.length; j++) {
                if (val == values[j]) {
                    groupindex = j; break;
                }
            }
            if (groupindex == -1) {
                groupindex = tables.length;
                $(".tablebox").append('<div class="groupbox"><table rules="all"></table></div>');
                values.push(val); tables.push($(".groupbox:last > table"));
                tables[groupindex].append(trs[0].outerHTML);
            }
            tables[groupindex].append(trs[i].outerHTML);
        }
        for (var i = 1; i < tables.length; i++) {
            generateAudit(tables[i]);
            performTableStatus(tables[i]);
        }
        table.hide();
    }
}
function deleteResult(_index) {
    if (!parent.isLogined()) {
        return;
    }
    if (!parent.authorities[4][3]) {
        alert("你没有此操作的权限！");
        return;
    }
    var thisrow = $(event.target).parent().parent();
    if (new Date() - startdate > 7 * 86400000) {
        alert("统计时间已过！");
        return;
    }
    if (!confirm("确定要删除此项值班记录吗？")) {
        return;
    }
    var scheduleid = thisrow.attr("scheduleid");
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 3000,
        data: { action: "deleteschedule", scheduleid: scheduleid },
        success: function (data) {
            if (data == "true") {
                var groupbox = thisrow.parents(".groupbox");
                if (groupbox.length != 0) { //分组显示
                    var origintable = $(".tablebox > table");
                    var originrow = origintable.find("tr:eq(" + _index + ")");
                    originrow.remove();
                    generateAudit(origintable);
                    thisrow.remove();
                    if (groupbox.find("tr").length == 2) { //分组中没有值班项了
                        groupbox.remove();
                        if (origintable.find("tr").length == 2) { //整个值班记录中无值班项
                            origintable.show();
                            var select = $("#divider > select");
                            select.val(""); select.attr("disabled");
                        }
                    }
                    else {
                        generateAudit(groupbox.children("table"));
                    }
                }
                else { //未分组
                    thisrow.remove();
                    generateAudit($(".tablebox > table"));
                }
                var index = (new Date(thisrow.children(":eq(0)").text()) - startdate) / 86400000 * 5 +
                    parseInt(thisrow.children(":eq(1)").text()) - 1;
                var _signresult = signresult[index];
                for (var i = 0; i < _signresult.length / 7; i++) { //删除数组中对应的项
                    if (parseInt(scheduleid) == _signresult[i * 7]) {
                        _signresult.splice(i * 7, 7);
                        break;
                    }
                }
                setTimeout(function () {
                    alert("删除成功！");
                }, 200);
            }
            else {
                alert(data);
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("删除操作超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
        }
    });
}
function outputSignAudit() {
    var button = $(event.target);
    button.attr("disabled", true);
    if (!parent.isLogined()) {
        return;
    }
    if (!startdate) {
        alert("请先选择一周！");
        button.removeAttr("disabled");
        return;
    }
    var hasdata = false, dividemethod, table = $("#audit > table");
    if (table.css("display") != "none") {
        var tds = table.find("td");
        for (var i = 0; i < tds.length; i++) {
            if (tds[i].innerHTML != "无数据") {
                hasdata = true;
                break;
            }
        }
        dividemethod = "";
    }
    else {
        if ($(".tablebox > table tr").length > 2) {
            hasdata = true;
        }
        dividemethod = $("#divider > select").val();
    }
    if (!hasdata) {
        alert("无数据！");
        button.removeAttr("disabled");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 10000,
        data: { action: "outputsignresult", startdate: startdatestr, dividemethod: dividemethod },
        success: function (data) {
            if (data[0] == 't') {
                window.open(data.split(':')[1]);
            }
            else {
                alert(data);
            }
            button.removeAttr("disabled");
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("导出超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            button.removeAttr("disabled");
        }
    });
}
function differenceOfTime(time1, time2) {
    var t = time2.split(':');
    return (time1.Hours * 60 + time1.Minutes) * 60 + time1.Seconds -
        ((parseInt(t[0]) * 60) + parseInt(t[1])) * 60;
}
function generateAudit(table) {
    var trs = table.find("tr");
    var len = trs.length, totalminutes = 0, latecounts = 0, earlyleavecount = 0, nosignincount = 0, nosignoutcount = 0;
    if ($(trs[len - 1]).children().length == 1) {
        $(trs[--len]).remove();
    }
    var colspan;
    if (table.find(".th_operate > span").text() == ">") {
        colspan = 8;
    }
    else {
        colspan = 12;
    }
    if (len == 1) {
        table.append('<tr><td colspan="' + colspan + '" class="td_audit">无数据</td></tr>');
        return;
    }
    for (var i = 1; i < len; i++) {
        var signinresult = $(trs[i]).children(":eq(4)").text();
        if (signinresult[0] == '迟') {
            latecounts++;
        }
        else if (signinresult[0] == '未') {
            nosignincount++;
        }
        var signoutresult = $(trs[i]).children(":eq(7)").text();
        if (signoutresult[0] == '早') {
            earlyleavecount++;
        }
        else if (signoutresult[0] == '未') {
            nosignoutcount++;
        }
        totalminutes = totalminutes + parseInt($(trs[i]).children(":eq(10)").attr("minutes"));
    }
    var hours = Math.floor(totalminutes / 60), minutes = totalminutes % 60;
    table.append('<tr><td colspan="' + colspan + '" class="td_audit">总班次:<span>' + (trs.length - 1) + '</span>，总值班时长:<span>' +
    (totalminutes != 0 ? (hours != 0 ? hours + '小时' : '') + (minutes != 0 ? minutes + '分钟' : '') : '0分钟') +
    '</span>，迟到次数:<span>' + latecounts + '</span>，早退次数:<span>' + earlyleavecount +
    '</span>，未签入次数:<span>' + nosignincount + '</span>，未签出次数:<span>' + nosignoutcount + '</span></td></tr>');
}

function displayAddTerm() {
    var selects = $(".addterm-select");
    var yearselect = $(selects[0]);
    var thisyear = new Date().getFullYear();
    fillSelect(yearselect, new Array((thisyear - 1), thisyear, (thisyear + 1)), "请选择学年")
    selects[1].value = "";
    $(".addterm-text").val("");
}
function addterm_keypress() {
    if (event.keyCode == 13) {
        event.preventDefault();
        addTerm();
    }
}
function addterm_button_click() {
    $("#addterm:button").attr("disabled", "disabled");
    $("#addterm").unbind("keypress");
    $(".message").stop(true, true);
    var year = $(".addterm-select:first");
    var term = $(".addterm-select:last");
    var date = $(".addterm-text:first");
    var week = $(".addterm-text:last");
    year.next().hide();
    term.next().hide();
    date.next().hide();
    week.next().hide();
    if (judgeInput(year, term, date, week)) {
        var result = isTermExist(year.val(), term.val());
        if (result != undefined) {
            if (!result || confirm("该学期信息已存在，要替换吗？")) {
                addTerm(year.val(), term.val(), date.val(), week.val());
                return;
            }
        }
    }
    addTermComplete();
}
function judgeInput(year, term, termstartdate, weeknum) {
    var allpass = true;
    if (year.val() == "") {
        year.next().css("display", "inline-block");
        allpass = false;
    }
    if (term.val() == "") {
        term.next().css("display", "inline-block");
        allpass = false;
    }
    if (termstartdate.val() == "") {
        termstartdate.next().css("display", "inline-block");
        allpass = false;
    }
    if (weeknum.val() == "") {
        weeknum.next().css("display", "inline-block");
        allpass = false;
    }
    if (allpass) {
        var msg = "";
        var re = /^\d*$/;
        var value = weeknum.val();
        if (termstartdate[0].valueAsDate < new Date(year.val(), 0) || termstartdate[0].valueAsDate > new Date(parseInt(year.val()) + 1, 0)) {
            termstartdate.next().css("display", "inline-block");
            msg = "开始日期应在所选学年内、";
        }
        if (!re.test(value)) {
            weeknum.next().css("display", "inline-block");
            msg = msg + "周数应为数字、";
        }
        else if (value < 1 || value > 25) {
            weeknum.next().css("display", "inline-block");
            msg = msg + "周数超出范围限制、";
        }
        if (msg != "") {
            showMessage(msg.substr(0, msg.length - 1) + '！');
            allpass = false;
        }
    }
    else {
        showMessage("请完成所有数据输入后再提交！");
    }
    return allpass;
}
function isTermExist(year, term) {
    if (!parent.isLogined()) {
        return;
    }
    var result;
    $.ajax({
        type: "POST",
        async: false,
        url: "/Handler/Admin.ashx",
        data: { action: "istermexist", year: year, term: term },
        success: function (data) {
            result = data;
        },
        error: function () {
            result = "系统错误，请联系管理员！";
        }
    });
    if (result == "True" || result == "False") {
        return result == "True";
    }
    else {
        showMessage(result);
    }
}
function addTerm(year, term, termstartdate, weeknum) {
    if (!parent.isLogined()) {
        return;
    }
    $.ajax({
        type: "POST",
        url: "/Handler/Admin.ashx",
        timeout: 5000,
        data: { action: "addterm", year: year, term: term, startdate: termstartdate, weeknum: weeknum },
        success: function (data) {
            if (data == "true") {
                alert("学期添加成功！");
                yearsfetched = false;
                parent.changeAffair(0);
            }
            else {
                showMessage(data);
            }
            addTermComplete();
        },
        error: function (response, status) {
            if (status == "timeout") {
                showMessage("请求超时，请重试！");
            }
            else {
                showMessage("系统错误，请联系管理员！");
            }
            addTermComplete();
        }
    });
}
function addTermComplete() {
    $("#addterm:button").removeAttr("disabled");
    $("#addterm").keypress(function () { addterm_keypress(); });
}
function hideNext() {
    $(event.currentTarget).next().hide();
}
function showMessage(message) {
    var msgarea = $(".message");
    msgarea.text(message);
    msgarea.fadeIn(500);
    msgarea.fadeOut(5000);
}

function fillSelect(select, data, prompt) {
    var html = "";
    if (prompt != undefined) {
        html = html + "<option value=\"\" selected=\"selected\" hidden=\"hidden\">" + prompt + "</option>";
    }
    for (var i = 0; i < data.length; i++) {
        html = html + "<option value=\"" + data[i] + "\">" + data[i] + "</option>";
    }
    select.html(html);
}
function getDateString(date) {
    var datestr = date.getFullYear() + '-'
    datestr = datestr + (date.getMonth() < 9 ? '0' : "") + (date.getMonth() + 1) + '-'; //getMonth()要+1才是真正的月份
    datestr = datestr + (date.getDate() < 10 ? '0' : "") + date.getDate();
    return datestr;
}