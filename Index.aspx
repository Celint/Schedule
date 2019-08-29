<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Index.aspx.cs" Inherits="Index" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link href="CSS/Index.css" rel="stylesheet" />
    <script src="Scripts/JQuery.js"></script>
    <script src="Scripts/Index.js"></script>
    <title>签到_中国大学生创业网签到系统</title>
</head>
<body>
    <form id="form">

        <div id="sign" onkeypress="sign_keypress()">
            <div class="head">
                <img src="Images/logo.png" /><p class="p_head">中国大学生创业网</p>
            </div>
            <hr />
            <p>签到系统</p>
            <div class="div_sup">
                <input id="radio_in" type="radio" name="action" class="radio" onchange="hideActionPrompt()" /><label for="radio_in">入站</label><!-- 去除元素中间空白
             --><input id="radio_out" type="radio" name="action" class="radio" onchange="hideActionPrompt()" /><label for="radio_out">出站</label><!-- 去除元素中间空白
             --><div id="actionprompt" class="prompt">
                    <img src="Images/leftarrow.png" /><p>请选择“入站”或“出站”！</p>
                </div>
            </div>
            <div class="div_sup">
                <span class="span_prev">学号：</span><input type="text" class="text" maxlength="10" onchange="hideNext()" /><!-- 去除元素中间空白
             --><div id="snoprompt" class="prompt">
                    <img src="Images/leftarrow.png" /><p>请填写学号！</p>
                </div>
            </div>
            <div class="div_sup">
                <span class="span_prev">班次：</span><!-- 去除元素中间空白
             --><select onchange="hideNext()">
                    <option value="" selected="selected" hidden="hidden">请选择班次</option>
                    <option value="1">第一班</option>
                    <option value="2">第二班</option>
                    <option value="3">第三班</option>
                    <option value="4">第四班</option>
                    <option value="5">第五班</option>
                </select><!-- 去除元素中间空白
             --><div id="seqprompt" class="prompt">
                    <img src="Images/leftarrow.png" /><p>请选择班次！</p>
                </div>
            </div>
            <div class="div_sup">
                <span class="span_prev">备注：</span><textarea maxlength="20" placeholder="有什么想说的……" title="20个字符以内"></textarea>
            </div>
            <input type="button" id="sign-button" onclick="sign()" value="签到" />
        </div>

        <div class="background">
            <div id="feedback" onkeypress="feedback_keypress()">
                <p>反馈建议</p>
                <b onclick="closeFeedback()">×</b>
                <hr />
                <div>
                    <p>主题：</p>
                    <input type="text" class="text" maxlength="20" title="不超过20个字符" />
                </div>
                <div>
                    <p>详细描述：</p>
                    <textarea class="text" maxlength="250"></textarea>
                </div>
                <div>
                    <p>联系方式：</p>
                    <input type="text" class="text" maxlength="20" title="不超过20个字符" />
                </div>
                <input type="button" onclick="feedback()" value="提交" />
            </div>
        </div>
    </form>
    <img src="Images/sign_background.jpg" />
    <a id="a_login" href="User/Login.aspx" target="_blank">用户登录</a>
    <a href="javascript: showFeedback()">反馈建议</a>
</body>
</html>
