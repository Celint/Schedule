<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>用户登录_大创网签到系统</title>
    <link href="../CSS/Login_User.css" rel="stylesheet" />
    <script type="text/javascript" src="../Scripts/JQuery.js"></script>
    <script type="text/javascript" src="../Scripts/BigInt.js"></script>
    <script type="text/javascript" src="../Scripts/Barrett.js"></script>
    <script type="text/javascript" src="../Scripts/RSA.js"></script>
    <script type="text/javascript" src="../Scripts/Login_User.js"></script>
</head>
<body>
    <form id="form1">
        <div id="login">
            <div id="logobox">
                <img src="../Images/logo1.png" /><div></div>
            </div>
            <b>用户登录</b>
            <div class="div_sup">
                <div id="sno" class="inputarea">
                    <img class="icon" src="../Images/user_icon.png" /><!-- 去除元素中间空白
                 --><input type="text" maxlength="11" placeholder="学号" onfocus="inputFocus()" onblur="inputBlur()" onchange="hidePrompt()" />
                </div>
                <div id="snoprompt" class="promptarea">
                    <img src="../Images/leftarrow.png" /><p></p>
                </div>
            </div>
            <div class="div_sup">
                <div id="password" class="inputarea">
                    <img class="icon" src="../Images/password_icon.png" /><!-- 去除元素中间空白
                 --><input type="password" maxlength="16" placeholder="密码" onfocus="inputFocus()" onblur="inputBlur()" onchange="hidePrompt()" />
                </div>
                <div id="pwdprompt" class="promptarea">
                    <img src="../Images/leftarrow.png" /><p></p>
                </div>
            </div>
            <div class="div_sup">
                <div id="vcode" class="inputarea">
                    <img class="icon" src="../Images/vcode_icon.png" /><!-- 去除元素中间空白
                 --><input type="text" maxlength="5" placeholder="验证码" onfocus="inputFocus()" onblur="inputBlur()" onchange="hidePrompt()" /><!-- 去除元素中间空白
                 --><img id="vcode_img" src="../Handler/Verification Code.ashx" title="单击换一张图片" onclick="refreshVCode()" />
                </div>
                <div id="vcodeprompt" class="promptarea">
                    <img src="../Images/leftarrow.png" /><p></p>
                </div>
            </div>
            <input id="loginbutton" type="button" value="登录" onclick="button_click()" />
        </div>
    </form>
    <img src="../Images/login_background_user.jpg" />
</body>
</html>
