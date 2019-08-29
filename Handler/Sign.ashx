<%@ WebHandler Language="C#" Class="Sign" %>

using System.Web;
using System.Web.Script.Serialization;

/// <summary>
/// 签到事务处理程序
/// </summary>
public class Sign : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string action = context.Request.Params["action"];
        switch (action)
        {
            case "getdutytimes":
                context.Response.Write(new JavaScriptSerializer().Serialize(SignBUS.GetDutyTimes()));
                break;
            case "signin":
                context.Response.Write(SignBUS.SignIn(context.Request.Params["sno"], context.Request.Params["seq"], context.Request.Params["remark"]));
                break;
            case "signout":
                context.Response.Write(SignBUS.SignOut(context.Request.Params["sno"], context.Request.Params["seq"], context.Request.Params["remark"]));
                break;
            case "feedback":
                SignBUS.Feedback(context.Server.MapPath("/"), context.Request.Params["theme"], context.Request.Params["detail"], context.Request.Params["contactinfo"]);
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