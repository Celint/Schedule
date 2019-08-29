<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Index.aspx.cs" Inherits="Index" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link href="../CSS/Index_Admin.css" rel="stylesheet" />
    <script src="../Scripts/JQuery.js"></script>
    <script src="../Scripts/BigInt.js"></script>
    <script src="../Scripts/Barrett.js"></script>
    <script src="../Scripts/RSA.js"></script>
    <script src="../Scripts/Index_Admin.js"></script>
    <title>后台管理_中国大学生创业网签到系统</title>
</head>
<body>
    <div id="head">
        <div class="middle">
            <p id="hello">欢迎来到中国大学生创业网签到后台管理系统！</p>
            <div id="admin">
                <p id="adminname"></p>
                <a id="logout" href="javascript:logout()">
                    <img src="../Images/logoout.png" title="退出登录" /></a>
            </div>
        </div>
    </div>
    <hr id="line1" />

    <div id="functions">
        <a class="function-a" href="javascript: changeFunction(0)">排班管理</a><!-- 去除元素中间空白
     --><a class="function-a" href="javascript: changeFunction(1)">用户管理</a><!-- 去除元素中间空白
     --><a class="function-a" href="javascript: changeFunction(2)">管理员管理</a><!-- 去除元素中间空白
     --><a class="function-a" href="javascript: changeFunction(3)">查看日志</a><!-- 去除元素中间空白
     --><a class="function-a" href="javascript: changeFunction(4)">系统状态</a><!-- 去除元素中间空白
     --><a class="function-a" href="javascript: changeFunction(5)">修改密码</a>
    </div>
    <hr id="line2" />

    <div id="main" class="middle">
        <div id="side">
            <dl></dl>
        </div>
        <div id="content">
            <p id="navi"></p>
            <iframe></iframe>
        </div>
    </div>

    <div id="alterpwd-background">
        <div id="alterpwd" onkeypress="pwd_keypress()">
            <p class="p_head">修改密码</p>
            <div class="div_sub">
                <span class="span_prev">原密码：</span><!-- 去除元素中间空白
             --><input type="password" maxlength="16" onfocus="hideNext()" /><!-- 去除元素中间空白
             --><span class="span_next">*</span>
            </div>
            <div class="div_sub">
                <span class="span_prev">新密码：</span><!-- 去除元素中间空白
             --><input type="password" maxlength="16" title="长度在8到16位之间，尽量使用复杂密码。" onfocus="hideNext()" onblur="pwdnew_blur()" /><!-- 去除元素中间空白
             --><span class="span_next">*</span>
            </div>
            <div class="div_sub">
                <span class="span_prev">再次输入：</span><!-- 去除元素中间空白
             --><input type="password" maxlength="16" onfocus="hideNext()" onblur="pwdrepeat_blur()" /><!-- 去除元素中间空白
             --><span class="span_next">*</span>
            </div>
            <input type="button" onclick="confirmAlterPwd()" value="确认" /><!-- 去除元素中间空白
         --><input type="button" onclick="cancelAlterPwd()" value="取消" />
            <div class="message"></div>
        </div>
    </div>

    <div class="background">
    </div>
</body>
</html>
