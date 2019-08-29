var dutytimes;
$.ajax({
    type: "POST",
    url: "../Handler/Sign.ashx",
    async: false,
    data: { action: "getdutytimes" },
    success: function (data) {
        var _data = JSON.parse(data);
        dutytimes = new Array(5);
        for (var i = 0; i < 5; i++) {
            dutytimes[i] = {
                startTime: _data[2 * i],
                endTime: _data[2 * i + 1]
            };
        }
    },
    error: function () {
        alert("系统错误，请联系管理员！");
        window.close();
    }
});
function hideActionPrompt() {
    $("#actionprompt").fadeOut(2000);
}
function hideNext() {
    $(event.currentTarget).next().fadeOut(2000);
}

function sign() {
    $("#sign-button").attr("disabled", "disabled");
    $("#sign").unbind("keypress");
    var radio = $(".radio");
    var text = $(".text");
    var select = $("select");
    if (!judgeInput(radio, text, select)) {
        signFall();
        return;
    }
    var textarea = $("textarea");
    var seq = select.val();
    var action = "signin";
    if (radio[1].checked) {
        action = "signout";
        if (!compareTime(new Date(), dutytimes[seq - 1].endTime) && !confirm("还未到出站时间（" + getTimeString(dutytimes[seq - 1].endTime) + "），要提前签出吗？")) {
            signFall();
            return;
        }
    }
    $.ajax({
        type: "POST",
        url: "../Handler/Sign.ashx",
        data: { action: action, sno: text.val(), seq: select.val(), remark: textarea.val() },
        timeout: 3000,
        success: function (data) {
            if (data[0] == 't') {
                alert("签到成功！\n" + data.split('\n')[1]);
                if (action == "signin" && compareTime(new Date(), dutytimes[select.val() - 1].startTime)) {
                    alert("迟到了，下次准时哦！(第" + select.val() + "班开始时间：" + getTimeString(dutytimes[select.val() - 1].startTime) + ")");
                }
                location.reload();
            }
            else {
                alert(data);
                var s = data.substring(0, 2);
                if (s == "你来" || s == "你已" || s == "此时") {
                    location.reload();
                }
                signFall();
            }
        },
        error: function (response, status) {
            if (status == "timeout") {
                alert("请求超时，请重试！");
            }
            else {
                alert("系统错误，请联系管理员！");
            }
            signFall();
        }
    });
}
function judgeInput(action, sno, seq) {
    var actionprompt = $("#actionprompt");
    var snoprompt = sno.next();
    var seqprompt = seq.next();
    actionprompt.hide();
    snoprompt.hide();
    seqprompt.hide();
    var allpass = true;
    if (!action[0].checked && !action[1].checked) {
        actionprompt.fadeIn(500);
        actionprompt.css("display", "inline-block");
        allpass = false;
    }
    if (sno.val() == "") {
        snoprompt.fadeIn(500);
        snoprompt.css("display", "inline-block");
        allpass = false;
    }
    if (seq.val() == "") {
        seqprompt.fadeIn(500);
        seqprompt.css("display", "inline-block");
        allpass = false;
    }
    return allpass;
}
function sign_keypress() {
    if (event.keyCode == 13 && event.target.type != "textarea") {
        event.preventDefault();
        sign();
    }
}
function signFall() {
    $("#sign-button").removeAttr("disabled");
    $("#sign").keypress(function () {
        sign_keypress();
    });
}

function showFeedback() {
    $("#feedback :text").val("");
    $("#feedback textarea").val("");
    $(".background").show();
}
function feedback() {
    var text = $("#feedback :text");
    var detail = $("#feedback textarea").val();
    if (text[0].value != "" || detail != "") {
        $.ajax({
            type: "POST",
            url: "../Handler/Sign.ashx",
            data: { action: "feedback", theme: text[0].value, detail: detail, contactinfo: text[1].value },
            timeout: 3000,
            success: function (data) {
                alert("反馈成功！");
            }
        });
    }
    closeFeedback();
}
function feedback_keypress() {
    if (event.keyCode == 13 && event.target.type != "textarea") {
        event.preventDefault();
        feedback();
    }
    else if (event.keyCode == 27) {
        closeFeedback();
    }
}
function closeFeedback() {
    $(".background").fadeOut(1000);
}

function compareTime(time1, time2) {
    return ((time1.getHours() * 60 + time1.getMinutes()) * 60 + time1.getSeconds()) * 1000 + time1.getMilliseconds() >
        ((time2.Hours * 60 + time2.Minutes) * 60 + time2.Seconds) * 1000 + time2.Milliseconds;
}
function getTimeString(time) {
    return (time.Hours < 10 ? '0' + time.Hours : time.Hours) + ':' +
        (time.Minutes < 10 ? '0' + time.Minutes : time.Minutes) + ':' +
        (time.Seconds < 10 ? '0' + time.Seconds : time.Seconds);
}