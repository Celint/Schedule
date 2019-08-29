using System;
using System.Collections.Generic;
using System.Text;
using System.Security.Cryptography;
using DataUtil;


/// <summary>
/// 处理与用户相关的事务的类
/// </summary>
public static class UserBUS
{

    public static string GetName(int userid)
    {
        UserLogDAO.Insert(userid, "getname{}");
        return UserDAO.Select(new UserField[] { UserField.Name },
            new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, userid))[0, 0].ToString();
    }
    public static object[,] GetInfo(int userid)
    {
        UserLogDAO.Insert(userid, "getinfo{}");
        return UserDAO.Select(UserField.OtherFields, new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, userid));
    }
    public static string UpdatePassword(string oldpwd, string newpwd, int userid)
    {
        SHA256CryptoServiceProvider sha256crypto = new SHA256CryptoServiceProvider();
        oldpwd = CommonMethods.Decrypt(oldpwd);
        byte[] b = sha256crypto.ComputeHash(Encoding.UTF8.GetBytes(oldpwd));
        oldpwd = CommonMethods.BytesToHexString(b);
        SqlQueryCondition sqlcondition1 = new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, userid);
        SqlQueryCondition sqlcondition2 = new SqlQueryCondition(UserField.Password, SqlQueryConditionOperator.Equal, oldpwd);
        if (UserDAO.Select(new UserField[] { UserField.Id },
            new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1, sqlcondition2 }, SqlQueryLogicalOperator.And)).Length == 0) //学号不存在或者状态码或密码不正确
            return "原密码不正确!";
        else
        {
            newpwd = CommonMethods.Decrypt(newpwd);
            if (newpwd.Length < 8 || newpwd.Length > 16)
                return "新密码长度不符合要求！";
            b = sha256crypto.ComputeHash(Encoding.UTF8.GetBytes(newpwd));
            newpwd = CommonMethods.BytesToHexString(b);
            UserDAO.Update(new UserField[] { UserField.Password }, new object[] { newpwd }, sqlcondition1);
            UserLogDAO.Insert(userid, "updpwd{}");
            return "true";
        }
    }
    public static string UpdateUserInfo(Dictionary<string, string> info, out object[,] newinfo, int userid)
    {
        List<UserField> fieldlist = new List<UserField>(7);
        List<object> valuelist = new List<object>(7);
        List<string> changes = new List<string>(7);
        string s = "", msg;
        if (info.ContainsKey("birthday"))
        {
            if (info["birthday"].Length != 0)
            {
                DateTime date;
                if (DateTime.TryParse(info["birthday"], out date))
                {
                    fieldlist.Add(UserField.Birthday);
                    valuelist.Add(date.ToString("yyyy-MM-dd"));
                    changes.Add("生日：" + date.ToString("yyyy-MM-dd"));
                }
                else
                    s += "生日信息错误 不是一个日期\n";
            }
            else
            {
                fieldlist.Add(UserField.Birthday);
                valuelist.Add(null);
                changes.Add("生日：(空)");
            }
        }
        if (info.ContainsKey("qq"))
        {
            if (UserField.QQ.TestValue(info["qq"], out msg))
            {
                fieldlist.Add(UserField.QQ);
                valuelist.Add(info["qq"]);
                changes.Add("QQ：" + info["qq"]);
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
                changes.Add("微信：" + info["wechat"]);
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
                changes.Add("电话号码：" + info["phone"]);
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
                changes.Add("宿舍：" + info["dormitory"]);
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
                changes.Add("家庭住址：" + info["address"]);
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
                changes.Add("身份证号：" + info["idcard"]);
            }
            else
                s += "身份证号信息错误 " + msg + '\n';
        }
        SqlQueryCondition sqlcondition = new SqlQueryCondition(UserField.Id, SqlQueryConditionOperator.Equal, userid);
        if (fieldlist.Count == 0)
            s = "没有符合要求的数据！";
        else
        {
            UserDAO.Update(fieldlist.ToArray(), valuelist.ToArray(), sqlcondition);
            string loginfo = changes[0];
            bool overflow = false;
            for (int i = 1; i < changes.Count; i++)
            {
                if (loginfo.Length + changes[i].Length <= UserLogField.Event.SqlDataLength - 14)
                    loginfo += '\t' + changes[i];
                else
                    overflow = true;
            }
            if (overflow)
                loginfo += "\t...";
            UserLogDAO.Insert(userid, "updinfo{" + loginfo + "}");
            if (s.Length != 0)
                s = "true:" + s;
            else
                s = "true";
        }
        newinfo = UserDAO.Select(UserField.OtherFields, sqlcondition);
        return s;
    }
    public static object[,] GetTimetables(int userid)
    {
        UserLogDAO.Insert(userid, "gettbs{}");
        TimetableField[] fields = new TimetableField[] { TimetableField.Id, TimetableField.Name, TimetableField.Status };
        return TimetableDAO.Select(fields, new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid));
    }
    public static object[,] GetTimetableData(string timetableid, int userid)
    {
        if (!TimetableField.Id.TestValue(timetableid))
            return new object[,] { { "" } };
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[] {
                new SqlQueryCondition(TimetableField.Id, SqlQueryConditionOperator.Equal, timetableid),
                new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid) //加入此条件防止非法查看他人课表
            };
        UserLogDAO.Insert(userid, "gettbdat{" + timetableid + "}");
        return TimetableDAO.Select(new TimetableField[] { TimetableField.Data }, new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
    }
    public static string AddTimetable(string timetablename, string data, int userid)
    {
        if (!TimetableField.Name.TestValue(timetablename) || !TimetableField.Data.TestValue(data))
            return "数据错误 请联系管理员！";
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[] {
                new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid),
                new SqlQueryCondition(TimetableField.Name, SqlQueryConditionOperator.Equal, timetablename)
            };
        if (TimetableDAO.Select(new TimetableField[] { TimetableField.Id }, new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And)).Length != 0)
            return "课表名重复！";
        else
        {
            UserLogDAO.Insert(userid, "addtb{" + timetablename + "}");
            return "true:" + TimetableDAO.Insert(timetablename, userid, data); //加上id一起返回
        }
    }
    public static string RenameTimetable(string timetableid, string newname, int userid)
    {
        if (!TimetableField.Id.TestValue(timetableid) || !TimetableField.Name.TestValue(newname))
            return "数据错误 请联系管理员！";
        SqlQueryCondition sqlcondition1 = new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid); //加入此条件防止非法更改他人课表
        SqlQueryCondition sqlcondition2 = new SqlQueryCondition(TimetableField.Id, SqlQueryConditionOperator.Equal, timetableid);
        SqlQueryCondition sqlcondition3 = new SqlQueryCondition(TimetableField.Name, SqlQueryConditionOperator.Equal, newname);
        if (TimetableDAO.Select(new TimetableField[] { TimetableField.Id },
            new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1, sqlcondition3 }, SqlQueryLogicalOperator.And)).Length != 0)
            return "课表名重复！";
        else
        {
            TimetableDAO.Update(new TimetableField[] { TimetableField.Name }, new object[] { newname },
                new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1, sqlcondition2 }, SqlQueryLogicalOperator.And));
            UserLogDAO.Insert(userid, "rntb{" + timetableid + '\r' + newname + "}");
            return "true";
        }
    }
    public static string UpdateTimetableData(string timetableid, string newdata, int userid)
    {
        if (!TimetableField.Id.TestValue(timetableid) || !TimetableField.Data.TestValue(newdata))
            return "数据错误 请联系管理员！";
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[] {
                new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid), //加入此条件防止非法更改他人课表
                new SqlQueryCondition(TimetableField.Id, SqlQueryConditionOperator.Equal, timetableid)
            };
        TimetableDAO.Update(new TimetableField[] { TimetableField.Data }, new object[] { newdata },
            new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        UserLogDAO.Insert(userid, "updtb{" + timetableid + "}");
        return "true";
    }
    public static string ActiveTimetable(string timetableid, int userid)
    {
        if (!TimetableField.Id.TestValue(timetableid))
            return "";
        SqlQueryCondition sqlcondition1 = new SqlQueryCondition(TimetableField.Id, SqlQueryConditionOperator.Equal, timetableid);
        SqlQueryCondition sqlcondition2 = new SqlQueryCondition(TimetableField.Status, SqlQueryConditionOperator.Equal, 1);
        SqlQueryCondition sqlcondition3 = new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid); //加入此条件防止非法更改他人课表
        if (TimetableDAO.Select(new TimetableField[] { TimetableField.Id },
            new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1, sqlcondition3 }, SqlQueryLogicalOperator.And)).Length != 0)
        {
            TimetableDAO.Update(new TimetableField[] { TimetableField.Status }, new object[] { 0 },
                new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition2, sqlcondition3 }, SqlQueryLogicalOperator.And));
            TimetableDAO.Update(new TimetableField[] { TimetableField.Status }, new object[] { 1 },
                new SqlQueryCondition(new SqlQueryCondition[] { sqlcondition1 }, SqlQueryLogicalOperator.And));
        }
        UserLogDAO.Insert(userid, "acttb{" + timetableid + "}");
        return "true";
    }
    public static string DeleteTimetable(string timetableid, int userid)
    {
        if (!TimetableField.Id.TestValue(timetableid))
            return "";
        SqlQueryCondition[] sqlconditions = new SqlQueryCondition[] {
                new SqlQueryCondition(TimetableField.Id, SqlQueryConditionOperator.Equal, timetableid),
                new SqlQueryCondition(TimetableField.Status, SqlQueryConditionOperator.NotEqual, 1),
                new SqlQueryCondition(TimetableField.Owner, SqlQueryConditionOperator.Equal, userid) //加入此条件防止非法更改他人课表
            };
        TimetableDAO.Delete(new SqlQueryCondition(sqlconditions, SqlQueryLogicalOperator.And));
        UserLogDAO.Insert(userid, "deltb{" + timetableid + "}");
        return "true";
    }

}
