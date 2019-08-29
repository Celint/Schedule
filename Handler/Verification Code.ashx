<%@ WebHandler Language="C#" Class="Verification_Code" %>

using System;
using System.Drawing;
using System.Web;
using CoreComponent;

/// <summary>
/// 验证码生成器
/// </summary>
public class Verification_Code : IHttpHandler
{
    private static Random rand = new Random(DateTime.Now.Millisecond);
    private int codelength, imgheight, imgwidth;

    public void ProcessRequest(HttpContext context)
    {
        //图片基本参数
        codelength = 5;
        imgheight = 30;
        imgwidth = codelength * 18 + 6;

        //生成验证码字符串
        string checkcode = CommonMethods.RandomString(codelength);
        //将验证码保存在Visitor中
        VisitManager.GetCurrentVisitor().CheckVCode = checkcode;

        Bitmap image = new Bitmap(imgwidth, imgheight);
        Graphics graphic = Graphics.FromImage(image);

        //清空图片背景色 
        graphic.Clear(Color.White);

        //画图片的背景噪音线 
        for (int i = 0; i < 8; i++)
            graphic.DrawLine(new Pen(GetRandomColor()), GetRandomPoint(), GetRandomPoint());
        Font font = new Font("Arial", 15, (FontStyle.Bold | FontStyle.Italic));

        //画验证码字符串
        for (int i = 0; i < codelength; i++)
        {
            string code_char = checkcode.Substring(i, 1);
            Brush brush = new SolidBrush(GetRandomColor());
            Point point = new Point(i * 17 + 3 + rand.Next(4), 1 + rand.Next(5));
            graphic.DrawString(code_char, font, brush, point);
        }

        //画图片的前景噪音点 
        for (int i = 0; i < 50; i++)
            image.SetPixel(rand.Next(imgwidth), rand.Next(imgheight), Color.FromArgb(rand.Next()));

        //输出图像
        System.IO.MemoryStream ms = new System.IO.MemoryStream();
        image.Save(ms, System.Drawing.Imaging.ImageFormat.Gif);
        context.Response.ClearContent();
        context.Response.ContentType = "image/gif";
        context.Response.BinaryWrite(ms.ToArray());

        //释放资源
        graphic.Dispose();
        image.Dispose();
    }

    private Color GetRandomColor()
    {
        //  为了在白色背景上显示，尽量生成深色
        return Color.FromArgb(rand.Next(200), rand.Next(200), rand.Next(200));
    }
    private Point GetRandomPoint()
    {
        return new Point(rand.Next(1, imgwidth), rand.Next(1, imgheight));
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
