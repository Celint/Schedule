using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Configuration;
using System.Security.Cryptography;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.HSSF.UserModel;
using NPOI.HSSF.Util;
using DataUtil;
using CoreComponent;

public static class AdminBUS
{

    #region 数据类型定义
    private struct AdminType
    {
        public byte index; public string name; public string describe; public byte[] defaultauthorites;
        public string Serilize()
        {
            string s = "[" + defaultauthorites[0];
            for (int i = 1; i < defaultauthorites.Length; i++)
                s += "," + defaultauthorites[i];
            return "{\"index\":" + index + ",\"name\":\"" + name + "\",\"describe\":\"" + describe + "\",\"defaultauthorities\":" + s + "]}";
        }
    }
    private struct AuthorityCollection
    {
        public byte index; public string describe; public Authority[] auths;
        public string Serilize()
        {
            string s = "{\"index\":" + index + ",\"describe\":\"" + describe + "\",\"auths\":[" + auths[0].Serilize();
            for (int i = 1; i < auths.Length; i++)
                s += "," + auths[i].Serilize();
            s += "]}";
            return s;
        }
    }
    private struct Authority
    {
        public byte index; public string describe; public byte[] requiredauths;
        public string Serilize()
        {
            string s = "";
            if (requiredauths.Length > 0)
            {
                s += requiredauths[0];
                for (int i = 1; i < requiredauths.Length; i++)
                    s += "," + requiredauths[i];
            }
            return "{\"index\":" + index + ",\"describe\":\"" + describe + "\",\"requiredauths\":[" + s + "]}";
        }
    }
    private struct LogEventType
    {
        public string sqlname; public string describe; public string[] argsdescribe;
        public string Serilize()
        {
            string s = "";
            if (argsdescribe.Length > 0)
            {
                s += '"' + argsdescribe[0] + '"';
                for (int i = 1; i < argsdescribe.Length; i++)
                    s += ",\"" + argsdescribe[i] + '"';
            }
            return "{\"sqlname\":\"" + sqlname + "\",\"describe\":\"" + describe + "\",\"argsdescribe\":[" + s + "]}";
        }
    }

    private delegate object GetKeyValue(object[,] schedules, object[,] users, int i, int index, int seq);
    #endregion

    #region 字段及初始化
    private static DepartmentCollection departments;
    private static DutyTimeCollection dutytimes;
    private static AdminType[] admintypes = {
        new AdminType { index = 0, name = "超级管理员", describe = "最高级别管理员，拥有系统一切权限", defaultauthorites = new byte[] { 0, 1, 2, 3, 4 } },
        new AdminType { index = 10, name = "系统管理员", describe = "维护系统正常运行的管理员，拥有除值班管理以外的一切权限", defaultauthorites = new byte[] { 0, 1, 2, 3 } },
        new AdminType { index = 20, name = "账户管理员", describe = "管理系统管理员和用户账户管理员", defaultauthorites = new byte[] { 2, 3 } },
        new AdminType { index = 30, name = "用户管理员", describe = "管理用户账户和值班的管理员", defaultauthorites = new byte[] { 3, 4 } },
        new AdminType { index = 40, name = "值班管理员", describe = "管理排班和值班信息的管理员", defaultauthorites = new byte[] { 4 } }
    };
    private static AuthorityCollection[] authorities = {
        new AuthorityCollection { index = 0, describe = "管理系统状态", auths = new Authority[] {
            new Authority { index = 0, describe = "查看系统状态", requiredauths = new byte[] { } },
            new Authority { index = 1, describe = "查看登录的用户", requiredauths = new byte[] { 0 } },
            new Authority { index = 2, describe = "查看登录的管理员", requiredauths = new byte[] { 0 } },
            new Authority { index = 3, describe = "下线用户", requiredauths = new byte[] { 0, 1 } },
            new Authority { index = 4, describe = "下线管理员", requiredauths = new byte[] { 0, 2 } },
            new Authority { index = 5, describe = "系统维护", requiredauths = new byte[] { 0, 1, 2, 3, 4 } }
        } },
        new AuthorityCollection { index = 1, describe = "管理系统日志", auths = new Authority[] {
            new Authority { index = 0, describe = "查看系统日志", requiredauths = new byte[] { } },
            new Authority { index = 1, describe = "删除系统日志", requiredauths = new byte[] { 0 } }
        } },
        new AuthorityCollection { index = 2, describe = "管理管理员", auths = new Authority[] {
            new Authority { index = 0, describe = "查看管理员", requiredauths = new byte[] { } },
            new Authority { index = 1, describe = "修改管理员", requiredauths = new byte[] { 0 } },
            new Authority { index = 2, describe = "禁用/激活管理员", requiredauths = new byte[] { 0, 1 } },
            new Authority { index = 3, describe = "删除管理员", requiredauths = new byte[] { 0, 1, 2 } },
            new Authority { index = 4, describe = "添加管理员", requiredauths = new byte[] { 0, 1, 2, 3 } }
        } },
        new AuthorityCollection { index = 3, describe = "管理用户", auths = new Authority[] {
            new Authority { index = 0, describe = "查看用户", requiredauths = new byte[] { } },
            new Authority { index = 1, describe = "修改用户", requiredauths = new byte[] { 0 } },
            new Authority { index = 2, describe = "禁用/激活用户", requiredauths = new byte[] { 0, 1 } },
            new Authority { index = 3, describe = "删除用户", requiredauths = new byte[] { 0, 1, 2 } },
            new Authority { index = 4, describe = "添加用户", requiredauths = new byte[] { 0, 1, 2, 3 } }
        } },
        new AuthorityCollection { index = 4, describe = "管理排班", auths = new Authority[] {
            new Authority { index = 0, describe = "查看/导出排班", requiredauths = new byte[] { } },
            new Authority { index = 1, describe = "查看/导出值班情况", requiredauths = new byte[] { 0 } },
            new Authority { index = 2, describe = "修改排班", requiredauths = new byte[] { 0 } },
            new Authority { index = 3, describe = "删除值班项", requiredauths = new byte[] { 0, 1, 2 } },
            new Authority { index = 4, describe = "修改学期信息", requiredauths = new byte[] { 0, 1, 2, 3 } }
        } }
    };
    private static LogEventType[] userlogeventtypes = new LogEventType[] {
        new LogEventType { sqlname = "login", describe = "登录", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "logout", describe = "登出", argsdescribe = new string[] { "是否手动触发" } },
        new LogEventType { sqlname = "signin", describe = "入站签到", argsdescribe = new string[] { "班次", "签入备注" } },
        new LogEventType { sqlname = "signout", describe = "出站签到", argsdescribe = new string[] { "班次", "签出备注" } },
        new LogEventType { sqlname = "getname", describe = "获取姓名", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getinfo", describe = "获取个人信息", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "updpwd", describe = "更改密码", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "updinfo", describe = "更新个人信息", argsdescribe = new string[] { "更新信息" } },
        new LogEventType { sqlname = "gettbs", describe = "获取课表信息", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "gettbdat", describe = "获取课表数据", argsdescribe = new string[] { "课表ID" } },
        new LogEventType { sqlname = "addtb", describe = "添加课表", argsdescribe = new string[] { "课表名" } },
        new LogEventType { sqlname = "rntb", describe = "更改课表名", argsdescribe = new string[] { "课表ID", "新课表名" } },
        new LogEventType { sqlname = "updtb", describe = "更新课表数据", argsdescribe = new string[] { "课表ID" } },
        new LogEventType { sqlname = "acttb", describe = "激活课表", argsdescribe = new string[] { "课表ID" } },
        new LogEventType { sqlname = "deltb", describe = "删除课表", argsdescribe = new string[] { "课表ID" } },
    };
    private static LogEventType[] adminlogeventtypes = new LogEventType[] {
        new LogEventType { sqlname = "login", describe = "登录", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "logout", describe = "登出", argsdescribe = new string[] { "是否手动触发" } },
        new LogEventType { sqlname = "getname", describe = "获取管理员名", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "updpwd", describe = "更改密码", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getdts", describe = "获取值班时段", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getdpts", describe = "获取部门信息", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getyrs", describe = "获取学年", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "gettms", describe = "获取学期", argsdescribe = new string[] { "学年" } },
        new LogEventType { sqlname = "getwc", describe = "获取学期周数", argsdescribe = new string[] { "学年", "学期" } },
        new LogEventType { sqlname = "gettw", describe = "获取本周索引", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getnw", describe = "获取下周索引", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getsd", describe = "获取周开始日期", argsdescribe = new string[] { "学年", "学期", "周序" } },
        new LogEventType { sqlname = "istmest", describe = "判断学期是否存在", argsdescribe = new string[] { "学年", "学期" } },
        new LogEventType { sqlname = "addtm", describe = "添加学期", argsdescribe = new string[] { "学年", "学期", "开始日期", "周数" } },
        new LogEventType { sqlname = "getscddat", describe = "获取排班数据", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getscd", describe = "获取排班表", argsdescribe = new string[] { "周开始日期" } },
        new LogEventType { sqlname = "svscd", describe = "保存排班表", argsdescribe = new string[] { "周开始日期" } },
        new LogEventType { sqlname = "optscd", describe = "导出排班表", argsdescribe = new string[] { "周开始日期" } },
        new LogEventType { sqlname = "optfreusrs", describe = "导出空闲人员表", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getsgrt", describe = "获取值班数据", argsdescribe = new string[] { "周开始日期" } },
        new LogEventType { sqlname = "delsgrt", describe = "删除值班项", argsdescribe = new string[] { "值班项ID" } },
        new LogEventType { sqlname = "optsgrt", describe = "导出值班情况统计", argsdescribe = new string[] { "周开始日期", "分组方法" } },
        new LogEventType { sqlname = "getgds", describe = "获取年级信息", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getscs", describe = "获取学院信息", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getusrs", describe = "获取用户信息", argsdescribe = new string[] { "过滤条件" } },
        new LogEventType { sqlname = "rstusrpwd", describe = "重置用户密码", argsdescribe = new string[] { "用户ID" } },
        new LogEventType { sqlname = "chgusrsts", describe = "设置用户状态", argsdescribe = new string[] { "用户ID", "状态" } },
        new LogEventType { sqlname = "delusr", describe = "删除用户", argsdescribe = new string[] { "用户ID" } },
        new LogEventType { sqlname = "addusr_b", describe = "批量添加用户", argsdescribe = new string[] { "用户数量" } },
        new LogEventType { sqlname = "addusr_s", describe = "单个添加用户", argsdescribe = new string[] { "用户信息" } },
        new LogEventType { sqlname = "altusrinfo", describe = "修改用户信息", argsdescribe = new string[] { "用户ID", "修改信息" } },
        new LogEventType { sqlname = "getadmtps", describe = "获取管理员类型", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getadmauts", describe = "获取管理员权限", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getadms", describe = "获取管理员信息", argsdescribe = new string[] { "过滤条件" } },
        new LogEventType { sqlname = "rstadmpwd", describe = "重置用户密码", argsdescribe = new string[] { "管理员ID" } },
        new LogEventType { sqlname = "chgadmsts", describe = "设置管理员状态", argsdescribe = new string[] { "管理员ID", "状态" } },
        new LogEventType { sqlname = "deladm", describe = "删除管理员", argsdescribe = new string[] { "管理员ID" } },
        new LogEventType { sqlname = "addadm", describe = "添加管理员", argsdescribe = new string[] { "管理员信息" } },
        new LogEventType { sqlname = "altadminfo", describe = "修改管理员信息", argsdescribe = new string[] { "管理员ID", "修改信息" } },
        new LogEventType { sqlname = "getusrevttps", describe = "获取用户事件类型", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getadmevttps", describe = "获取管理员事件类型", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getusrlogs", describe = "获取用户日志", argsdescribe = new string[] { "过滤条件" } },
        new LogEventType { sqlname = "getadmlogs", describe = "获取管理员日志", argsdescribe = new string[] { "过滤条件" } },
        new LogEventType { sqlname = "delusrlog", describe = "删除用户日志", argsdescribe = new string[] { "用户日志ID" } },
        new LogEventType { sqlname = "deladmlog", describe = "删除管理员日志", argsdescribe = new string[] { "管理员日志ID" } },
        new LogEventType { sqlname = "getsyssts", describe = "获取系统状态", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getlogdusrs", describe = "获取所有登录用户", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getlogdadms", describe = "获取所有登录管理员", argsdescribe = new string[] { } },
        new LogEventType { sqlname = "getlogdusr", describe = "获取登录用户", argsdescribe = new string[] { "用户学号" } },
        new LogEventType { sqlname = "getlogdadm", describe = "获取登录管理员", argsdescribe = new string[] { "管理员名" } },
        new LogEventType { sqlname = "oflnusr", describe = "下线用户", argsdescribe = new string[] { "用户ID", "访客ID" } },
        new LogEventType { sqlname = "oflnadm", describe = "下线管理员", argsdescribe = new string[] { "管理员ID", "访客ID" } },
        new LogEventType { sqlname = "matnsys", describe = "系统维护", argsdescribe = new string[] { "维护原因" } },
        new LogEventType { sqlname = "rstrsys", describe = "取消系统维护", argsdescribe = new string[] { } },
    };
    private static int sysmaintainstate = 0;
    static AdminBUS()
    {
        Config config = ConfigurationManager.GetSection("myconfiguration") as Config;
        departments = config.Departments;
        dutytimes = config.DutyTimes;
    }
    #endregion

    #region 后台管理
    public static string GetName(int adminid)
    {
        AdminLogDAO.Insert(adminid, "getname{}");
        return AdminDAO.Select(new AdminField[] { AdminField.Name },
            new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, adminid))[0, 0].ToString();
    }
    public static string UpdatePassword(string oldpwd, string newpwd, int adminid)
    {
        SHA256CryptoServiceProvider sha256crypto = new SHA256CryptoServiceProvider();
        oldpwd = CommonMethods.Decrypt(oldpwd);
        byte[] b = sha256crypto.ComputeHash(Encoding.UTF8.GetBytes(oldpwd));
        oldpwd = CommonMethods.BytesToHexString(b);
        SqlQueryCondition sqlcondition1 = new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, adminid);
        SqlQueryCondition sqlcondition2 = new SqlQueryCondition(AdminField.Password, SqlQueryConditionOperator.Equal, oldpwd);
        if (AdminDAO.Select(new AdminField[] { AdminField.Id },
            new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1, sqlcondition2 }, SqlQueryLogicalOperator.And)).Length == 0) //管理员不存在或者状态码或密码不正确
            return "原密码不正确!";
        else
        {
            newpwd = CommonMethods.Decrypt(newpwd);
            if (newpwd.Length < 8 || newpwd.Length > 16)
                return "新密码长度不符合要求！";
            b = sha256crypto.ComputeHash(Encoding.UTF8.GetBytes(newpwd));
            newpwd = CommonMethods.BytesToHexString(b);
            AdminDAO.Update(new AdminField[] { AdminField.Password }, new object[] { newpwd }, sqlcondition1);
            AdminLogDAO.Insert(adminid, "updpwd{}");
            return "true";
        }
    }
    #endregion

    #region 值班管理
    public static string[] GetDutyTimes(int adminid, bool log = true)
    {
        string[] times = new string[10];
        for (int i = 0; i < 5; i++)
        {
            times[2 * i] = dutytimes[i].StartTime.ToString(@"hh\:mm");
            times[2 * i + 1] = dutytimes[i].EndTime.ToString(@"hh\:mm");
        }
        if (log)
            AdminLogDAO.Insert(adminid, "getdts{}");
        return times;
    }
    public static string[,] GetDepartments(int adminid)
    {
        int count = departments.Count;
        string[,] data = new string[count, 2];
        for (int i = 0; i < count; i++)
        {
            data[i, 0] = departments[i].Name;
            data[i, 1] = departments[i].ShorName;
        }
        AdminLogDAO.Insert(adminid, "getdpts{}");
        return data;
    }
    public static object[,] GetYears(int adminid)
    {
        AdminLogDAO.Insert(adminid, "getyrs{}");
        return ScheduleIndexDAO.Select(new ScheduleIndexField[] { ScheduleIndexField.Year }, true);
    }
    public static object[,] GetTerms(string year, int adminid)
    {
        if (!CommonMethods.IsInterger(year))
            return null;
        AdminLogDAO.Insert(adminid, "gettms{" + year + "}");
        return ScheduleIndexDAO.Select(new ScheduleIndexField[] { ScheduleIndexField.Term },
            new SqlQueryCondition(ScheduleIndexField.Year, SqlQueryConditionOperator.Equal, year), true);
    }
    public static int GetWeekCount(string year, string term, int adminid)
    {
        if (!CommonMethods.IsInterger(year) || (term != "上" && term != "下"))
            return 0;
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleIndexField.Year, SqlQueryConditionOperator.Equal, year),
            new SqlQueryCondition(ScheduleIndexField.Term,SqlQueryConditionOperator.Equal, term)
        };
        AdminLogDAO.Insert(adminid, "getwc{" + year + '\r' + term + "}");
        return ScheduleIndexDAO.Select(new ScheduleIndexField[] { ScheduleIndexField.Week },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And)).Length;
    }
    public static string GetThisWeek(int adminid)
    {
        DateTime nowtime = DateTime.Now;
        object[,] data = ScheduleIndexDAO.Select(
            new SqlQueryCondition(ScheduleIndexField.StartDate, SqlQueryConditionOperator.Equal, nowtime.AddDays(-(int)nowtime.DayOfWeek + 1)));
        AdminLogDAO.Insert(adminid, "gettw{}");
        if (data.Length == 0)
            return "";
        else
            return data[0, 0].ToString() + ':' + data[0, 1].ToString() + ':' + data[0, 2].ToString() + ':' + ((DateTime)data[0, 3]).ToString("yyyy-MM-dd");
    }
    public static string GetNextWeek(int adminid)
    {
        DateTime nowtime = DateTime.Now;
        object[,] data = ScheduleIndexDAO.Select(
            new SqlQueryCondition(ScheduleIndexField.StartDate, SqlQueryConditionOperator.Equal, nowtime.AddDays(-(int)nowtime.DayOfWeek + 8)));
        AdminLogDAO.Insert(adminid, "getnw{}");
        if (data.Length == 0)
            return "";
        else
            return data[0, 0].ToString() + ':' + data[0, 1].ToString() + ':' + data[0, 2].ToString() + ':' + ((DateTime)data[0, 3]).ToString("yyyy-MM-dd");
    }
    public static object GetStartDate(string year, string term, string week, int adminid)
    {
        if (!CommonMethods.IsInterger(year) || (term != "上" && term != "下") || !CommonMethods.IsInterger(week))
            return null;
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleIndexField.Year, SqlQueryConditionOperator.Equal, year),
            new SqlQueryCondition(ScheduleIndexField.Term,SqlQueryConditionOperator.Equal, term),
            new SqlQueryCondition(ScheduleIndexField.Week,SqlQueryConditionOperator.Equal, week)
        };
        object[,] data = ScheduleIndexDAO.Select(new ScheduleIndexField[] { ScheduleIndexField.StartDate },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        AdminLogDAO.Insert(adminid, "getsd{" + year + '\r' + term + '\r' + week + "}");
        if (data.Length > 0)
            return data[0, 0];
        else
            return null;
    }
    public static bool IsTermExist(string year, string term, int adminid)
    {
        if (!CommonMethods.IsInterger(year) || (term != "上" && term != "下"))
            return false;
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleIndexField.Year, SqlQueryConditionOperator.Equal, year),
            new SqlQueryCondition(ScheduleIndexField.Term,SqlQueryConditionOperator.Equal, term)
        };
        AdminLogDAO.Insert(adminid, "istmexst{" + year + '\r' + term + "}");
        return ScheduleIndexDAO.Select(new ScheduleIndexField[] { ScheduleIndexField.Term },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And)).Length > 0;
    }
    public static string AddTerm(string year, string term, string startdate, string weeknum, int adminid)
    {
        int _year, _weeknum;
        DateTime _startdate, nowtime = DateTime.Now;
        if (!Int32.TryParse(year, out _year) || _year < nowtime.Year - 1 || _year > nowtime.Year + 1 ||
            term != "上" && term != "下" || !DateTime.TryParse(startdate, out _startdate) || _startdate.Year != _year ||
            !Int32.TryParse(weeknum, out _weeknum) || _weeknum <= 0 || _weeknum > 25)
            return "数据存在错误，请联系管理员！";
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleIndexField.Year, SqlQueryConditionOperator.Equal, year),
            new SqlQueryCondition(ScheduleIndexField.Term,SqlQueryConditionOperator.Equal, term)
        };
        ScheduleIndexDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        object[,] data = new object[_weeknum, 4];
        _startdate = _startdate.AddDays(-(double)_startdate.DayOfWeek + 1);
        for (int i = 0; i < _weeknum; i++)
        {
            data[i, 0] = _year;
            data[i, 1] = term;
            data[i, 2] = i + 1;
            data[i, 3] = _startdate.ToString("yyyy-MM-dd");
            _startdate = _startdate.AddDays(7);
        }
        ScheduleIndexDAO.Insert(ScheduleIndexField.All, data);
        AdminLogDAO.Insert(adminid, "addtm{" + year + '\r' + term + '\r' + startdate + '\r' + weeknum + "}");
        return "true";
    }
    public static object[,][] GetScheduleData(int adminid)
    {
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name, UserField.Department },
            new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, 1), true);
        object[,] timetables = TimetableDAO.Select(new TimetableField[] { TimetableField.Owner, TimetableField.Data },
            new SqlQueryCondition(TimetableField.Status, SqlQueryConditionOperator.Equal, 1));
        int len = users.Length / 3, len2 = timetables.Length / 2;
        string[] _timetables = new string[len];
        for (int i = 0; i < len2; i++)
        {
            int index;
            if ((index = CommonMethods.BinarySearch(users, (int)timetables[i, 0], 3)) != -1)
                _timetables[index] = (string)timetables[i, 1];
        }
        object[,][] data = new object[7, 5][]; //data的第二层应该为2维数组，为了方便用1维数组代替
        for (int i = 0; i < 7; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                List<object> _data = new List<object>();
                for (int k = 0; k < users.Length / 3; k++)
                {
                    if (_timetables[k][(i * 5 + j) * 2] == '0')
                    {
                        _data.Add(users[k, 0]); _data.Add(users[k, 1]); _data.Add(users[k, 2]);
                    }
                }
                data[i, j] = _data.ToArray();
            }
        }
        AdminLogDAO.Insert(adminid, "getscddat{}");
        return data;
    }
    public static object[] GetSchedule(string _startdate, int adminid)
    {
        DateTime startdate;
        if (!DateTime.TryParse(_startdate, out startdate) || startdate.DayOfWeek != DayOfWeek.Monday)
            return new object[0];
        DateTime enddate = startdate.AddDays(6);
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.More_Than_Or_Equal, startdate),
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.Less_Than_Or_Equal, enddate),
        };
        object[,] schedules = ScheduleDAO.Select(new ScheduleField[] { ScheduleField.Date, ScheduleField.Sequence, ScheduleField.Attendant },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        if (schedules.Length == 0)
            return new object[0];
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name, UserField.Department }, true);
        AdminLogDAO.Insert(adminid, "getscd{" + startdate.ToString("yyyy-MM-dd") + "}");
        return LinkData(users, schedules, false);
    }
    public static string SaveSchedule(string _startdate, int[][] data, int adminid)
    {
        DateTime startdate;
        if (!DateTime.TryParse(_startdate, out startdate) || startdate.DayOfWeek != DayOfWeek.Monday || data.Length != 35)
            return "数据错误，请联系管理员！";
        if (startdate < DateTime.Now)
            return "排班时间已过！";
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id },
            new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, 1), true);
        for (int i = 0; i < data.Length; i++)
        {
            for (int j = 0; j < data[i].Length; j++)
            {
                if (CommonMethods.BinarySearch(users, data[i][j], 1) == -1)
                    return "数据错误，请联系管理员！";
            }
        }
        DateTime date = startdate;
        int len = 0;
        for (int i = 0; i < data.Length; i++)
            len += data[i].Length;
        object[,] val = new object[len, 3];
        int index = 0;
        for (int i = 0; i < 7; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                int _index = 5 * i + j;
                for (int k = 0; k < data[_index].Length; k++)
                {
                    val[index, 0] = date; val[index, 1] = j + 1; val[index, 2] = data[_index][k];
                    index++;
                }
            }
            date = date.AddDays(1);
        }
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.More_Than_Or_Equal, startdate),
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.Less_Than, date),
        };
        ScheduleDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        ScheduleDAO.Insert(new ScheduleField[] { ScheduleField.Date, ScheduleField.Sequence, ScheduleField.Attendant }, val);
        AdminLogDAO.Insert(adminid, "svscd{" + startdate.ToString("yyyy-MM-dd") + "}");
        return "true";
    }
    public static string OutputSchedule(string _startdate, string sitepath, int adminid)
    {
        DateTime startdate;
        if (!DateTime.TryParse(_startdate, out startdate) || startdate.DayOfWeek != DayOfWeek.Monday)
            return "数据错误，请联系管理员！";
        object[,] index = ScheduleIndexDAO.Select(ScheduleIndexField.All,
            new SqlQueryCondition(ScheduleIndexField.StartDate, SqlQueryConditionOperator.Equal, startdate));
        if (index.Length == 0)
            return "数据错误，请联系管理员！";
        DateTime enddate = startdate.AddDays(6);
        FileStream fs = new FileStream(sitepath + "Outputs\\Template.xls", FileMode.Open);
        HSSFWorkbook workbook = new HSSFWorkbook(fs, true);
        fs.Close();
        ISheet sheet = workbook.GetSheetAt(0);
        IRow[] rows = new IRow[6];
        sheet.GetRow(0).Cells[0].SetCellValue("创业网" + index[0, 0] + "年" + index[0, 1] + "学期第" + index[0, 2] + "周（" +
            startdate.ToString("yyyy-MM-dd") + "～" + startdate.AddDays(6).ToString("yyyy-MM-dd") + "）" + "值班表");
        rows[0] = sheet.GetRow(1);
        string s = "一二三四五六日";
        for (int i = 0; i < 7; i++)
            rows[0].Cells[i + 1].SetCellValue("星期" + s[i] + "\r\n" + startdate.AddDays(i).ToString("yyyy-MM-dd"));
        string[] dutytimes = GetDutyTimes(adminid, false);
        for (int i = 0; i < 5; i++)
        {
            IRow row = rows[i + 1] = sheet.GetRow(i + 2);
            row.Cells[0].SetCellValue("第" + s[i] + "班" + "\r\n" + dutytimes[2 * i] + "～" + dutytimes[2 * i + 1]);
        }

        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name }, true);
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.More_Than_Or_Equal, startdate),
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.Less_Than_Or_Equal, enddate),
        };
        object[,] schedules = ScheduleDAO.Select(new ScheduleField[] { ScheduleField.Date, ScheduleField.Sequence, ScheduleField.Attendant },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        string[,] attendants = new string[6, 7];
        for (int i = 0; i < schedules.Length / 3; i++)
        {
            int columnindex = ((DateTime)(schedules[i, 0]) - startdate).Days;
            string val = attendants[(byte)schedules[i, 1], columnindex];
            if (val == null)
                attendants[(byte)schedules[i, 1], columnindex] = users[CommonMethods.BinarySearch(users, (int)schedules[i, 2], 2), 1].ToString();
            else
                attendants[(byte)schedules[i, 1], columnindex] = val + "\r\n" + users[CommonMethods.BinarySearch(users, (int)schedules[i, 2], 2), 1].ToString();
        }
        for (int i = 0; i < 7; i++)
        {
            for (int j = 1; j < 6; j++)
            {
                if (attendants[j, i] != null)
                    rows[j].Cells[i + 1].SetCellValue(attendants[j, i]);
            }
        }

        string filename = "创业网" + index[0, 0] + "年" + index[0, 1] + "学期第" + index[0, 2] + "周值班表.xls";
        FileStream _fs = new FileStream(sitepath + "Outputs\\" + filename, FileMode.OpenOrCreate);
        workbook.Write(_fs);
        _fs.Close();
        AdminLogDAO.Insert(adminid, "optscd{" + startdate.ToString("yyyy-MM-dd") + "}");
        return "true:" + "/Outputs/" + filename;
    }
    public static string OutputFreeUsers(string sitepath, int adminid)
    {
        FileStream fs = new FileStream(sitepath + "Outputs\\Template3.xls", FileMode.Open);
        HSSFWorkbook workbook = new HSSFWorkbook(fs, true);
        fs.Close();
        ISheet sheet = workbook.GetSheetAt(0);
        IRow[] rows = new IRow[5];
        sheet.GetRow(0).Cells[0].SetCellValue("空闲人员表（导出时间：" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + ')');
        string s = "一二三四五六日";
        string[] dutytimes = GetDutyTimes(adminid, false);
        for (int i = 0; i < 5; i++)
        {
            rows[i] = sheet.GetRow(i + 2);
            rows[i].Cells[0].SetCellValue("第" + s[i] + "班" + "\r\n" + dutytimes[2 * i] + "～" + dutytimes[2 * i + 1]);
        }
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name },
            new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, 1), true);
        object[,] timetables = TimetableDAO.Select(new TimetableField[] { TimetableField.Owner, TimetableField.Data },
            new SqlQueryCondition(TimetableField.Status, SqlQueryConditionOperator.Equal, 1));
        int len = users.Length / 2, len2 = timetables.Length / 2;
        string[] _timetables = new string[len];
        for (int i = 0; i < len2; i++)
        {
            int index;
            if ((index = CommonMethods.BinarySearch(users, (int)timetables[i, 0], 2)) != -1)
                _timetables[index] = (string)timetables[i, 1];
        }

        for (int i = 0; i < 7; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                string freeusers = "";
                for (int k = 0; k < len; k++)
                {
                    if (_timetables[k][(i * 5 + j) * 2] == '0')
                    {
                        if (freeusers.Length > 0)
                            freeusers += '、';
                        freeusers += users[k, 1];
                    }
                }
                rows[j].Cells[i + 1].SetCellValue(freeusers);
            }
        }

        string filename = "空闲人员表.xls";
        FileStream _fs = new FileStream(sitepath + "Outputs\\" + filename, FileMode.OpenOrCreate);
        workbook.Write(_fs);
        _fs.Close();
        AdminLogDAO.Insert(adminid, "optfreusrs{}");
        return "true:" + "/Outputs/" + filename;
    }
    public static object[] GetSignResult(string _startdate, int adminid)
    {
        DateTime startdate;
        if (!DateTime.TryParse(_startdate, out startdate) || startdate.DayOfWeek != DayOfWeek.Monday)
            return new object[0];
        DateTime enddate = startdate.AddDays(6);
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.More_Than_Or_Equal, startdate),
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.Less_Than_Or_Equal, enddate),
        };
        object[,] schedules = ScheduleDAO.Select(ScheduleField.All, new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        if (schedules.Length == 0)
            return new object[0];
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name, UserField.Department }, true);
        AdminLogDAO.Insert(adminid, "getsgrt{" + startdate.ToString("yyyy-MM-dd") + "}");
        return LinkData(users, schedules, true);
    }
    public static string DeleteSignResult(string scheduleid, int adminid)
    {
        if (!ScheduleField.Id.TestValue(scheduleid))
            return "数据格式错误，请联系管理员！";
        ScheduleDAO.Delete(scheduleid);
        AdminLogDAO.Insert(adminid, "delsgrt{" + scheduleid + "}");
        return "true";
    }
    public static string OutputSignResult(string _startdate, string dividemethod, string sitepath, int adminid)
    {
        DateTime startdate;
        if (!DateTime.TryParse(_startdate, out startdate) || startdate.DayOfWeek != DayOfWeek.Monday)
            return "数据错误，请联系管理员！";
        object[,] indexs = ScheduleIndexDAO.Select(ScheduleIndexField.All,
        new SqlQueryCondition(ScheduleIndexField.StartDate, SqlQueryConditionOperator.Equal, startdate));
        if (indexs.Length == 0)
            return "数据错误，请联系管理员！";
        GetKeyValue GetVal;
        if (dividemethod == "" || dividemethod == "none")
            GetVal = (scheduledata, userdata, i, index, seq) => { return 0; };
        else if (dividemethod == "name")
            GetVal = (scheduledata, userdata, i, index, seq) => { return userdata[index, 0]; };
        else if (dividemethod == "dept")
            GetVal = (scheduledata, userdata, i, index, seq) => { return userdata[index, 2]; };
        else if (dividemethod == "date")
            GetVal = (scheduledata, userdata, i, index, seq) => { return scheduledata[i, 0]; };
        else if (dividemethod == "seq")
            GetVal = (scheduledata, userdata, i, index, seq) => { return scheduledata[i, 1]; };
        else if (dividemethod == "signinsitu")
            GetVal = (scheduledata, userdata, i, index, seq) =>
            {
                if (scheduledata[i, 3] == DBNull.Value) return 0;
                else if ((TimeSpan)scheduledata[i, 3] > dutytimes[seq].StartTime) return 1;
                else return 2;
            };
        else if (dividemethod == "signoutsitu")
            GetVal = (scheduledata, userdata, i, index, seq) =>
            {
                if (scheduledata[i, 4] == DBNull.Value) return 0;
                else if ((TimeSpan)scheduledata[i, 4] < dutytimes[seq].EndTime) return 1;
                else return 2;
            };
        else
            return "不能识别的分组方法！";
        DateTime enddate = startdate.AddDays(6);
        SqlQueryCondition[] sqlconditions = {
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.More_Than_Or_Equal, startdate),
            new SqlQueryCondition(ScheduleField.Date, SqlQueryConditionOperator.Less_Than_Or_Equal, enddate),
        };
        object[,] schedules = ScheduleDAO.Select(new ScheduleField[] { ScheduleField.Date, ScheduleField.Sequence, ScheduleField.Attendant,
            ScheduleField.SignInTime, ScheduleField.SignOutTime, ScheduleField.SignInRemark, ScheduleField.SignOutRemark },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        object[,] users = UserDAO.Select(new UserField[] { UserField.Id, UserField.Name, UserField.Department }, true);
        FileStream fs = new FileStream(sitepath + "Outputs\\Template2.xls", FileMode.Open);
        HSSFWorkbook workbook = new HSSFWorkbook(fs, true);
        fs.Close();
        HSSFSheet sheet = (HSSFSheet)workbook.GetSheetAt(0);

        int len = schedules.Length / 7;
        List<object> vallist = new List<object>();
        List<List<object>> grouplist = new List<List<object>>();
        for (int i = 0; i < len; i++)
        {
            List<object> group;
            int index = CommonMethods.BinarySearch(users, (int)schedules[i, 2], 3), seq = (byte)schedules[i, 1] - 1;
            object val = GetVal(schedules, users, i, index, seq);
            int valindex = CommonMethods.ElementIndexOfList(val, vallist);
            if (valindex == -1)
            {
                group = new List<object>();
                grouplist.Add(group);
                vallist.Add(val);
            }
            else
                group = grouplist[valindex];
            DateTime date = (DateTime)schedules[i, 0];
            group.Add(date.ToOADate()); group.Add(seq + 1);
            int lateminutes = 0;
            group.Add(users[index, 1]); group.Add(departments[(byte)users[index, 2]].Name);
            if (schedules[i, 3] == DBNull.Value)
            {
                group.Add(null); group.Add("未签入"); group.Add(null);
            }
            else
            {
                TimeSpan signintime = (TimeSpan)schedules[i, 3];
                group.Add(date.Add(signintime).ToOADate());
                if (signintime <= dutytimes[seq].StartTime)
                    group.Add("按时签入");
                else
                    group.Add("迟到" + (lateminutes = (signintime - dutytimes[seq].StartTime).Minutes + 1) + "分钟");
                if (schedules[i, 5] == DBNull.Value)
                    group.Add(schedules[i, 5]);
                else
                    group.Add(null);
            }
            if (schedules[i, 4] == DBNull.Value)
            {
                group.Add(null); group.Add("未签出"); group.Add(null); group.Add(null); group.Add(0);
            }
            else
            {
                TimeSpan signouttime = (TimeSpan)schedules[i, 4];
                group.Add(date.Add(signouttime).ToOADate());
                int scheduleminutes;
                if (signouttime >= dutytimes[seq].EndTime)
                {
                    group.Add("按时签出");
                    scheduleminutes = (int)(dutytimes[seq].EndTime - dutytimes[seq].EndTime).TotalMinutes - lateminutes;
                }
                else
                {
                    int earlyleaveminutes = (dutytimes[seq].EndTime - signouttime).Minutes + 1;
                    group.Add("早退" + earlyleaveminutes + "分钟");
                    scheduleminutes = (int)(dutytimes[seq].EndTime - dutytimes[seq].StartTime).TotalMinutes - lateminutes - earlyleaveminutes;
                }
                if (schedules[i, 6] == DBNull.Value)
                    group.Add(schedules[i, 6]);
                else
                    group.Add(null);
                int hours = scheduleminutes / 60, minuts = scheduleminutes % 60;
                group.Add((hours == 0 ? "" : hours + "小时") + (minuts == 0 ? "" : minuts + "分钟")); group.Add(scheduleminutes);
            }
        }

        IFont font1 = workbook.CreateFont(), font2 = workbook.CreateFont(), font3 = workbook.CreateFont();
        font1.FontName = "宋体"; font2.FontName = "宋体"; font3.FontName = "宋体";
        font1.FontHeightInPoints = 11; font2.FontHeightInPoints = 11; font3.FontHeightInPoints = 11;
        font1.Color = HSSFColor.Red.Index; font2.Color = HSSFColor.Brown.Index; font3.Color = HSSFColor.Green.Index;
        ICellStyle style1 = workbook.CreateCellStyle(), style2 = workbook.CreateCellStyle(), style3 = workbook.CreateCellStyle();
        style1.SetFont(font1); style2.SetFont(font2); style3.SetFont(font3);
        style1.Alignment = HorizontalAlignment.Center; style2.Alignment = HorizontalAlignment.Center; style3.Alignment = HorizontalAlignment.Center;
        int rowindex = 1;
        for (int i = 0; i < grouplist.Count; i++)
        {
            int totalminutes = 0, latecount = 0, earlyleavecount = 0, nosignincount = 0, nosignoutcount = 0;
            List<object> group = grouplist[i];
            for (int j = 0; j < group.Count;)
            {
                IRow row = sheet.CreateRow(rowindex);
                for (int k = 0; k < 5; k++)
                    row.CreateCell(k).SetCellValue(group[j++]);
                string signinsitu = group[j++].ToString();
                ICell cell = row.CreateCell(5);
                cell.SetCellValue(signinsitu);
                if (signinsitu[0] == '未')
                {
                    cell.CellStyle = style1;
                    nosignincount++;
                }
                else if (signinsitu[0] == '迟')
                {
                    cell.CellStyle = style2;
                    latecount++;
                }
                else
                    cell.CellStyle = style3;
                row.CreateCell(6).SetCellValue(group[j++]);
                row.CreateCell(7).SetCellValue(group[j++]);
                string signoutsitu = group[j++].ToString();
                cell = row.CreateCell(8);
                cell.SetCellValue(signoutsitu);
                if (signoutsitu[0] == '未')
                {
                    cell.CellStyle = style1;
                    nosignoutcount++;
                }
                else if (signoutsitu[0] == '早')
                {
                    cell.CellStyle = style2;
                    earlyleavecount++;
                }
                else
                    cell.CellStyle = style3;
                row.CreateCell(9).SetCellValue(group[j++]);
                row.CreateCell(10).SetCellValue(group[j++]);
                totalminutes += (int)group[j++];
                rowindex++;
            }
            int hours = totalminutes / 60, minutes = totalminutes % 60;
            sheet.CreateRow(rowindex).CreateCell(0).SetCellValue("总班次:" + group.Count / 12 +
                "，总值班时长:" + (totalminutes == 0 ? "0分钟" : ((hours == 0 ? "" : hours + "小时") + (minutes == 0 ? "" : minutes + "分钟"))) +
                "，迟到次数:" + latecount + "，早退次数:" + earlyleavecount + "，未签入次数:" + nosignincount + "，未签出次数:" + nosignoutcount);
            sheet.AddMergedRegion(new CellRangeAddress(rowindex, rowindex, 0, 10));
            sheet.SetEnclosedBorderOfRegion(new CellRangeAddress(rowindex - (group.Count / 12) - 1, rowindex, 0, 10), BorderStyle.Thin, 0);
            rowindex += 2;
            sheet.CopyRow(0, rowindex);
            rowindex++;
        }
        sheet.RemoveRow(sheet.GetRow(rowindex - 1));
        sheet.SetActiveCellRange(0, rowindex - 3, 0, 10);
        string filename = "创业网" + indexs[0, 0] + "年" + indexs[0, 1] + "学期第" + indexs[0, 2] + "周值班情况统计.xls";
        FileStream _fs = new FileStream(sitepath + "Outputs\\" + filename, FileMode.OpenOrCreate);
        workbook.Write(_fs);
        _fs.Close();
        AdminLogDAO.Insert(adminid, "optsgrt{" + startdate.ToString("yyyy-MM-dd") + '\r' + dividemethod + "}");
        return "true:" + "/Outputs/" + filename;
    }
    #endregion

    #region 用户管理
    public static object[,] GetGrades(int adminid)
    {
        AdminLogDAO.Insert(adminid, "getgds{}");
        return UserDAO.Select(new UserField[] { UserField.Grade }, false, true);
    }
    public static object[,] GetSchools(int adminid)
    {
        AdminLogDAO.Insert(adminid, "getscs{}");
        return UserDAO.Select(new UserField[] { UserField.School }, false, true);
    }
    public static object[,] GetUsers(string method, string key, int adminid)
    {
        UserField[] fields = new UserField[] {
                UserField.Id, UserField.Name, UserField.StudentNmber, UserField.Department, UserField.School, UserField.Class, UserField.Grade, UserField.Status,
                UserField.Sex, UserField.Birthday, UserField.QQ, UserField.WeChat, UserField.PhoneNumber, UserField.IdCardNumber,
                UserField.Dormitory, UserField.Address
            };
        AdminLogDAO.Insert(adminid, "getusrs{" + method + ':' + key + "}");
        switch (method)
        {
            case "":
                return UserDAO.Select(fields);
            case "姓名":
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.Name, SqlQueryConditionOperator.Contain, key));
            case "学号":
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.StudentNmber, SqlQueryConditionOperator.Contain, key));
            case "班级":
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.Class, SqlQueryConditionOperator.Contain, key));
            case "年级":
                if (key == "null")
                    return UserDAO.Select(fields, new SqlQueryCondition(UserField.Grade, SqlQueryConditionOperator.Equal, null));
                if (!UserField.Grade.TestValue(key))
                    return new object[0, 0];
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.Grade, SqlQueryConditionOperator.Equal, key));
            case "学院":
                if (key == "null")
                    return UserDAO.Select(fields, new SqlQueryCondition(UserField.School, SqlQueryConditionOperator.Equal, null));
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.School, SqlQueryConditionOperator.Equal, key));
            case "部门":
                if (!new string[] { "1", "2", "3", "4", "5" }.Contains(key))
                    return new object[0, 0];
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.Department, SqlQueryConditionOperator.Equal, key));
            case "状态":
                if (key != "0" && key != "1")
                    return new object[0, 0];
                return UserDAO.Select(fields, new SqlQueryCondition(UserField.Status, SqlQueryConditionOperator.Equal, key));
            default:
                return new object[0, 0];
        }
    }
    public static string ResetUserPwd(string userid, int adminid)
    {
        if (!UserField.Id.TestValue(userid))
            return "数据格式错误，请联系管理员！";
        UserDAO.Update(new UserField[] { UserField.Password }, new object[] {
                CommonMethods.BytesToHexString(new SHA256CryptoServiceProvider().ComputeHash(Encoding.UTF8.GetBytes("123456"))) },
            new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, userid));
        AdminLogDAO.Insert(adminid, "rstusrpwd{" + userid + "}");
        return "true";
    }
    public static string ChangeUserStatus(string usersid, string status, int adminid)
    {
        if (usersid == "" || UserField.Status.TestValue(status))
            return "数据格式错误，请联系管理员！";
        string[] ids = usersid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!UserField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        UserDAO.Update(new UserField[] { UserField.Status }, new object[] { status },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or));
        if (usersid.Length > AdminLogField.Event.SqlDataLength - 13)
        {
            int index = AdminLogField.Event.SqlDataLength - 16;
            while (usersid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "chgusrsts{" + usersid.Remove(index) + "...\r" + status + "}");
        }
        else
            AdminLogDAO.Insert(adminid, "chgusrsts{" + usersid + '\r' + status + "}");
        return "true";
    }
    public static string DeleteUser(string usersid, int adminid)
    {
        if (usersid == "")
            return "数据格式错误，请联系管理员！";
        string[] ids = usersid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!UserField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        UserDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or));
        if (usersid.Length > AdminLogField.Event.SqlDataLength - 8)
        {
            int index = AdminLogField.Event.SqlDataLength - 11;
            while (usersid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "delusr{" + usersid.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "delusr{" + usersid + "}");
        return "true";
    }
    public static string AddUser(Stream file, string sitepath, int adminid)
    {
        HSSFWorkbook workbook;
        try
        {
            workbook = new HSSFWorkbook(file, true);
        }
        catch (Exception)
        {
            return "文件错误！";
        }

        List<object[]> datalist = new List<object[]>();
        UserField[] fields = new UserField[] {
                UserField.Name, UserField.StudentNmber, UserField.Department, UserField.School, UserField.Grade, UserField.Class,
                UserField.Sex, UserField.Birthday, UserField.PhoneNumber, UserField.QQ, UserField.WeChat,
                UserField.IdCardNumber, UserField.Dormitory, UserField.Address
            };
        FileStream fs = new FileStream(sitepath + "Outputs\\Template1.xls", FileMode.Open);
        HSSFWorkbook invalidwb = new HSSFWorkbook(fs, true);
        fs.Close();
        HSSFSheet sheet = (HSSFSheet)workbook.GetSheetAt(0);
        HSSFSheet invalidsheet = (HSSFSheet)invalidwb.GetSheetAt(0);
        int invalidindex = 1;
        IEnumerator en = sheet.GetEnumerator();
        en.MoveNext();
        while (en.MoveNext())
        {
            object[] data;
            HSSFRow thisrow = (HSSFRow)en.Current;
            bool hasdata = false;
            for (int i = 0; i < thisrow.Cells.Count; i++) //检查单元格是否全为空
            {
                if ((thisrow.Cells[i].CellType != CellType.Blank))
                {
                    hasdata = true;
                    break;
                }
            }
            if (!hasdata) //忽略单元格全为空的行
                continue;
            string message;
            if (JudgeUserData(thisrow, fields, out data, out message))
                datalist.Add(data);
            else
            {
                HSSFRow invalidrow = (HSSFRow)invalidsheet.CreateRow(invalidindex);
                for (int i = 0; i < thisrow.Cells.Count; i++)
                    invalidrow.CreateCell(thisrow.Cells[i].ColumnIndex).SetCellValue(thisrow.Cells[i].CellValue);
                invalidrow.CreateCell(14).SetCellValue(message.Remove(message.Length - 1));
                invalidindex++;
            }
        }

        if (datalist.Count == 0)
            return "无任何有效行数据！";
        object[,] values = new object[datalist.Count, fields.Length];
        for (int i = 0; i < datalist.Count; i++)
        {
            for (int j = 0; j < fields.Length; j++)
                values[i, j] = datalist[i][j];
        }
        try
        {
            UserDAO.Insert(fields, values);
        }
        catch (Exception e)
        {
            string msg = e.Message;
            if (msg[0] == '违')
                return "不允许重复的学号出现，请检查！\n重复学号：" + msg.Remove(msg.LastIndexOf(')')).Substring(msg.LastIndexOf('(') + 1);
            else
                throw e;
        }

        if (invalidindex != 1)
        {
            FileStream _fs = new FileStream(sitepath + "Outputs\\错误行汇总.xls", FileMode.OpenOrCreate);
            invalidwb.Write(_fs);
            _fs.Close();
            return "true:/Outputs/错误行汇总.xls";
        }
        AdminLogDAO.Insert(adminid, "addusr_b{" + datalist.Count + "}");
        return "true";
    }
    public static string AddUser(Dictionary<string, string> userinfo, int adminid)
    {
        UserField[] fields;
        string[] values, changes;
        string msg = "";
        if (!userinfo.ContainsKey("name"))
            msg += "姓名、";
        if (!userinfo.ContainsKey("sno"))
            msg += "学号、";
        if (!userinfo.ContainsKey("department"))
            msg += "部门、";
        if (msg.Length > 0)
            return msg.Remove(msg.Length - 1) + "不能为空！";
        msg = JudgeUserInfo(userinfo, out fields, out values, out changes);
        if (msg.Length > 0)
            return msg.Remove(msg.Length - 1);
        try
        {
            UserDAO.Insert(fields, values);
        }
        catch (Exception e)
        {
            if (e.Message[0] == '违')
                return "学号重复！";
            else
                throw e;
        }
        string loginfo = changes[0];
        bool overflow = false;
        for (int i = 1; i < changes.Length; i++)
        {
            if (loginfo.Length + changes[i].Length <= AdminLogField.Event.SqlDataLength - 14)
                loginfo += '\t' + changes[i];
            else
                overflow = true;
        }
        if (overflow)
            loginfo += "\t...";
        AdminLogDAO.Insert(adminid, "addusr_s{" + loginfo + "}");
        return "true";
    }
    public static string AlterUserInfo(string usersid, Dictionary<string, string> userinfo, int adminid)
    {
        if (usersid == "")
            return "数据格式错误，请联系管理员！";
        string[] ids = usersid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!UserField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        UserField[] fields;
        string[] values, changes;
        string msg = JudgeUserInfo(userinfo, out fields, out values, out changes);
        if (msg.Length > 0)
            return msg.Remove(msg.Length - 1);
        else if (fields.Length == 0)
            return "无任何有效数据！";
        try
        {
            UserDAO.Update(fields, values, new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or));
        }
        catch (Exception e)
        {
            if (e.Message[0] == '违')
                return "学号重复！";
            else
                throw e;
        }

        string loginfo1 = changes[0], loginfo2;
        int _i = 1, len = AdminLogField.Event.SqlDataLength / 2;
        for (; _i < changes.Length; _i++)
        {
            if (loginfo1.Length + changes[_i].Length <= len - 11)
                loginfo1 += '\t' + changes[_i];
            else
                break;
        }
        if (_i == changes.Length)
            len = AdminLogField.Event.SqlDataLength - loginfo1.Length - 6;
        if (usersid.Length > len - 7)
        {
            int index = len - 10;
            while (usersid[index] != ',') index--;
            loginfo2 = usersid.Remove(index) + "...";
        }
        else
        {
            loginfo2 = usersid;
            len = AdminLogField.Event.SqlDataLength - loginfo2.Length - 7;
        }
        bool overflow = false;
        for (; _i < changes.Length; _i++)
        {
            if (loginfo1.Length + changes[_i].Length <= len - 11)
                loginfo1 += '\t' + changes[_i];
            else
                overflow = true;
        }
        if (overflow)
            loginfo1 += "\t...";
        AdminLogDAO.Insert(adminid, "altusrinfo{" + loginfo2 + '\r' + loginfo1 + "}");
        return "true";
    }
    #endregion

    #region 管理员管理
    public static string GetAdminTypes(int adminid)
    {
        string s = "[" + admintypes[0].Serilize();
        for (int i = 1; i < 5; i++)
            s += "," + admintypes[i].Serilize();
        AdminLogDAO.Insert(adminid, "getadmtps{}");
        return s + "]";
    }
    public static string GetAuthorities(int adminid)
    {
        string s = "[" + authorities[0].Serilize();
        for (int i = 1; i < 5; i++)
            s += "," + authorities[i].Serilize();
        AdminLogDAO.Insert(adminid, "getadmauts{}");
        return s + "]";
    }
    public static object[,] GetAdmins(string method, string key, byte admintype, int adminid)
    {
        AdminField[] fields = new AdminField[] {
                AdminField.Id, AdminField.Name, AdminField.Type,
                AdminField.Authorities, AdminField.Status, AdminField.Remark };
        AdminLogDAO.Insert(adminid, "getadms{" + method + ':' + key + "}");
        switch (method)
        {
            case "":
                return AdminDAO.Select(fields, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype)); //不允许查看级别相同或更高的管理员
            case "管理员名":
                return AdminDAO.Select(fields, new SqlQueryCondition(new SqlQueryCondition(AdminField.Name, SqlQueryConditionOperator.Contain, key),
                    SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许查看级别相同或更高的管理员
            case "类型":
                if (!AdminField.Type.TestValue(key))
                    return new object[0, 0];
                return AdminDAO.Select(fields, new SqlQueryCondition(new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.Equal, key),
                    SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许查看级别相同或更高的管理员
            case "状态":
                if (key != "0" && key != "1")
                    return new object[0, 0];
                return AdminDAO.Select(fields, new SqlQueryCondition(new SqlQueryCondition(AdminField.Status, SqlQueryConditionOperator.Equal, key),
                    SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许查看级别相同或更高的管理员
            default:
                return new object[0, 0];
        }
    }
    public static string ResetAdminPwd(string _adminid, byte admintype, int adminid)
    {
        if (!AdminField.Id.TestValue(_adminid))
            return "数据格式错误，请联系管理员！";
        AdminDAO.Update(new AdminField[] { AdminField.Password }, new object[] {
                CommonMethods.BytesToHexString(new SHA256CryptoServiceProvider().ComputeHash(Encoding.UTF8.GetBytes("123456"))) },
            new SqlQueryCondition(new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, _adminid),
            SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许对级别相同或更高的管理员进行更改
        AdminLogDAO.Insert(adminid, "rstadmpwd{" + _adminid + "}");
        return "true";
    }
    public static string ChangeAdminStatus(string adminsid, string status, byte admintype, int adminid)
    {
        if (adminsid == "" || AdminField.Status.TestValue(status))
            return "数据格式错误，请联系管理员！";
        string[] ids = adminsid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!AdminField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        AdminDAO.Update(new AdminField[] { AdminField.Status }, new object[] { status },
            new SqlQueryCondition(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or),
            SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许对级别相同或更高的管理员进行更改
        if (adminsid.Length > AdminLogField.Event.SqlDataLength - 13)
        {
            int index = AdminLogField.Event.SqlDataLength - 16;
            while (adminsid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "chgadmsts{" + adminsid.Remove(index) + "...\r" + status + "}");
        }
        else
            AdminLogDAO.Insert(adminid, "chgadmsts{" + adminsid + '\r' + status + "}");
        return "true";
    }
    public static string DeleteAdmin(string adminsid, byte admintype, int adminid)
    {
        if (adminsid == "")
            return "数据格式错误，请联系管理员！";
        string[] ids = adminsid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!AdminField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        AdminDAO.Delete(new SqlQueryCondition(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or),
            SqlQueryLogicalOperator.And, new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许删除级别相同或更高的管理员
        if (adminsid.Length > AdminLogField.Event.SqlDataLength - 8)
        {
            int index = AdminLogField.Event.SqlDataLength - 11;
            while (adminsid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "deladm{" + adminsid.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "deladm{" + adminsid + "}");
        return "true";
    }
    public static string AddAdmin(string name, string pwd, string type, bool[][] authorities, string remark, byte admintype, bool[][] thisauthorities, int adminid)
    {
        if (!AdminField.Name.TestValue(name) || !AdminField.Type.TestValue(type) ||
            authorities.Length > 5 || !AdminField.Remark.TestValue(remark))
            return "数据错误，请联系管理员！";
        byte _type = Byte.Parse(type);
        if (_type <= admintype) //不允许创建同级或更高级别的管理员
            return "数据错误，请联系管理员！";
        int index = 0;
        while (_type != admintypes[index].index) index++;
        string _authorities = "", _authinfo = "";
        for (byte i = 0; i < authorities.Length; i++) //不允许创建权限多于默认权限或自身权限的管理员
        {
            if (authorities[i] != null)
            {
                _authorities += i + "("; _authinfo += AdminBUS.authorities[i].describe + ",";
                if (thisauthorities[i] == null || !admintypes[index].defaultauthorites.Contains(i) || authorities[i].Length != thisauthorities[i].Length)
                    return "数据错误，请联系管理员！";
                string auths = "";
                for (byte j = 0; j < authorities[i].Length; j++)
                {
                    if (authorities[i][j])
                    {
                        if (!thisauthorities[i][j])
                            return "数据错误，请联系管理员！";
                        byte[] requiredauths = AdminBUS.authorities[i].auths[j].requiredauths;
                        for (int k = 0; k < requiredauths.Length; k++)
                        {
                            if (!authorities[i][requiredauths[k]])
                                return "数据错误，请联系管理员！";
                        }
                        auths += j + ",";
                    }
                }
                if (auths.Count((c) => { if (c == ',') return true; else return false; }) == authorities[i].Length)
                    _authorities += ')';
                else
                    _authorities += auths.Remove(auths.Length - 1) + ')';
            }
        }
        if (_authorities == "")
            return "管理员无任何权限！";
        if (remark == null)
            remark = "";
        try
        {
            if (pwd != null && pwd.Length > 0)
            {
                pwd = CommonMethods.Decrypt(pwd);
                if (pwd.Length < 8 || pwd.Length > 16)
                    return "密码长度不符合要求！";
                byte[] b = new SHA256CryptoServiceProvider().ComputeHash(Encoding.UTF8.GetBytes(pwd));
                pwd = CommonMethods.BytesToHexString(b);
                AdminDAO.Insert(name, pwd, _type, _authorities, remark);
            }
            else
                AdminDAO.Insert(name, _type, _authorities, remark);
        }
        catch (Exception e)
        {
            if (e.Message[0] == '违')
                return "管理员名重复！";
            else
                throw e;
        }
        AdminLogDAO.Insert(adminid, "addadm{管理员名：" + name + "\t附加信息：" + remark +
            "\t类型：" + admintypes[index].name + "\t权限：" + _authinfo.Remove(_authinfo.Length - 1) + "}");
        return "true";
    }
    public static string AlterAdminInfo(string _adminid, Dictionary<string, string> admininfo, byte admintype, int adminid)
    {
        if (!AdminField.Id.TestValue(_adminid))
            return "数据格式错误，请联系管理员！";
        List<AdminField> fieldlist = new List<AdminField>(2);
        List<string> valuelist = new List<string>(2);
        string s = "", msg, changes = "";
        if (admininfo.ContainsKey("name"))
        {
            if (AdminField.Name.TestValue(admininfo["name"], out msg))
            {
                fieldlist.Add(AdminField.Name);
                valuelist.Add(admininfo["name"]);
                changes += "管理员名：" + admininfo["name"] + '\t';
            }
            else
                s += "管理员名信息错误 " + msg + '\n';
        }
        if (admininfo.ContainsKey("remark"))
        {
            if (AdminField.Remark.TestValue(admininfo["remark"], out msg))
            {
                fieldlist.Add(AdminField.Remark);
                valuelist.Add(admininfo["remark"]);
                changes += "附加信息：" + admininfo["remark"] + '\t';
            }
            else
                s += "附加信息错误 " + msg + '\n';
        }
        if (s.Length > 0)
            return s.Remove(s.Length - 1);
        else if (fieldlist.Count == 0)
            return "无任何有效数据！";
        try
        {
            AdminDAO.Update(fieldlist.ToArray(), valuelist.ToArray(), new SqlQueryCondition(
                new SqlQueryCondition(AdminField.Id, SqlQueryConditionOperator.Equal, _adminid), SqlQueryLogicalOperator.And,
                new SqlQueryCondition(AdminField.Type, SqlQueryConditionOperator.More_Than, admintype))); //不允许对级别相同或更高的管理员进行更改
        }
        catch (Exception e)
        {
            if (e.Message[0] == '违')
                return "管理员名重复！";
            else
                throw e;
        }
        AdminLogDAO.Insert(adminid, "altadminfo{" + _adminid + '\r' + changes.Remove(changes.Length - 1) + "}");
        return "true";
    }
    #endregion

    #region 查看日志
    public static string GetUserEventTyps(int adminid)
    {
        string s = '[' + userlogeventtypes[0].Serilize();
        for (int i = 1; i < userlogeventtypes.Length; i++)
            s += ',' + userlogeventtypes[i].Serilize();
        AdminLogDAO.Insert(adminid, "getusrevttps{}");
        return s + ']';
    }
    public static string GetAdminEventTyps(int adminid)
    {
        string s = '[' + adminlogeventtypes[0].Serilize();
        for (int i = 1; i < adminlogeventtypes.Length; i++)
            s += ',' + adminlogeventtypes[i].Serilize();
        AdminLogDAO.Insert(adminid, "getadmevttps{}");
        return s + ']';
    }
    public static object[,] GetUserLogs(string conditions, int adminid)
    {
        string[] _conditions = conditions.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[_conditions.Length];
        for (int i = 0; i < _conditions.Length; i++)
        {
            string[] keyvalue = _conditions[i].Split(':');
            if (keyvalue.Length != 2)
                return new object[0, 0];
            if (keyvalue[0] == "userid")
            {
                if (!UserLogField.User.TestValue(keyvalue[1]))
                    return new object[0, 0];
                sqlconditions[i] = new SqlQueryCondition(UserLogField.User, SqlQueryConditionOperator.Equal, keyvalue[1]);
            }
            else if (keyvalue[0] == "eventtype")
            {
                if (!JudgeUserEventType(keyvalue[1]))
                    return new object[0, 0];
                sqlconditions[i] = new SqlQueryCondition(UserLogField.Event, SqlQueryConditionOperator.Contain, keyvalue[1] + '{');
            }
            else if (keyvalue[0] == "starttime")
            {
                try
                {
                    sqlconditions[i] = new SqlQueryCondition(UserLogField.Time, SqlQueryConditionOperator.More_Than_Or_Equal,
                        new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(Int64.Parse(keyvalue[1])));
                }
                catch (Exception)
                {
                    return new object[0, 0];
                }
            }
            else if (keyvalue[0] == "endtime")
            {
                try
                {
                    sqlconditions[i] = new SqlQueryCondition(UserLogField.Time, SqlQueryConditionOperator.Less_Than_Or_Equal,
                        new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(Int64.Parse(keyvalue[1])));
                }
                catch (Exception)
                {
                    return new object[0, 0];
                }
            }
            else
                return new object[0, 0];
        }
        if (conditions.Length > AdminLogField.Event.SqlDataLength - 12)
        {
            int index = AdminLogField.Event.SqlDataLength - 15;
            while (conditions[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "getusrlogs{" + conditions.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "getusrlogs{" + conditions + "}");
        return UserLogDAO.Select(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
    }
    public static object[,] GetAdminLogs(string conditions, int adminid)
    {
        string[] _conditions = conditions.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[_conditions.Length];
        for (int i = 0; i < _conditions.Length; i++)
        {
            string[] keyvalue = _conditions[i].Split(':');
            if (keyvalue.Length != 2)
                return new object[0, 0];
            if (keyvalue[0] == "adminid")
            {
                if (!AdminLogField.Admin.TestValue(keyvalue[1]))
                    return new object[0, 0];
                sqlconditions[i] = new SqlQueryCondition(AdminLogField.Admin, SqlQueryConditionOperator.Equal, keyvalue[1]);
            }
            else if (keyvalue[0] == "eventtype")
            {
                if (!JudgeAdminEventType(keyvalue[1]))
                    return new object[0, 0];
                sqlconditions[i] = new SqlQueryCondition(AdminLogField.Event, SqlQueryConditionOperator.Contain, keyvalue[1] + '{');
            }
            else if (keyvalue[0] == "starttime")
            {
                try
                {
                    sqlconditions[i] = new SqlQueryCondition(AdminLogField.Time, SqlQueryConditionOperator.More_Than_Or_Equal,
                        new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(Int64.Parse(keyvalue[1])));
                }
                catch (Exception)
                {
                    return new object[0, 0];
                }
            }
            else if (keyvalue[0] == "endtime")
            {
                try
                {
                    sqlconditions[i] = new SqlQueryCondition(AdminLogField.Time, SqlQueryConditionOperator.Less_Than_Or_Equal,
                        new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(Int64.Parse(keyvalue[1])));
                }
                catch (Exception)
                {
                    return new object[0, 0];
                }
            }
            else
                return new object[0, 0];
        }
        if (conditions.Length > AdminLogField.Event.SqlDataLength - 12)
        {
            int index = AdminLogField.Event.SqlDataLength - 15;
            while (conditions[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "getadmlogs{" + conditions.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "getadmlogs{" + conditions + "}");
        return AdminLogDAO.Select(new SqlQueryCondition(sqlconditions.ToArray(), SqlQueryLogicalOperator.And));
    }
    public static string DeleteUserLog(string logsid, int adminid)
    {
        if (logsid == "")
            return "数据格式错误，请联系管理员！";
        string[] ids = logsid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!UserLogField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(UserLogField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        UserLogDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or));
        if (logsid.Length > AdminLogField.Event.SqlDataLength - 11)
        {
            int index = AdminLogField.Event.SqlDataLength - 14;
            while (logsid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "delusrlog{" + logsid.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "delusrlog{" + logsid + "}");
        return "true";
    }
    public static string DeleteAdminLog(string logsid, int adminid)
    {
        if (logsid == "")
            return "数据格式错误，请联系管理员！";
        string[] ids = logsid.Split(',');
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[ids.Length];
        for (int i = 0; i < ids.Length; i++)
        {
            if (!AdminLogField.Id.TestValue(ids[i]))
                return "数据格式错误，请联系管理员！";
            sqlconditions[i] = new SqlQueryCondition(AdminLogField.Id, SqlQueryConditionOperator.Equal, ids[i]);
        }
        AdminLogDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.Or));
        if (logsid.Length > AdminLogField.Event.SqlDataLength - 11)
        {
            int index = AdminLogField.Event.SqlDataLength - 14;
            while (logsid[index] != ',') index--;
            AdminLogDAO.Insert(adminid, "deladmlog{" + logsid.Remove(index) + "...}");
        }
        else
            AdminLogDAO.Insert(adminid, "deladmlog{" + logsid + "}");
        return "true";
    }
    #endregion

    #region 系统管理
    public static string GetSystemState(int adminid)
    {
        string s = "";
        s += VisitManager.VisitorCount + ",";
        s += VisitManager.MaxVisitorCount + ",";
        s += LoginBUS.LoginedUserCount + ",";
        s += LoginBUS.LoginedAdminCount + ",";
        long totalrequestcount = VisitManager.TotalRequestCount;
        CommonMethods.Sleep(10000000);
        s += VisitManager.TotalRequestCount - totalrequestcount + 1 + ",";
        s += totalrequestcount + ",";
        s += sysmaintainstate;
        AdminLogDAO.Insert(adminid, "getsyssts{}");
        return s;
    }
    public static string GetLoginedUsers(int adminid)
    {
        string s = "";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor != null && visitor.IsLogined_User)
            {
                TimeSpan t = DateTime.Now - visitor.LastActiveTime;
                s += visitor.LoginedUserId + "," + id + "," + (t.Minutes > 0 ? t.Minutes + "分钟前" : t.Seconds + "秒前") + ",";
            }
            return false;
        });
        AdminLogDAO.Insert(adminid, "getlogdusrs{}");
        return s;
    }
    public static string GetLoginedAdmins(byte admintype, int adminid)
    {
        string s = "";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor != null && visitor.IsLogined_Admin && visitor.AdminType > admintype)
            {
                int index = 0;
                while (visitor.AdminType != admintypes[index].index) index++;
                TimeSpan t = DateTime.Now - visitor.LastActiveTime;
                s += visitor.LoginedAdminId + "," + admintypes[index].name + "," +
                id + "," + (t.Minutes > 0 ? t.Minutes + "分钟前" : t.Seconds + "秒前") + ",";
            }
            return false;
        });
        AdminLogDAO.Insert(adminid, "getlogdadms{}");
        return s;
    }
    public static string GetLoginedUser(string sno, int adminid)
    {
        if (!UserField.StudentNmber.TestValue(sno))
            return "";
        object[,] data = UserDAO.Select(new UserField[] { UserField.Id },
            new SqlQueryCondition(UserField.StudentNmber, SqlQueryConditionOperator.Equal, sno));
        if (data.Length == 0)
            return "";
        string s = "";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor != null && visitor.IsLogined_User && visitor.LoginedUserId == (int)data[0, 0])
            {
                TimeSpan t = DateTime.Now - visitor.LastActiveTime;
                s += visitor.LoginedUserId + "," + id + "," + (t.Minutes > 0 ? t.Minutes + "分钟前" : t.Seconds + "秒前");
                return true;
            }
            return false;
        });
        AdminLogDAO.Insert(adminid, "getlogdusr{" + sno + "}");
        return s;
    }
    public static string GetLoginedAdmin(string name, byte admintype, int adminid)
    {
        if (!AdminField.Name.TestValue(name))
            return "";
        object[,] data = AdminDAO.Select(new AdminField[] { AdminField.Id },
            new SqlQueryCondition(AdminField.Name, SqlQueryConditionOperator.Equal, name));
        if (data.Length == 0)
            return "";
        string s = "";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor != null && visitor.IsLogined_Admin && visitor.LoginedAdminId == (int)data[0, 0])
            {
                if (visitor.AdminType > admintype)
                {
                    int index = 0;
                    while (visitor.AdminType != admintypes[index].index) index++;
                    TimeSpan t = DateTime.Now - visitor.LastActiveTime;
                    s += visitor.LoginedAdminId + "," + admintypes[index].name + "," +
                    id + "," + (t.Minutes > 0 ? t.Minutes + "分钟前" : t.Seconds + "秒前");
                }
                return true;
            }
            return false;
        });
        AdminLogDAO.Insert(adminid, "getlogdadm{" + name + "}");
        return s;
    }
    public static string offlineUser(string userid, string visitorid, int adminid)
    {
        int logoutid, _visitorid;
        if (!Int32.TryParse(userid, out logoutid) || !Int32.TryParse(visitorid, out _visitorid))
            return "数据错误，请联系管理员！";
        string s = "true";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor == null)
                s = "数据错误，请联系管理员！";
            else
            {
                if (visitor.IsLogined_User && visitor.LoginedUserId == logoutid)
                {
                    LoginBUS.Logout_User(logoutid);
                    visitor.LoginedUserId = 0;
                }
                else
                    s += ":用户已下线或登录信息已过期！";
            }
            return true;
        }, _visitorid);
        AdminLogDAO.Insert(adminid, "oflnusr{" + userid + '\r' + visitorid + "}");
        return s;
    }
    public static string offlineAdmin(string _adminid, string visitorid, byte admintype, int adminid)
    {
        int logoutid, _visitorid;
        if (!Int32.TryParse(_adminid, out logoutid) || !Int32.TryParse(visitorid, out _visitorid))
            return "数据错误，请联系管理员！";
        string s = "true";
        VisitManager.Travelsal((visitor, id) =>
        {
            if (visitor == null)
                s = "数据错误，请联系管理员！";
            else
            {
                if (visitor.IsLogined_Admin && visitor.LoginedAdminId == logoutid)
                {
                    if (visitor.AdminType > admintype)
                    {
                        LoginBUS.Logout_Admin(logoutid);
                        visitor.LoginedAdminId = 0;
                    }
                    else
                        s = "权限不足！";
                }
                else
                    s += ":管理员已下线或登录信息已过期！";
            }
            return true;
        }, _visitorid);
        AdminLogDAO.Insert(adminid, "oflnadm{" + _adminid + '\r' + visitorid + "}");
        return s;
    }
    public static string MaintainSystem(string reason, int adminid)
    {
        if (sysmaintainstate == 1)
            return "系统已处于维护状态！";
        if (reason == null || reason == "" || reason.Length > 40)
            return "维护原因为空或长度不符合要求！";
        sysmaintainstate = 1;
        LoginBUS.StopUser();
        LoginBUS.StopAdmin();
        VisitManager.OfflineAllAcounts();
        LoginBUS.AcceptAdmin();
        //以上4句顺序不可调
        AdminLogDAO.Insert(adminid, "matnsys{" + reason + "}");
        return "true";
    }
    public static string RestoreSystem(int adminid)
    {
        sysmaintainstate = 0;
        LoginBUS.AcceptUser();
        AdminLogDAO.Insert(adminid, "rstrsys{}");
        return "true";
    }
    #endregion

    #region 私有方法
    private static object[] LinkData(object[,] userdata, object[,] scheduledata, bool containscheduleid)
    {
        int len = scheduledata.GetLength(0), width1 = userdata.GetLength(1), width2 = scheduledata.GetLength(1);
        object[] data = new object[35];
        for (int i = 0; i < 35; i++)
            data[i] = new List<object>();
        int datefieldindex = containscheduleid ? 1 : 0, seqfieldindex = datefieldindex + 1,
            attendantfieldindex = seqfieldindex + 1, signintimefieldindex = datefieldindex + 3;
        for (int i = 0; i < len; i++)
        {
            int cellindex = 5 * (int)(((DateTime)scheduledata[i, datefieldindex]).AddDays(-1).DayOfWeek) +
                (byte)scheduledata[i, seqfieldindex] - 1;
            List<object> list = (List<object>)data[cellindex];
            int userdataindex = CommonMethods.BinarySearch(userdata, (int)scheduledata[i, attendantfieldindex], width1);
            if (containscheduleid)
                list.Add(scheduledata[i, 0]);
            for (int j = datefieldindex; j < width1; j++) //scheduledata中包含id时不保留userdata中的id
                list.Add(userdata[userdataindex, j]);
            for (int j = signintimefieldindex; j < width2; j++)
                list.Add(scheduledata[i, j]);
        }
        return data;
    }
    private static bool JudgeUserData(HSSFRow row, UserField[] fields, out object[] data, out string errormsg)
    {
        data = new object[fields.Length];
        HSSFCell cell; object val; string msg;
        errormsg = "";
        for (int i = 0; i < 2; i++) //姓名、学号
        {
            if ((cell = (HSSFCell)row.GetCell(i)) == null)
                errormsg += "列" + (char)('A' + i) + " 不允许为空\n";
            else if (!fields[i].TestValue((val = cell.StringCellValue), out msg))
                errormsg += "列" + (char)('A' + i) + " " + msg + "\n";
            else
                data[i] = val;
        }

        string[] departments = { "网络技术部", "美术设计部", "信息策划部", "记者采访部", "宣传推广部", "人力资源部" }; //部门
        short dept;
        if ((cell = (HSSFCell)row.GetCell(2)) == null)
            errormsg += "列C 不允许为空\n";
        else if ((dept = (short)CommonMethods.ElementIndexOfArray(cell.StringCellValue, departments)) == -1)
            errormsg += "列C 不在允许的值范围内\n";
        else
            data[2] = dept;

        for (int i = 3; i < 7; i++) //学院、年级、专业班级、性别
        {
            if ((cell = (HSSFCell)row.GetCell(i)) == null || cell.CellType == CellType.Blank)
                data[i] = DBNull.Value;
            else
            {
                val = Convert.ChangeType(cell.CellValue, fields[i].DataType);
                if (!fields[i].TestValue((val), out msg))
                    errormsg += "列" + (char)('A' + i) + " " + msg + "\n";
                else
                    data[i] = val;
            }
        }

        if ((cell = (HSSFCell)row.GetCell(7)) == null || cell.CellType == CellType.Blank) //生日
            data[7] = DBNull.Value;
        else
        {
            try
            {
                data[7] = cell.DateCellValue;
            }
            catch (Exception)
            {
                errormsg += "列H 不是一个日期\n";
            }
        }

        for (int i = 8; i < 14; i++) //电话号码、QQ、微信、身份证号、宿舍地址、家庭住址
        {
            if ((cell = (HSSFCell)row.GetCell(i)) == null || cell.CellType == CellType.Blank)
                data[i] = DBNull.Value;
            else
            {
                val = Convert.ChangeType(cell.CellValue, fields[i].DataType);
                if (!fields[i].TestValue((val), out msg))
                    errormsg += "列" + (char)('A' + i) + " " + msg + "\n";
                else
                    data[i] = val;
            }
        }

        if (errormsg.Length == 0)
            return true;
        else
            return false;
    }
    private static string JudgeUserInfo(Dictionary<string, string> info, out UserField[] fields, out string[] values, out string[] changes)
    {
        List<UserField> fieldlist = new List<UserField>(15);
        List<string> valuelist = new List<string>(15);
        List<string> changelist = new List<string>(15);
        string s = "", msg;
        if (info.ContainsKey("sno"))
        {
            if (UserField.StudentNmber.TestValue(info["sno"], out msg))
            {
                fieldlist.Add(UserField.StudentNmber);
                valuelist.Add(info["sno"]);
                changelist.Add("学号：" + info["sno"]);
            }
            else
                s += "学号信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("name"))
        {
            if (UserField.Name.TestValue(info["name"], out msg))
            {
                fieldlist.Add(UserField.Name);
                valuelist.Add(info["name"]);
                changelist.Add("姓名：" + info["name"]);
            }
            else
                s += "姓名信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("department"))
        {
            if (UserField.Department.TestValue(info["department"], out msg))
            {
                fieldlist.Add(UserField.Department);
                valuelist.Add(info["department"]);
                changelist.Add("部门：" + departments[Int32.Parse(info["department"])].Name);
            }
            else
                s += "部门信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("school"))
        {
            if (UserField.School.TestValue(info["school"], out msg))
            {
                fieldlist.Add(UserField.School);
                valuelist.Add(info["school"]);
                changelist.Add("学院：" + info["school"]);
            }
            else
                s += "学院信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("grade"))
        {
            if (UserField.Grade.TestValue(info["grade"], out msg))
            {
                fieldlist.Add(UserField.Grade);
                valuelist.Add(info["grade"]);
                changelist.Add("年级：" + info["grade"]);
            }
            else
                s += "年级信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("class"))
        {
            if (UserField.Class.TestValue(info["class"], out msg))
            {
                fieldlist.Add(UserField.Class);
                valuelist.Add(info["class"]);
                changelist.Add("班级：" + info["class"]);
            }
            else
                s += "专业班级信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("sex"))
        {
            if (UserField.Sex.TestValue(info["sex"], out msg))
            {
                fieldlist.Add(UserField.Sex);
                valuelist.Add(info["sex"]);
                changelist.Add("性别：" + info["sex"]);
            }
            else
                s += "性别信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("birthday"))
        {
            DateTime date;
            if (DateTime.TryParse(info["birthday"], out date))
            {
                fieldlist.Add(UserField.Birthday);
                valuelist.Add(date.ToString("yyyy-MM-dd"));
                changelist.Add("生日：" + date.ToString("yyyy-MM-dd"));
            }
            else
                s += "生日信息错误 不是一个日期\n";
        }
        if (info.ContainsKey("qq"))
        {
            if (UserField.QQ.TestValue(info["qq"], out msg))
            {
                fieldlist.Add(UserField.QQ);
                valuelist.Add(info["qq"]);
                changelist.Add("QQ：" + info["qq"]);
            }
            else
                s += "QQ信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("wechat"))
        {
            if (UserField.WeChat.TestValue(info["wechat"], out msg))
            {
                fieldlist.Add(UserField.WeChat);
                valuelist.Add(info["wechat"]);
                changelist.Add("微信：" + info["wechat"]);
            }
            else
                s += "微信信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("phone"))
        {
            if (UserField.PhoneNumber.TestValue(info["phone"], out msg))
            {
                fieldlist.Add(UserField.PhoneNumber);
                valuelist.Add(info["phone"]);
                changelist.Add("电话号码：" + info["phone"]);
            }
            else
                s += "电话号码信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("dormitory"))
        {
            if (UserField.Dormitory.TestValue(info["dormitory"], out msg))
            {
                fieldlist.Add(UserField.Dormitory);
                valuelist.Add(info["dormitory"]);
                changelist.Add("宿舍：" + info["dormitory"]);
            }
            else
                s += "宿舍信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("address"))
        {
            if (UserField.Address.TestValue(info["address"], out msg))
            {
                fieldlist.Add(UserField.Address);
                valuelist.Add(info["address"]);
                changelist.Add("家庭住址：" + info["address"]);
            }
            else
                s += "家庭住址信息错误 " + msg + '\n';
        }
        if (info.ContainsKey("idcard"))
        {
            if (UserField.IdCardNumber.TestValue(info["idcard"], out msg))
            {
                fieldlist.Add(UserField.IdCardNumber);
                valuelist.Add(info["idcard"]);
                changelist.Add("身份证号：" + info["idcard"]);
            }
            else
                s += "身份证号信息错误 " + msg + '\n';
        }
        fields = fieldlist.ToArray();
        values = valuelist.ToArray();
        changes = changelist.ToArray();
        return s;
    }
    private static bool JudgeUserEventType(string eventtype)
    {
        for (int i = 0; i < userlogeventtypes.Length; i++)
        {
            if (eventtype == userlogeventtypes[i].sqlname)
                return true;
        }
        return false;
    }
    private static bool JudgeAdminEventType(string eventtype)
    {
        for (int i = 0; i < adminlogeventtypes.Length; i++)
        {
            if (eventtype == adminlogeventtypes[i].sqlname)
                return true;
        }
        return false;
    }
    #endregion
}

