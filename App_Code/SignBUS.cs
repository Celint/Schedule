using System;
using System.IO;
using System.Configuration;
using DataUtil;


/// <summary>
/// 处理与签到相关的事务
/// </summary>
public static class SignBUS
{
    private static DutyTimeCollection dutytimes;
    private static TimeSpan gracetime;
    private static TimeSpan aheadtime;
    static SignBUS()
    {
        Config config = ConfigurationManager.GetSection("myconfiguration") as Config;
        dutytimes = config.DutyTimes;
        gracetime = config.DutyTimes.GraceTime;
        aheadtime = config.DutyTimes.AheadTime;
    }
    public static TimeSpan[] GetDutyTimes()
    {
        TimeSpan[] times = new TimeSpan[10];
        for (int i = 0; i < 5; i++)
        {
            times[2 * i] = dutytimes[i].StartTime;
            times[2 * i + 1] = dutytimes[i].EndTime;
        }
        return times;
    }
    public static string SignIn(string sno, string sequence, string remark)
    {
        if (!ScheduleField.Sequence.TestValue(sequence) || !ScheduleField.SignInRemark.TestValue(remark))
            return "数据格式或长度错误 请联系管理员！";
        DateTime nowtime = DateTime.Now;
        SqlQueryCondition[] sqlconditions1 = new SqlQueryCondition[] {
                new SqlQueryCondition(UserField.StudentNmber,SqlQueryConditionOperator.Equal, sno) ,
                new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, 1)
            };
        object[,] user = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name }, new SqlQueryCondition(sqlconditions1, SqlQueryLogicalOperator.And));
        if (user.Length == 0)
            return "未找到该用户的信息，请检查学号是否填写正确！";
        SqlQueryCondition[] sqlconditions2 = new SqlQueryCondition[] {
                new SqlQueryCondition(ScheduleField.Date,SqlQueryConditionOperator.Equal, nowtime),
                new SqlQueryCondition(ScheduleField.Sequence,SqlQueryConditionOperator.Equal, sequence),
                new SqlQueryCondition(ScheduleField.Attendant,SqlQueryConditionOperator.Equal, user[0,0])
            };
        object[,] schedule = ScheduleDAO.Select(new ScheduleField[] { ScheduleField.Id, ScheduleField.SignInTime },
            new SqlQueryCondition(sqlconditions2, SqlQueryLogicalOperator.And));
        if (schedule.Length == 0)
            return "未找到你的值班信息，请检查班次是否错误！";
        if (schedule[0, 1] != DBNull.Value)
            return "你已对此班签入！";
        if (nowtime.TimeOfDay < dutytimes[sequence].StartTime - aheadtime)
            return "此时签入太早了，请晚点再来！";
        if (nowtime.TimeOfDay > dutytimes[sequence].StartTime + gracetime)
            return "你来晚了，签入时间已过！";
        ScheduleDAO.Update(new ScheduleField[] { ScheduleField.SignInTime, ScheduleField.SignInRemark }, new object[] { nowtime.TimeOfDay, remark },
            new SqlQueryCondition(ScheduleField.Id, SqlQueryConditionOperator.Equal, schedule[0, 0]));
        UserLogDAO.Insert((int)user[0, 0], "signin{" + sequence + '\r' + remark + "}");
        return "true\n" + user[0, 1].ToString() + " 第" + sequence + "班 " + nowtime.ToLongTimeString() + "签入";
    }
    public static string SignOut(string sno, string sequence, string remark)
    {
        if (!ScheduleField.Sequence.TestValue(sequence) || !ScheduleField.SignOutRemark.TestValue(remark))
            return "数据格式或长度错误 请联系管理员！";
        DateTime nowtime = DateTime.Now;
        SqlQueryCondition[] sqlconditions1 = new SqlQueryCondition[] {
                new SqlQueryCondition(UserField.StudentNmber,SqlQueryConditionOperator.Equal, sno) ,
                new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, 1)
            };
        object[,] user = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name }, new SqlQueryCondition(sqlconditions1, SqlQueryLogicalOperator.And));
        if (user.Length == 0)
            return "未找到该用户的信息，请检查学号是否填写正确！";
        SqlQueryCondition[] sqlconditions2 = new SqlQueryCondition[] {
                new SqlQueryCondition(ScheduleField.Date,SqlQueryConditionOperator.Equal, nowtime),
                new SqlQueryCondition(ScheduleField.Sequence,SqlQueryConditionOperator.Equal, sequence),
                new SqlQueryCondition(ScheduleField.Attendant,SqlQueryConditionOperator.Equal, user[0,0])
            };
        object[,] schedule = ScheduleDAO.Select(new ScheduleField[] { ScheduleField.Id, ScheduleField.SignInTime, ScheduleField.SignOutTime },
            new SqlQueryCondition(sqlconditions2, SqlQueryLogicalOperator.And));
        if (schedule.Length == 0)
            return "未找到你的值班信息，请检查班次是否错误！";
        if (schedule[0, 1] == DBNull.Value)
            return "你还未进行入站签到，请先入站签到！";
        if (schedule[0, 2] != DBNull.Value)
            return "你已对此班签出！";
        if (nowtime.TimeOfDay < dutytimes[sequence].EndTime - aheadtime)
            return "此时签出太早了，请晚点再来！";
        if (nowtime.TimeOfDay > dutytimes[sequence].EndTime + gracetime)
            return "你来晚了，签出时间已过！";
        ScheduleDAO.Update(new ScheduleField[] { ScheduleField.SignOutTime, ScheduleField.SignOutRemark }, new object[] { nowtime.TimeOfDay, remark },
            new SqlQueryCondition(ScheduleField.Id, SqlQueryConditionOperator.Equal, schedule[0, 0]));
        UserLogDAO.Insert((int)user[0, 0], "signout{" + sequence + '\r' + remark + "}");
        return "true\n" + user[0, 1].ToString() + " 第" + sequence + "班 " + nowtime.ToLongTimeString() + "签出";
    }
    public static void Feedback(string path, string theme, string detail, string contackinfo)
    {
        using (StreamWriter sw = new StreamWriter(path + "feedback.txt"))
        {
            sw.WriteLine("theme: " + theme);
            sw.WriteLine("detail: " + detail);
            sw.WriteLine("contactinfo: " + contackinfo);
        };
    }
}
