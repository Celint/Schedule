<%@ WebHandler Language="C#" Class="Admin" %>

using System.Web;
using System.Collections.Generic;
using CoreComponent;
using System.Web.Script.Serialization;

/// <summary>
/// 管理员事务处理程序
/// </summary>
public class Admin : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        Visitor visitor = VisitManager.GetCurrentVisitor();
        if (!visitor.IsLogined_Admin)
        {
            context.Response.Write("你还未登录或登录信息已过期！");
            return;
        }
        string action = context.Request.Params["action"];
        switch (action)
        {
            case "getname":
                context.Response.Write(AdminBUS.GetName(visitor.LoginedAdminId));
                break;
            case "getauthority":
                context.Response.Write(new JavaScriptSerializer().Serialize(visitor.AdminAuthorities));
                break;
            case "alterpassword":
                context.Response.Write(AdminBUS.UpdatePassword(context.Request.Params["oldpwd"], context.Request.Params["newpwd"], visitor.LoginedAdminId));
                break;

            case "getdutytimes":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetDutyTimes(visitor.LoginedAdminId)));
                break;
            case "getdepartments":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetDepartments(visitor.LoginedAdminId)));
                break;
            case "getyears":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetYears(visitor.LoginedAdminId)));
                break;
            case "getterms":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetTerms(context.Request.Params["year"], visitor.LoginedAdminId)));
                break;
            case "getweekcount":
                context.Response.Write(AdminBUS.GetWeekCount(context.Request.Params["year"], context.Request.Params["term"], visitor.LoginedAdminId));
                break;
            case "getthisweek":
                context.Response.Write(AdminBUS.GetThisWeek(visitor.LoginedAdminId));
                break;
            case "getnextweek":
                context.Response.Write(AdminBUS.GetNextWeek(visitor.LoginedAdminId));
                break;
            case "getstartdate":
                context.Response.Write(new JavaScriptSerializer().Serialize(
                    AdminBUS.GetStartDate(context.Request.Params["year"], context.Request.Params["term"], context.Request.Params["week"], visitor.LoginedAdminId)));
                break;
            case "getscheduledata":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetScheduleData(visitor.LoginedAdminId)));
                break;
            case "getschedule":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetSchedule(context.Request.Params["startdate"], visitor.LoginedAdminId)));
                break;
            case "outputschedule":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.OutputSchedule(context.Request.Params["startdate"], context.Server.MapPath("/"), visitor.LoginedAdminId));
                break;
            case "outputfreeusers":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.OutputFreeUsers(context.Server.MapPath("/"), visitor.LoginedAdminId));
                break;
            case "saveschedule":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][2])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.SaveSchedule(context.Request.Params["startdate"],
                        new JavaScriptSerializer().Deserialize<int[][]>(context.Request.Params["schedule"]), visitor.LoginedAdminId));
                break;
            case "getsignresult":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetSignResult(context.Request.Params["startdate"], visitor.LoginedAdminId)));
                break;
            case "outputsignresult":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.OutputSignResult(context.Request.Params["startdate"], context.Request.Params["dividemethod"], context.Server.MapPath("/"), visitor.LoginedAdminId));
                break;
            case "deleteschedule":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][3])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.DeleteSignResult(context.Request.Params["scheduleid"], visitor.LoginedAdminId));
                break;
            case "istermexist":
                context.Response.Write(AdminBUS.IsTermExist(context.Request.Params["year"], context.Request.Params["term"], visitor.LoginedAdminId));
                break;
            case "addterm":
                if (visitor.AdminAuthorities[4] == null || !visitor.AdminAuthorities[4][4])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AddTerm(context.Request.Params["year"], context.Request.Params["term"],
                        context.Request.Params["startdate"], context.Request.Params["weeknum"], visitor.LoginedAdminId));
                break;

            case "getgrades":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetGrades(visitor.LoginedAdminId)));
                break;
            case "getschools":
                context.Response.Write(new JavaScriptSerializer().Serialize(AdminBUS.GetSchools(visitor.LoginedAdminId)));
                break;
            case "getusers":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(
                        AdminBUS.GetUsers(context.Request.Params["method"], context.Request.Params["key"], visitor.LoginedAdminId)));
                break;
            case "alteruserinfo":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AlterUserInfo(context.Request.Params["usersid"],
                        new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(context.Request.Params["userinfo"]), visitor.LoginedAdminId));
                break;
            case "resetuserpwd":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.ResetUserPwd(context.Request.Params["userid"], visitor.LoginedAdminId));
                break;
            case "changeuserstatus":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][2])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.ChangeUserStatus(context.Request.Params["usersid"], context.Request.Params["status"], visitor.LoginedAdminId));
                break;
            case "deleteuser":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][3])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.DeleteUser(context.Request.Params["usersid"], visitor.LoginedAdminId));
                break;
            case "adduser_batch":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][4])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AddUser(context.Request.Files["file"].InputStream, context.Server.MapPath("/"), visitor.LoginedAdminId));
                break;
            case "adduser_single":
                if (visitor.AdminAuthorities[3] == null || !visitor.AdminAuthorities[3][4])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AddUser(new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(context.Request.Params["userinfo"]), visitor.LoginedAdminId));
                break;

            case "getadmintypes":
                context.Response.Write(AdminBUS.GetAdminTypes(visitor.LoginedAdminId));
                break;
            case "getauthorities":
                context.Response.Write(AdminBUS.GetAuthorities(visitor.LoginedAdminId));
                break;
            case "getadmintype":
                context.Response.Write(visitor.AdminType);
                break;
            case "getadmins":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(
                        AdminBUS.GetAdmins(context.Request.Params["method"], context.Request.Params["key"], visitor.AdminType, visitor.LoginedAdminId)));
                break;
            case "alteradmininfo":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AlterAdminInfo(context.Request.Params["adminid"],
                        new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(context.Request.Params["admininfo"]), visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "resetadminpwd":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.ResetAdminPwd(context.Request.Params["adminid"], visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "changeadminstatus":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][2])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.ChangeAdminStatus(context.Request.Params["adminsid"], context.Request.Params["status"], visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "deleteadmin":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][3])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.DeleteAdmin(context.Request.Params["adminsid"], visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "addadmin":
                if (visitor.AdminAuthorities[2] == null || !visitor.AdminAuthorities[2][4])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.AddAdmin(context.Request.Params["name"], context.Request.Params["pwd"],
                        context.Request.Params["type"], new JavaScriptSerializer().Deserialize<bool[][]>(context.Request.Params["authorities"]),
                        context.Request.Params["remark"], visitor.AdminType, visitor.AdminAuthorities, visitor.LoginedAdminId));
                break;

            case "getusereventtypes":
                context.Response.Write(AdminBUS.GetUserEventTyps(visitor.LoginedAdminId));
                break;
            case "getadmineventtypes":
                context.Response.Write(AdminBUS.GetAdminEventTyps(visitor.LoginedAdminId));
                break;
            case "getuserlogs":
                if (visitor.AdminAuthorities[1] == null || !visitor.AdminAuthorities[1][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(
                        AdminBUS.GetUserLogs(context.Request.Params["conditions"], visitor.LoginedAdminId)));
                break;
            case "getadminlogs":
                if (visitor.AdminAuthorities[1] == null || !visitor.AdminAuthorities[1][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(new JavaScriptSerializer().Serialize(
                        AdminBUS.GetAdminLogs(context.Request.Params["conditions"], visitor.LoginedAdminId)));
                break;
            case "deleteuserlog":
                if (visitor.AdminAuthorities[1] == null || !visitor.AdminAuthorities[1][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.DeleteUserLog(context.Request.Params["logsid"], visitor.LoginedAdminId));
                break;
            case "deleteadminlog":
                if (visitor.AdminAuthorities[1] == null || !visitor.AdminAuthorities[1][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.DeleteAdminLog(context.Request.Params["logsid"], visitor.LoginedAdminId));
                break;

            case "getsystemstate":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][0])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.GetSystemState(visitor.LoginedAdminId));
                break;
            case "getlogineduser":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.GetLoginedUser(context.Request.Params["sno"], visitor.LoginedAdminId));
                break;
            case "getloginedusers":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][1])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.GetLoginedUsers(visitor.LoginedAdminId));
                break;
            case "getloginedadmin":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][2])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.GetLoginedAdmin(context.Request.Params["name"], visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "getloginedadmins":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][2])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.GetLoginedAdmins(visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "offlineuser":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][3])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.offlineUser(context.Request.Params["userid"], context.Request.Params["_visitorid"], visitor.LoginedAdminId));
                break;
            case "offlineadmin":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][4])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.offlineAdmin(context.Request.Params["adminid"], context.Request.Params["_visitorid"], visitor.AdminType, visitor.LoginedAdminId));
                break;
            case "maintainsystem":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][5])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.MaintainSystem(context.Request.Params["reason"], visitor.LoginedAdminId));
                break;
            case "exitsysmaintain":
                if (visitor.AdminAuthorities[0] == null || !visitor.AdminAuthorities[0][5])
                    context.Response.Write("你没有此操作的权限！");
                else
                    context.Response.Write(AdminBUS.RestoreSystem(visitor.LoginedAdminId));
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