<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>管理员登录_大创网签到系统</title>
    <link href="../CSS/Login_Admin.css" rel="stylesheet" />
    <script type="text/javascript" src="../Scripts/JQuery.js"></script>
    <script type="text/javascript" src="../Scripts/BigInt.js"></script>
    <script type="text/javascript" src="../Scripts/Barrett.js"></script>
    <script type="text/javascript" src="../Scripts/RSA.js"></script>
    <script type="text/javascript" src="../Scripts/Login_Admin.js"></script>
</head>
<body>
    <form id="form1">
        <div id="login">
            <p id="head">管理员登录</p>
            <hr />
            <div id="account">
                <input type="text" maxlength="10" placeholder="账号" onfocus="hideNext()" /><span>*</span>
            </div>
            <div id="password">
                <input type="password" maxlength="16" placeholder="密码" onfocus="hideNext()" /><span>*</span>
            </div>
            <div id="vcode">
                <img src="../Handler/Verification Code.ashx" title="单击换一张图片" onclick="refreshVCode()" />
                <input type="text" maxlength="5" placeholder="验证码" onfocus="hideNext()" /><span>*</span>
            </div>
            <div id="button">
                <input type="button" value="登录" onclick="button_click()" />
            </div>
            <p id="message"></p>
        </div>
    </form>
    <img src="../Images/login_background_admin.jpg" />
</body>
</html>
