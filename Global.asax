<%@ Application Language="C#" %>
<%@ Import Namespace="DataUtil" %>

<script RunAt="server">

    void Application_Start(object sender, EventArgs e)
    {
        UserField.StudentNmber.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (!CommonMethods.TestString(val, true, true, true, false, false))
            {
                msg = "含有不允许出现的字符";
                return false;
            }
            msg = "";
            return true;
        });
        UserField.Grade.SetAdditionalTestOfString((string val, out string msg) =>
        {
            short grade;
            if (!Int16.TryParse(val, out grade))
            {
                msg = "不是一个数字";
                return false;
            }
            if (grade < 2000 || grade > 2100)
            {
                msg = "不在有效值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        UserField.Sex.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (val != "男" && val != "女")
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        UserField.QQ.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (!CommonMethods.IsInterger(val))
            {
                msg = "不是一个QQ号码";
                return false;
            }
            msg = "";
            return true;
        });
        UserField.PhoneNumber.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (!CommonMethods.IsInterger(val))
            {
                msg = "不是一个电话号码";
                return false;
            }
            msg = "";
            return true;
        });
        UserField.IdCardNumber.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (!CommonMethods.IsIdCardNumber(val))
            {
                msg = "不是一个身份证号码";
                return false;
            }
            msg = "";
            return true;
        });
        ScheduleField.Sequence.SetAdditionalTest((object val, out string msg) =>
        {
            if ((byte)val < 1 || (byte)val > 5)
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        ScheduleField.Sequence.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (val == null || val.Length != 1 || val[0] > '5' || val[0] < '1')
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        ScheduleIndexField.Term.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (val != "上" || val != "下")
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        ScheduleIndexField.StartDate.SetAdditionalTest((object val, out string msg) =>
        {
            if (((DateTime)val).DayOfWeek != DayOfWeek.Monday)
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
        TimetableField.Data.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (val.Length != 70)
            {
                msg = "长度错误";
                return false;
            }
            int index = 0;
            for (int i = 0; i < 7; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    if (val[index] != '0' && val[index] != '1')
                    {
                        msg = "含有未知字符，在位置" + index + "处";
                        return false;
                    }
                    index++;
                    if (val[index] != ',')
                    {
                        msg = "含有未知字符，在位置" + index + "处";
                        return false;
                    }
                    index++;
                }
                if (val[index] != '0' && val[index] != '1')
                {
                    msg = "含有未知字符，在位置" + index + "处";
                    return false;
                }
                index++;
                if (val[index] != ';')
                {
                    msg = "含有未知字符，在位置" + index + "处";
                    return false;
                }
                index++;
            }
            msg = "";
            return true;
        });
        AdminField.Type.SetAdditionalTestOfString((string val, out string msg) =>
        {
            if (!new string[] { "0", "10", "20", "30", "40" }.Contains(val))
            {
                msg = "不在允许的值范围内";
                return false;
            }
            msg = "";
            return true;
        });
    }

    void Application_End(object sender, EventArgs e)
    {
        //  在应用程序关闭时运行的代码

    }

    void Application_Error(object sender, EventArgs e)
    {
        // 在出现未处理的错误时运行的代码

    }

    void Session_Start(object sender, EventArgs e)
    {
        // 在新会话启动时运行的代码

    }

    void Session_End(object sender, EventArgs e)
    {
        // 在会话结束时运行的代码。 
        // 注意: 只有在 Web.config 文件中的 sessionstate 模式设置为
        // InProc 时，才会引发 Session_End 事件。如果会话模式设置为 StateServer
        // 或 SQLServer，则不引发该事件。

    }

</script>
