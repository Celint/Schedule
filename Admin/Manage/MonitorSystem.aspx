<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MonitorSystem.aspx.cs" Inherits="Admin_Manage_MonitorSystem" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link href="../../CSS/MonitorSystem.css" rel="stylesheet" />
    <script src="../../Scripts/JQuery.js"></script>
    <script src="../../Scripts/MonitorSystem.js"></script>
</head>
<body>
    <form id="form">
        <div id="sysstate">
            <h3>查看系统状态</h3>
            <div class="div_sup">
                <div class="div_sub">
                    <span>访客数量：</span><b></b>
                </div>
                <div class="div_sub">
                    <span>访客数量峰值：</span><b></b>
                </div>
            </div>
            <div class="div_sup">
                <div class="div_sub">
                    <span>在线用户数量：</span><b></b>
                </div>
                <div class="div_sub">
                    <span>在线管理员数量：</span><b></b>
                </div>
            </div>
            <div class="div_sup">
                <div class="div_sub">
                    <span>秒请求数：</span><b></b>
                </div>
                <div class="div_sub">
                    <span>总请求数：</span><b></b>
                </div>
            </div>
            <div class="div_sup">
                <div class="div_sub">
                    <span>系统维护状态：</span><b></b>
                </div>
            </div>
            <input type="button" value="系统维护" />
        </div>
        <div id="lookuponlines">
            <h3>查看在线用户</h3>
            <div id="onlineaccounts">
                <div id="filter">
                    <b>用户学号：</b>
                    <input type="text" maxlength="11" />
                    <input type="button" onclick="searchLoginedAccount()" value="查找" />
                </div>
                <div class="tablebox">
                    <table id="onlineusers" rules="all">
                        <tr class="firstrow">
                            <th>序号</th>
                            <th>用户ID</th>
                            <th>访客ID</th>
                            <th>最后活动时间</th>
                            <th>操作</th>
                        </tr>
                    </table>
                    <table id="onlineadmins" rules="all">
                        <tr class="firstrow">
                            <th>序号</th>
                            <th>管理员ID</th>
                            <th>管理员类型</th>
                            <th>访客ID</th>
                            <th>最后活动时间</th>
                            <th>操作</th>
                        </tr>
                    </table>
                </div>
                <div id="pager">
                    <a href="javascript: gotoFirstPage(0);">首页</a><!-- 去除元素中间空白
                 --><span>…</span><!-- 去除元素中间空白
                 --><a href="javascript: gotoPrevPage();">&lt;上一页</a><!-- 去除元素中间空白
                 --><a href="javascript: gotoNextPage();">下一页&gt;</a><!-- 去除元素中间空白
                 --><span>…</span><!-- 去除元素中间空白
                 --><a href="javascript: gotoEndPage();">尾页</a><!-- 去除元素中间空白
                 --><span>共<b></b>页，第<input type="number" />页</span><!-- 去除元素中间空白
                 --><input type="button" onclick="gotoPage()" value="跳" />
                </div>
            </div>
        </div>
    </form>
</body>
</html>
