<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Schedule.aspx.cs" Inherits="Schedule" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script src="../../Scripts/JQuery.js"></script>
    <script src="../../Scripts/Schedule.js"></script>
    <link href="../../CSS/Schedule.css" rel="stylesheet" />
</head>

<body>
    <form>
        <div id="title">
            <select class="title-select title-select_year" onchange="yearChanged()"></select>
            <span class="title-span">学年</span>
            <select class="title-select title-select_term" onchange="termChanged()"></select>
            <span class="title-span">学期   第</span>
            <select class="title-select title-select_week" onchange="weekChanged()"></select>
            <span class="title-span">周</span>
        </div>

        <div id="schedule">
            <table rules="all">
                <tr>
                    <th class="th_first">
                        <p>班次</p>
                        <p>日期</p>
                    </th>
                    <th>星期一</th>
                    <th>星期二</th>
                    <th>星期三</th>
                    <th>星期四</th>
                    <th>星期五</th>
                    <th>星期六</th>
                    <th>星期日</th>
                </tr>
                <tr>
                    <th>第一班</th>
                    <td index="0"></td>
                    <td index="5"></td>
                    <td index="10"></td>
                    <td index="15"></td>
                    <td index="20"></td>
                    <td index="25"></td>
                    <td index="30"></td>
                </tr>
                <tr>
                    <th>第二班</th>
                    <td index="1"></td>
                    <td index="6"></td>
                    <td index="11"></td>
                    <td index="16"></td>
                    <td index="21"></td>
                    <td index="26"></td>
                    <td index="31"></td>
                </tr>
                <tr>
                    <th>第三班</th>
                    <td index="2"></td>
                    <td index="7"></td>
                    <td index="12"></td>
                    <td index="17"></td>
                    <td index="22"></td>
                    <td index="27"></td>
                    <td index="32"></td>
                </tr>
                <tr>
                    <th>第四班</th>
                    <td index="3"></td>
                    <td index="8"></td>
                    <td index="13"></td>
                    <td index="18"></td>
                    <td index="23"></td>
                    <td index="28"></td>
                    <td index="33"></td>
                </tr>
                <tr>
                    <th>第五班</th>
                    <td index="4"></td>
                    <td index="9"></td>
                    <td index="14"></td>
                    <td index="19"></td>
                    <td index="24"></td>
                    <td index="29"></td>
                    <td index="34"></td>
                </tr>
            </table>
            <input type="button" value="自动排班" onclick="autoSchedule()" />
            <input type="button" title="此操作去除排班表中对应班次不为空闲的值班人员" value="更新排班表" onclick="updateSchedule()" />
            <input type="button" value="保存排班表" onclick="saveSchedule()" />
            <input type="button" value="导出排班表" onclick="outputSchedule()" />
            <input type="button" value="导出空闲人员" onclick="outputFreeUsers()" />
            <input type="button" value="下一周" onclick="nextWeek()" />
        </div>

        <div id="audit">
            <div id="displaymode">
                <span>显示方式：</span><input type="radio" id="tablemode" name="mode" onclick="showResultAsTable()" checked="checked" /><label for="tablemode">表格显示</label>
                <input type="radio" id="listmode" name="mode" onclick="showResultAsList()" /><label for="listmode">列表显示</label>
            </div>
            <table rules="all">
                <tr>
                    <th rowspan="2" class="th_first">
                        <p>班次</p>
                        <p>日期</p>
                    </th>
                    <th>星期一</th>
                    <th>星期二</th>
                    <th>星期三</th>
                    <th>星期四</th>
                    <th>星期五</th>
                    <th>星期六</th>
                    <th>星期日</th>
                </tr>
                <tr>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                    <th class="th_action">
                        <div>
                            <span>入站</span>
                            <i></i>
                            <span>出站</span>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th>第一班</th>
                    <td index="0"></td>
                    <td index="5"></td>
                    <td index="10"></td>
                    <td index="15"></td>
                    <td index="20"></td>
                    <td index="25"></td>
                    <td index="30"></td>
                </tr>
                <tr>
                    <th>第二班</th>
                    <td index="1"></td>
                    <td index="6"></td>
                    <td index="11"></td>
                    <td index="16"></td>
                    <td index="21"></td>
                    <td index="26"></td>
                    <td index="31"></td>
                </tr>
                <tr>
                    <th>第三班</th>
                    <td index="2"></td>
                    <td index="7"></td>
                    <td index="12"></td>
                    <td index="17"></td>
                    <td index="22"></td>
                    <td index="27"></td>
                    <td index="32"></td>
                </tr>
                <tr>
                    <th>第四班</th>
                    <td index="3"></td>
                    <td index="8"></td>
                    <td index="13"></td>
                    <td index="18"></td>
                    <td index="23"></td>
                    <td index="28"></td>
                    <td index="33"></td>
                </tr>
                <tr>
                    <th>第五班</th>
                    <td index="4"></td>
                    <td index="9"></td>
                    <td index="14"></td>
                    <td index="19"></td>
                    <td index="24"></td>
                    <td index="29"></td>
                    <td index="34"></td>
                </tr>
            </table>

            <div id="audit_list">
                <div id="divider">
                    <b>按：</b>
                    <select onchange="divideResult()">
                        <option value="" hidden="hidden" selected="selected"></option>
                        <option value="name">姓名</option>
                        <option value="dept">部门</option>
                        <option value="date">日期</option>
                        <option value="seq">班次</option>
                        <option value="signinsitu">签入情况</option>
                        <option value="signoutsitu">签出情况</option>
                        <option value="none">不分组</option>
                    </select>
                    <b>分组</b>
                </div>
                <div class="tablebox">
                    <table rules="all">
                        <tr class="firstrow">
                            <th>日期</th>
                            <th>班次</th>
                            <th>姓名</th>
                            <th>部门</th>
                            <th>签入情况</th>
                            <th class="th_canhide">签入时间</th>
                            <th class="th_canhide">签入备注</th>
                            <th>签出情况</th>
                            <th class="th_canhide">签出时间</th>
                            <th class="th_canhide">签出备注</th>
                            <th>值班时长</th>
                            <th class="th_operate">操作<span title="折叠" onclick="changeTableStatus()">&lt;</span></th>
                        </tr>
                    </table>
                </div>
            </div>

            <input type="button" value="导出数据" onclick="outputSignAudit()" />
            <input type="button" value="上一周" onclick="prevWeek()" />
        </div>

        <div id="addterm" onkeypress="addterm_keypress()">
            <h3>添加学期信息</h3>
            <div class="sub">
                <span class="span_prev">学年：</span>
                <select class="addterm-select" onchange="hideNext()"></select>
                <span class="span_next">*</span>
            </div>
            <div class="sub">
                <span class="span_prev">学期：</span>
                <select class="addterm-select" onchange="hideNext()">
                    <option value="" selected="selected" hidden="hidden">请选择学期</option>
                    <option value="上">上</option>
                    <option value="下">下</option>
                </select>
                <span class="span_next">*</span>
            </div>
            <div class="sub">
                <span class="span_prev">开始日期：</span>
                <input type="date" class="addterm-text" onchange="hideNext()" />
                <span class="span_next">*</span>
            </div>
            <div class="sub">
                <span class="span_prev">周数：</span>
                <input type="text" class="addterm-text" title="范围在1～25之间" maxlength="2" onchange="hideNext()" />
                <span class="span_next">*</span>
            </div>
            <input type="button" value="提交" onclick="addterm_button_click()" />
            <p class="message"></p>
        </div>
    </form>
</body>
</html>
