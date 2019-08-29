<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Index.aspx.cs" Inherits="Index" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>用户页面_中国大学生创业网签到系统</title>
    <link href="../CSS/Index_User.css" rel="stylesheet" />
    <script src="../Scripts/JQuery.js"></script>
    <script type="text/javascript" src="../Scripts/BigInt.js"></script>
    <script type="text/javascript" src="../Scripts/Barrett.js"></script>
    <script type="text/javascript" src="../Scripts/RSA.js"></script>
    <script src="../Scripts/Index_User.js"></script>
</head>
<body>
    <div id="head">
        <div class="middle">
            <p id="hello">欢迎登录中国大学生创业网签到系统！</p>
            <div id="user">
                <p id="username"></p>
                <a id="logout" href="javascript:logout()">
                    <img src="../Images/logoout.png" title="退出登录" /></a>
            </div>
        </div>
    </div>
    <div id="line1"></div>
    <div class="middle">
        <div id="affair">
            <a class="affair-a" href="javascript: changeContent(0)">管理空闲课表</a><!-- 去除元素中间空白
         --><a class="affair-a" href="javascript: changeContent(1)">修改个人信息</a><!-- 去除元素中间空白
         --><a class="affair-a" href="javascript: changeContent(2)">更换登录密码</a>
        </div>
    </div>
    <div id="line2"></div>
    <form class="middle">
        <div id="side">
            <dl></dl>
        </div>
        <div id="content">
            <p id="navi"></p>
            <div id="timetable">
                <p id="timetable-p" onclick="timetable_p_click()"></p>
                <input type="text" id="timetable-text" maxlength="7" onblur="timetable_text_blur()" />
                <table rules="all">
                    <tr>
                        <th class="timetable-th" id="th_first">
                            <p>节次</p>
                            <p>星期</p>
                        </th>
                        <th class="timetable-th">星期一</th>
                        <th class="timetable-th">星期二</th>
                        <th class="timetable-th">星期三</th>
                        <th class="timetable-th">星期四</th>
                        <th class="timetable-th">星期五</th>
                        <th class="timetable-th">星期六</th>
                        <th class="timetable-th">星期日</th>
                    </tr>
                    <tr>
                        <th>第一节</th>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>第二节</th>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>第三节</th>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>第四节</th>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>第五节</th>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                        <td>
                            <select onchange="select_change()">
                                <option value="0">空闲</option>
                                <option value="1">有课</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <input type="button" value="激活课表" onclick="activeTimetable()" />
                <input type="button" value="全部空闲" onclick="allSpare()" />
                <input type="button" value="全部有课" onclick="allOccupied()" />
                <input type="button" value="删除课表" onclick="deleteTimetable()" />
                <input type="button" value="保存修改" onclick="saveTimetable()" />
                <ol type="1." class="prompt">
                    <li>课表标题颜色表示课表是否是正在使用的课表，为红色表示当前正在使用，黑色则表示当前课表未使用。</li>
                    <li>可通过激活课表按钮将课表设置为正在使用的课表，之前使用的课表将会变为未激活状态。</li>
                    <li>通过点击课表标题可以重命名课表。</li>
                </ol>
            </div>

            <div id="alterinfo" onkeypress="info_keypress()">
                <p class="p_head">更改个人信息</p>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">姓名：</span><!-- 去除元素中间空白
                     --><input type="text" class="text" title="暂不支持修改。" disabled="disabled" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">性别：</span><!-- 去除元素中间空白
                     --><label><input type="radio" name="sex" class="radio" title="暂不支持修改。" disabled="disabled" />♂</label><!-- 去除元素中间空白
                     --><label><input type="radio" name="sex" class="radio" title="暂不支持修改。" disabled="disabled" />♀</label>
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">生日：</span><!-- 去除元素中间空白
                     --><input type="date" id="birthday" onchange="valueChanged()" class="text" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">学院：</span><!-- 去除元素中间空白
                     --><input type="text" class="text" title="暂不支持修改。" disabled="disabled" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">专业班级：</span><!-- 去除元素中间空白
                     --><input type="text" class="text" title="暂不支持修改。" disabled="disabled" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">年级：</span><!-- 去除元素中间空白
                     --><input type="text" class="text" title="暂不支持修改。" disabled="disabled" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">QQ号：</span><!-- 去除元素中间空白
                     --><input type="text" id="qq" class="text" maxlength="10" onchange="valueChanged()" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">微信号：</span><!-- 去除元素中间空白
                     --><input type="text" id="wechat" class="text" maxlength="11" onchange="valueChanged()" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">电话号码：</span><!-- 去除元素中间空白
                     --><input type="text" id="phone" class="text" maxlength="11" onchange="valueChanged()" />
                    </div>
                </div>
                <div class="div_sup">
                    <div class="div_sub">
                        <span class="span_prev">宿舍：</span><!-- 去除元素中间空白
                     --><input type="text" id="dormitory" class="text" maxlength="15" onchange="valueChanged()" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">家庭地址：</span><!-- 去除元素中间空白
                     --><input type="text" id="address" class="text" maxlength="25" onchange="valueChanged()" />
                    </div>
                    <div class="div_sub">
                        <span class="span_prev">身份证号：</span><!-- 去除元素中间空白
                     --><input type="text" id="idcard" class="text" maxlength="18" onchange="valueChanged()" />
                    </div>
                </div>
                <input type="button" id="alterinfo-button" onclick="alterInfo()" value="保存修改" />
            </div>

            <div id="alterpwd" onkeypress="pwd_keypress()">
                <p class="p_head">修改密码</p>
                <div class="div_sub">
                    <span class="span_prev">原密码：</span><!-- 去除元素中间空白
                 --><input type="password" class="text" maxlength="16" onfocus="hideNext()" /><!-- 去除元素中间空白
                 --><span class="span_next">*</span>
                </div>
                <div class="div_sub">
                    <span class="span_prev">新密码：</span><!-- 去除元素中间空白
                 --><input type="password" class="text" maxlength="16" title="长度在8到16位之间，尽量使用复杂密码。" onfocus="hideNext()" onblur="pwdnew_blur()" /><!-- 去除元素中间空白
                 --><span class="span_next">*</span>
                </div>
                <div class="div_sub">
                    <span class="span_prev">再次输入：</span><!-- 去除元素中间空白
                 --><input type="password" class="text" maxlength="16" onfocus="hideNext()" onblur="pwdrepeat_blur()" /><!-- 去除元素中间空白
                 --><span class="span_next">*</span>
                </div>
                <input type="button" id="alterpwd-button" onclick="alterPwd()" value="确认修改" />
                <div class="message"></div>
            </div>
        </div>
    </form>
</body>
</html>
