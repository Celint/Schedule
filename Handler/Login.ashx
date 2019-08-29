<%@ WebHandler Language="C#" Class="Login" %>

using System.Web;
using CoreComponent;

/// <summary>
/// 登录事务处理程序
/// </summary>
public class Login : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string action = context.Request.Params["action"];
        switch (action)
        {
            case "login_user":
                context.Response.Write(LoginBUS.Login_User(context.Request.Params["sno"], context.Request.Params["pwd"], context.Request.Params["vcode"]));
                break;
            case "login_admin":
                context.Response.Write(LoginBUS.Login_Admin(context.Request.Params["account"], context.Request.Params["pwd"], context.Request.Params["vcode"]));
                break;
            case "logout_user":
                LoginBUS.Logout_User(0); //传入0以区别于系统自动触发登出
                context.Response.Write("true");
                break;
            case "logout_admin":
                LoginBUS.Logout_Admin(0); //传入0以区别于系统自动触发登出
                context.Response.Write("true");
                break;
            case "islogined_user":
                context.Response.Write(VisitManager.GetCurrentVisitor().IsLogined_User);
                break;
            case "islogined_admin":
                context.Response.Write(VisitManager.GetCurrentVisitor().IsLogined_Admin);
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
