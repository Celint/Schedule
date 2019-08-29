<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CheckLogs.aspx.cs" Inherits="CheckLogs" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link href="../../CSS/CheckLogs.css" rel="stylesheet" />
    <script src="../../Scripts/JQuery.js"></script>
    <script src="../../Scripts/CheckLogs.js"></script>
</head>
<body>
    <form id="form">
        <div id="lookup">
            <h3>查看用户日志</h3>
            <div id="logsinfo">
                <div id="filter">
                    <span>过滤条件：</span>
                    <div>
                        <div class="conditions">
                            <b>用户ID：</b>
                            <input type="text" maxlength="8" />
                        </div>
                        <div class="conditions">
                            <b>事件类型：</b>
                            <select></select>
                        </div>
                        <div class="conditions">
                            <b>时间段：</b>
                            <input type="datetime-local" />
                            <span>-</span>
                            <input type="datetime-local" />
                        </div>
                    </div>
                    <input type="button" onclick="searchLogs()" value="查找" />
                </div>
                <div class="tablebox">
                    <table rules="all">
                        <tr class="firstrow">
                            <th>序号</th>
                            <th>用户ID</th>
                            <th>时间</th>
                            <th>事件详情</th>
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
            <input type="button" value="全选列表" onclick="selectAll()" />
            <input type="button" value="选中此页" onclick="selectPage()" />
            <input type="button" value="删除所选" onclick="deleteLogs()" />
        </div>
    </form>
</body>
</html>
