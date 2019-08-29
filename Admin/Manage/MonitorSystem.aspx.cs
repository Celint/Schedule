﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using CoreComponent;

public partial class Admin_Manage_MonitorSystem : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        bool[][] auths = VisitManager.GetCurrentVisitor().AdminAuthorities;
        if (auths == null || auths[0] == null)
            Response.Write("<script>alert('你没有权限查看此页！');</script>");
    }
}