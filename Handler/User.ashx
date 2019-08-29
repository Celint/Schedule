<%@ WebHandler Language="C#" Class="User" %>

using System.Collections.Generic;
using System.Web;
using CoreComponent;
using System.Web.Script.Serialization;

/// <summary>
/// 用户事务处理程序
/// </summary>
public class User : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Visitor visitor = VisitManager.GetCurrentVisitor();
        if (!visitor.IsLogined_User)
        {
            context.Response.Write("你还未登录或登录信息已过期！");
            return;
        }
        string action = context.Request.Params["action"];
        switch (action)
        {
            case "getusername":
                context.Response.Write(UserBUS.GetName(visitor.LoginedUserId));
                break;
            case "getuserinfo":
                context.Response.Write(new JavaScriptSerializer().Serialize(UserBUS.GetInfo(visitor.LoginedUserId)));
                break;
            case "alterpassword":
                context.Response.Write(UserBUS.UpdatePassword(context.Request.Params["oldpwd"], context.Request.Params["newpwd"], visitor.LoginedUserId));
                break;
            case "updateuserinfo":
                JavaScriptSerializer jsserializer = new JavaScriptSerializer();
                object[,] infodata;
                context.Response.Write(UserBUS.UpdateUserInfo(jsserializer.Deserialize<Dictionary<string, string>>(
                    context.Request.Params["userinfo"]), out infodata, visitor.LoginedUserId) + ':' + jsserializer.Serialize(infodata));
                break;
            case "gettimetables":
                context.Response.Write(new JavaScriptSerializer().Serialize(UserBUS.GetTimetables(visitor.LoginedUserId)));
                break;
            case "gettimetabledata":
                context.Response.Write(UserBUS.GetTimetableData(context.Request.Params["timetableid"], visitor.LoginedUserId)[0, 0]);
                break;
            case "addtimetable":
                context.Response.Write(UserBUS.AddTimetable(context.Request.Params["timetablename"], context.Request.Params["timetabledata"], visitor.LoginedUserId));
                break;
            case "renametimetable":
                context.Response.Write(UserBUS.RenameTimetable(context.Request.Params["timetableid"], context.Request.Params["timetablename"], visitor.LoginedUserId));
                break;
            case "updatetimetabledata":
                context.Response.Write(UserBUS.UpdateTimetableData(context.Request.Params["timetableid"], context.Request.Params["timetabledata"], visitor.LoginedUserId));
                break;
            case "activetimetable":
                context.Response.Write(UserBUS.ActiveTimetable(context.Request.Params["timetableid"], visitor.LoginedUserId));
                break;
            case "deletetimetable":
                context.Response.Write(UserBUS.DeleteTimetable(context.Request.Params["timetableid"], visitor.LoginedUserId));
                break;
            default:
                context.Response.Write("不能识别的指令类型！");
                break;
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}