using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using CoreComponent;

public partial class Index : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!(VisitManager.GetCurrentVisitor().IsLogined_User))
            Response.Write("<script>alert('你还未登录或登录信息已过期！');location.href=\"Login.aspx\";</script>");
    }

}
