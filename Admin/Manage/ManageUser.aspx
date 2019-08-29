<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ManageUser.aspx.cs" Inherits="ManageUser" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link href="../../CSS/ManageUser.css" rel="stylesheet" />
    <script src="../../Scripts/JQuery.js"></script>
    <script src="../../Scripts/ManageUser.js"></script>
</head>
<body>
    <form id="form">
        <div id="lookup">
            <h3>查看用户信息</h3>
            <div id="userinfo">
                <div id="filter">
                    <span>过滤条件：</span>
                    <b>按：</b>
                    <select onchange="methodChange()">
                        <option value="" hidden="hidden" selected="selected"></option>
                        <option value="姓名">姓名</option>
                        <option value="学号">学号</option>
                        <option value="部门">部门</option>
                        <option value="学院">学院</option>
                        <option value="班级">班级</option>
                        <option value="年级">年级</option>
                        <option value="状态">可用状态</option>
                    </select>
                    <b>关键词：</b>
                    <input type="text" maxlength="11" />
                    <select></select>
                    <input type="button" onclick="searchUser()" value="查找" />
                </div>
                <div class="tablebox">
                    <table rules="all">
                        <tr class="firstrow">
                            <th>序号</th>
                            <th>姓名</th>
                            <th>学号</th>
                            <th>部门</th>
                            <th>学院</th>
                            <th>专业班级</th>
                            <th>年级</th>
                            <th>可用状态</th>
                            <th>性别</th>
                            <th>生日</th>
                            <th>QQ</th>
                            <th>微信</th>
                            <th>电话号码</th>
                            <th>身份证号</th>
                            <th>宿舍</th>
                            <th>家庭住址</th>
                            <th class="th_operate">操作<span title="折叠" onclick="changeTableStatus()">&lt;</span></th>
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
            <input type="button" value="全部显示" onclick="showTotal()" />
            <input type="button" value="全选列表" onclick="selectAll()" />
            <input type="button" value="选中此页" onclick="selectPage()" />
            <input type="button" value="修改所选" onclick="alterSelection()" />
            <input type="button" value="禁用所选" onclick="deactiveSelection()" />
            <input type="button" value="激活所选" onclick="activeSelection()" />
            <input type="button" value="删除所选" onclick="deleteSelection()" />
        </div>

        <div id="add">
            <div id="addmethod">
                <span>添加方式：</span><!-- 去除元素中间空白
             --><select onchange="addMethodChange()">
                 <option value="batch">批量添加</option>
                 <option value="single">单个添加</option>
             </select>
            </div>
            <div id="add_batch">
                <div class="sub"><span>上传模板：</span><a href="/Outputs/用户信息 模板.xls">用户信息 模板.xls</a></div>
                <div class="sub"><span>宏支持程序：</span><a href="/Outputs/Visual Basic for Application 7.0.1589.exe">Visual Basic for Application.exe</a></div>
                <div class="sub">
                    <span>文件：</span><p>点击上传</p>
                    <div class="filebox">
                        <input type="file" accept=".xls" onchange="addBatch()" />
                    </div>
                </div>
                <ol type="1." class="prompt">
                    <li>请下载用户信息模板，严格按模板格式完成用户数据的输入。</li>
                    <li>为保证数据的完整性，需要启用宏才能进行数据输入。如果使用WPS且不支持宏，请下载宏支持程序安装后重启WPS即可。</li>
                    <li>请将含有用户数据的模板另存为“*.xls”格式的文件后上传。</li>
                </ol>
            </div>
            <div id="add_single">
                <h3>用户信息</h3>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">姓名：</span><!-- 去除元素中间空白
                     --><input type="text" id="name" class="text" maxlength="5" title="非空 不多于5个字符" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">学号：</span><!-- 去除元素中间空白
                     --><input type="text" id="sno" class="text" maxlength="11" title="非空 不多于11个数字或字母" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">所属部门：</span><!-- 去除元素中间空白
                     --><select></select>
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">学院：</span><!-- 去除元素中间空白
                     --><input type="text" id="school" class="text" maxlength="12" title="不多于11个字符" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">年级：</span><!-- 去除元素中间空白
                     --><input type="text" id="grade" class="text" maxlength="4" title="4个数字" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">专业班级：</span><!-- 去除元素中间空白
                     --><input type="text" id="class" class="text" maxlength="12" title="不多于12个字符" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">性别：</span><!-- 去除元素中间空白
                     --><input type="radio" name="sex" class="radio" /><label>♂</label><!-- 去除元素中间空白
                     --><input type="radio" name="sex" class="radio" /><label>♀</label>
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">生日：</span><!-- 去除元素中间空白
                     --><input type="date" id="birthday" class="text" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">QQ号：</span><!-- 去除元素中间空白
                     --><input type="text" id="qq" class="text" maxlength="10" title="不多于10个数字" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">微信号：</span><!-- 去除元素中间空白
                     --><input type="text" id="wechat" class="text" maxlength="11" title="不多于11个字符" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">电话号码：</span><!-- 去除元素中间空白
                     --><input type="text" id="phone" class="text" maxlength="11" title="不多于11个数字" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">身份证号：</span><!-- 去除元素中间空白
                     --><input type="text" id="idcard" class="text" maxlength="18" title="18个数字" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">宿舍：</span><!-- 去除元素中间空白
                     --><input type="text" id="dormitory" class="text" maxlength="15" title="不多于15个字符" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">家庭地址：</span><!-- 去除元素中间空白
                     --><input type="text" id="address" class="text" maxlength="25" title="不多于25个字符" />
                    </div>
                </div>
                <input type="button" onclick="addSingle()" value="单个添加" />
            </div>
        </div>
    </form>

    <div id="alteruserinfo" onkeypress="keypress()">
        <h3>修改用户信息</h3>
        <div class="div_info">
            <span class="span_prev">姓名：</span><!-- 去除元素中间空白
         --><input type="text" field="name" class="text" onchange="valueChanged()" maxlength="5" title="非空 不多于5个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">学号：</span><!-- 去除元素中间空白
         --><input type="text" field="sno" class="text" onchange="valueChanged()" maxlength="11" title="非空 不多于11个数字或字母" />
        </div>
        <div class="div_info">
            <span class="span_prev">所属部门：</span><!-- 去除元素中间空白
         --><select field="department" onchange="valueChanged()"></select>
        </div>
        <div class="div_info">
            <span class="span_prev">学院：</span><!-- 去除元素中间空白
         --><input type="text" field="school" class="text" onchange="valueChanged()" maxlength="12" title="不多于11个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">专业班级：</span><!-- 去除元素中间空白
         --><input type="text" field="class" class="text" onchange="valueChanged()" maxlength="12" title="不多于12个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">年级：</span><!-- 去除元素中间空白
         --><input type="text" field="grade" class="text" onchange="valueChanged()" maxlength="4" title="4个数字" />
        </div>
        <div class="div_info">
            <span class="span_prev">性别：</span><!-- 去除元素中间空白
         --><input type="radio" field="sex" name="sex" class="radio" onchange="valueChanged()" /><label>♂</label><!-- 去除元素中间空白
         --><input type="radio" name="sex" class="radio" onchange="valueChanged()" /><label>♀</label>
        </div>
        <div class="div_info">
            <span class="span_prev">生日：</span><!-- 去除元素中间空白
         --><input type="date" field="birthday" class="text" onchange="valueChanged()" />
        </div>
        <div class="div_info">
            <span class="span_prev">QQ号：</span><!-- 去除元素中间空白
         --><input type="text" field="qq" class="text" onchange="valueChanged()" maxlength="10" title="不多于10个数字" />
        </div>
        <div class="div_info">
            <span class="span_prev">微信号：</span><!-- 去除元素中间空白
         --><input type="text" field="wechat" class="text" onchange="valueChanged()" maxlength="11" title="不多于11个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">电话号码：</span><!-- 去除元素中间空白
         --><input type="text" field="phone" class="text" onchange="valueChanged()" maxlength="11" title="不多于11个数字" />
        </div>
        <div class="div_info">
            <span class="span_prev">身份证号：</span><!-- 去除元素中间空白
         --><input type="text" field="idcard" class="text" onchange="valueChanged()" maxlength="18" title="18个数字" />
        </div>
        <div class="div_info">
            <span class="span_prev">宿舍：</span><!-- 去除元素中间空白
         --><input type="text" field="dormitory" class="text" onchange="valueChanged()" maxlength="15" title="不多于15个字符" />
        </div>
        <div class="div_info">
            <span class="span_prev">家庭地址：</span><!-- 去除元素中间空白
         --><input type="text" field="address" class="text" onchange="valueChanged()" maxlength="25" title="不多于25个字符" />
        </div>
        <input type="button" onclick="confirmAlter()" value="确认" />
        <input type="button" onclick="hideFloatingNode()" value="取消" />
        <p>此次修改只会提交改动的部分！</p>

        <style scoped="scoped">
            #alteruserinfo {
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

                #alteruserinfo > h3 {
                    color: #7248b3;
                    letter-spacing: 6px;
                    margin: 24px 0px 20px;
                }

                #alteruserinfo > input {
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

                #alteruserinfo > p {
                    color: red;
                    margin: 0px 0px 20px 0px;
                    display: none;
                }

            .div_info {
                width: 300px;
                margin: 16px auto;
                text-align: left;
            }

                .div_info > .span_prev {
                    font-family: 楷体;
                    font-size: 18px;
                    width: 92px;
                    display: inline-block;
                    text-align: right;
                }

                .div_info > .text {
                    width: 180px;
                    padding-left: 4px;
                    font-family: 等线;
                    font-size: 17px;
                    line-height: 24px;
                    letter-spacing: 1px;
                    display: inline-block;
                }

                .div_info > .radio {
                    height: 15px;
                    width: 15px;
                    margin: 7px;
                }

                .div_info > label {
                    line-height: 30px;
                    font-size: 21px;
                    margin-right: 20px;
                }

                .div_info > select {
                    font-family: 等线;
                    font-size: 17px;
                    width: 188px;
                    height: 30px;
                    padding-left: 4px;
                    display: inline-block;
                }
        </style>

        <script type="text/javascript">
            var successcall;
            var alterrows;
            function attachInfo(infos) {
                var texts = $(".text");
                for (var i = 0; i < 2; i++) {
                    texts[i].value = infos[i];
                }
                var select = $(".div_info > select");
                var options = select.children()
                for (var i = 0; i < options.length; i++) {
                    if (options[i].innerText == infos[2]) {
                        select.val(options[i].value);
                        break;
                    }
                }
                for (var i = 3; i < 6; i++) {
                    texts[i - 1].value = infos[i];
                }
                var radios = $(".radio");
                if (infos[6] == "男") {
                    radios[0].checked = true;
                }
                else if (infos[6] == "女") {
                    radios[1].checked = true;
                }
                else {
                    radios.prop("checked", false);
                }
                for (var i = 7; i < 14; i++) {
                    texts[i - 2].value = infos[i];
                }
            }
            function showAlter(infos) {
                var animatetime;
                var divs = $(".div_info");
                if (infos) {
                    attachInfo(infos)
                    divs.show();
                    $("#alteruserinfo > p").hide();
                    animatetime = 2000;
                }
                else {
                    divs.filter(":lt(2)").hide();
                    divs.filter(":gt(5)").hide();
                    $(".text").val("");
                    $(".div_info > select").val("");
                    $("#alteruserinfo > p").show();
                    animatetime = 1000;
                }
                divs.removeAttr("valuechanged");
                var alterinfo = $("#alteruserinfo");
                alterinfo.show();
                alterinfo.css("height", "auto");
                height = parseInt(alterinfo.innerHeight());
                alterinfo.css("margin-top", -2);
                alterinfo.height(0);
                alterinfo.animate({ "marginTop": -(height / 2) - 2, "height": height }, animatetime);
            }
            function collectChanges() {
                var changes = new Array(), info = new Array();
                var divs = $(".div_info");
                for (var i = 0; i < 2; i++) {
                    if (divs[i].getAttribute("valuechanged")) {
                        var input = $(divs[i]).children(".text")
                        changes.push(i + 1);
                        changes.push(input.val());
                        info.push('"' + input.attr("field") + '":"' + input.val() + '"')
                    }
                }
                if (divs[2].getAttribute("valuechanged")) {
                    var select = $(divs[2]).children("select");
                    changes.push(3);
                    changes.push($("iframe")[0].contentWindow.departments[parseInt(select.val())].name);
                    info.push('"' + select.attr("field") + '":"' + select.val() + '"')
                }
                for (var i = 3; i < 6; i++) {
                    if (divs[i].getAttribute("valuechanged")) {
                        var input = $(divs[i]).children(".text")
                        changes.push(i + 1);
                        changes.push(input.val());
                        info.push('"' + input.attr("field") + '":"' + input.val() + '"')
                    }
                }
                if (divs[6].getAttribute("valuechanged")) {
                    changes.push(8);
                    if ($(divs[6]).children("radio").prop("checked")) {
                        changes.push("男");
                        info.push('"sex":"男"');
                    }
                    else {
                        changes.push("女");
                        info.push('"sex":"女"');
                    }
                }
                for (var i = 7; i < 14; i++) {
                    if (divs[i].getAttribute("valuechanged")) {
                        var input = $(divs[i]).children(".text")
                        changes.push(i + 2);
                        changes.push(input.val());
                        info.push('"' + input.attr("field") + '":"' + input.val() + '"')
                    }
                }
                return [changes, info];
            }
            function confirmAlter() {
                var button = $("#alteruserinfo > input:first");
                button.attr("disabled", "disabled");
                var alterinfo = $("#alteruserinfo");
                alterinfo.unbind("keypress");
                isLogined();
                var changes = collectChanges();
                if (changes[0].length == 0) {
                    alert("未做任何更改！");
                    alterComplete();
                    return;
                }
                var ids = new Array();
                for (var i = 0; i < alterrows.length; i++) {
                    ids[i] = alterrows[i].getAttribute("userid");
                }
                $.ajax({
                    type: "POST",
                    url: "/Handler/Admin.ashx",
                    timeout: 3000,
                    data: { action: "alteruserinfo", usersid: ids.join(','), userinfo: '{' + changes[1].join(',') + '}' },
                    success: function (data) {
                        if (data == "true") {
                            hideFloatingNode();
                            alert("修改成功！");
                            successcall(alterrows, changes[0]);
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
                $("#alteruserinfo > input:first").removeAttr("disabled");
                $("#alteruserinfo").keypress(function () { keypress(); });
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
