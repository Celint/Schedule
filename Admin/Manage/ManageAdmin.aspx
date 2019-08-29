<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ManageAdmin.aspx.cs" Inherits="ManageAdmin" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link href="../../CSS/ManageAdmin.css" rel="stylesheet" />
    <script src="../../Scripts/JQuery.js"></script>
    <script src="../../Scripts/BigInt.js"></script>
    <script src="../../Scripts/Barrett.js"></script>
    <script src="../../Scripts/RSA.js"></script>
    <script src="../../Scripts/ManageAdmin.js"></script>
</head>
<body>
    <form id="form">
        <div id="lookup">
            <h3>查看管理员信息</h3>
            <div id="admininfo">
                <div id="filter">
                    <span>过滤条件：</span>
                    <b>按：</b>
                    <select onchange="methodChange()">
                        <option value="" hidden="hidden" selected="selected"></option>
                        <option value="管理员名">管理员名</option>
                        <option value="类型">类型</option>
                        <option value="状态">可用状态</option>
                    </select>
                    <b>关键词：</b>
                    <input type="text" maxlength="11" />
                    <select></select>
                    <input type="button" onclick="searchAdmin()" value="查找" />
                </div>
                <div class="tablebox">
                    <table rules="all">
                        <tr class="firstrow">
                            <th>序号</th>
                            <th>管理员名</th>
                            <th>类型</th>
                            <th>权限</th>
                            <th>状态</th>
                            <th>附加说明</th>
                            <th class="th_operate">操作</th>
                        </tr>
                    </table>
                </div>
            </div>
            <input type="button" value="全选列表" onclick="selectAll()" />
            <input type="button" value="禁用所选" onclick="deactiveSelection()" />
            <input type="button" value="激活所选" onclick="activeSelection()" />
            <input type="button" value="删除所选" onclick="deleteSelection()" />
        </div>

        <div id="add">
            <h3>添加管理员</h3>
            <div class="div_sub">
                <span class="span_prev">管理员名：</span><!-- 去除元素中间空白
             --><input type="text" class="text" maxlength="10" title="非空 不多于10个字符" />
            </div>
            <div class="div_sub">
                <span class="span_prev">密码：</span><!-- 去除元素中间空白
             --><input type="password" class="text" maxlength="16" title="默认为“123456”，长度在8～16个字符之间" /><!-- 去除元素中间空白
             --><span class="span_next">可不填</span>
            </div>
            <div class="div_sub">
                <span class="span_prev">附加说明：</span><!-- 去除元素中间空白
             --><input type="text" class="text" maxlength="25" title="不多于25个字符" /><!-- 去除元素中间空白
             --><span class="span_next">可不填</span>
            </div>
            <div class="div_sub">
                <span class="span_prev">管理员类型：</span>
                <div id="admintypes">
                </div>
            </div>
            <div class="div_sub">
                <span class="span_prev">权限：</span>
                <div id="authorities">
                </div>
            </div>
            <input type="button" onclick="add()" value="确认添加" />
            <p class="message"></p>
        </div>
    </form>

    <div id="alteradmininfo" onkeypress="keypress()">
        <h3>修改管理员信息</h3>
        <div class="div_info">
            <span class="span_prev">管理员名：</span><!-- 去除元素中间空白
         --><input type="text" field="name" class="text" onchange="valueChanged()" maxlength="10" title="不多于10个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">附加说明：</span><!-- 去除元素中间空白
         --><input type="text" field="remark" class="text" onchange="valueChanged()" maxlength="25" title="不多于25个字符" />
        </div>
        <input type="button" onclick="confirmAlter()" value="确认" />
        <input type="button" onclick="hideFloatingNode()" value="取消" />

        <style>
            #alteradmininfo {
                width: 350px;
                margin-left: -177px;
                border: 2px solid #6b8bb9;
                background-color: #f5f5f0;
                border-radius: 10px;
                left: 50%;
                top: 50%;
                text-align: center;
                overflow: hidden;
                position: absolute;
                display: none;
            }

                #alteradmininfo > h3 {
                    color: #7248b3;
                    letter-spacing: 6px;
                    margin: 24px 0px 20px;
                }

                #alteradmininfo > input {
                    background-color: #e8e8e8;
                    color: #8c7bb3;
                    font-size: 15px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    height: 28px;
                    width: 68px;
                    margin: 4px 10px 20px;
                    border-radius: 5px;
                }

            .div_info {
                margin: 26px auto;
                width: 320px;
                text-align: left;
            }

                .div_info > .span_prev {
                    color: #003399;
                    font-family: 楷体;
                    font-size: 18px;
                    width: 110px;
                    line-height: 30px;
                    display: inline-block;
                    text-align: right;
                }

                .div_info > .text {
                    padding-left: 4px;
                    font-family: 等线;
                    font-size: 16px;
                    line-height: 26px;
                    letter-spacing: 1px;
                    width: 170px;
                    display: inline-block;
                    border: solid 1px grey;
                    vertical-align: top;
                }
        </style>

        <script type="text/javascript">
            var successcall;
            var alterrow;
            function showAlter(infos, authorities) {
                var alterinfo = $("#alteradmininfo");
                var texts = $(".text");
                texts[0].value = infos[0];
                texts[1].value = infos[1];
                alterinfo.show();
                alterinfo.css("height", "auto");
                height = parseInt(alterinfo.innerHeight());
                alterinfo.css("margin-top", -2);
                alterinfo.height(0);
                alterinfo.animate({ "marginTop": -(height / 2) - 2, "height": height }, 500);
            }
            function collectChanges() {
                var changes = new Array(), info = new Array();
                var divs = $(".div_info");
                if (divs[0].getAttribute("valuechanged")) {
                    var input = $(divs[0]).children(".text")
                    changes.push(1);
                    changes.push(input.val());
                    info.push('"' + input.attr("field") + '":"' + input.val() + '"')
                }
                if (divs[1].getAttribute("valuechanged")) {
                    var input = $(divs[1]).children(".text")
                    changes.push(5);
                    changes.push(input.val());
                    info.push('"' + input.attr("field") + '":"' + input.val() + '"')
                }
                return [changes, info];
            }
            function confirmAlter() {
                var button = $("#alteradmininfo > input:first");
                button.attr("disabled", "disabled");
                var alterinfo = $("#alteradmininfo");
                alterinfo.unbind("keypress");
                isLogined();
                var changes = collectChanges();
                if (changes[0].length == 0) {
                    alert("未做任何更改！");
                    alterComplete();
                    return;
                }
                $.ajax({
                    type: "POST",
                    url: "/Handler/Admin.ashx",
                    timeout: 3000,
                    data: { action: "alteradmininfo", adminid: alterrow.attr("adminid"), admininfo: '{' + changes[1].join(',') + '}' },
                    success: function (data) {
                        if (data == "true") {
                            hideFloatingNode();
                            alert("修改成功！");
                            successcall(alterrow, changes[0]);
                        }
                        else {
                            alert(data);
                        }
                        alterComplete();
                    },
                    error: function (response, status) {
                        if (status == "timeout") {
                            alert("操作超时，请重试！");
                        }
                        else {
                            alert("系统错误，请联系管理员！");
                        }
                        alterComplete();
                    }
                });
            }
            function alterComplete() {
                $("#alteradmininfo > input:first").removeAttr("disabled");
                $("#alteradmininfo").keypress(function () { keypress(); });
            }
            function keypress() {
                if (event.keyCode == 13) {
                    event.target.blur();
                    event.preventDefault();
                    confirmAlter();
                }
            }
            function valueChanged() {
                $(event.target).parent().attr("valuechanged", "valuechanged");
            }
        </script>
    </div>

</body>
</html>
