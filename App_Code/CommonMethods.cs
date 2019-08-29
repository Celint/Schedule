using System;
using System.Collections.Generic;
using System.Configuration;
using System.Text;
using System.Security.Cryptography;
using System.Threading;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

/// <summary>
/// 公共方法类
/// </summary>
public static class CommonMethods
{

    private delegate bool TestStringDelegate(char c);

    #region 字段及初始化
    private static Random rand = new Random((int)(DateTime.Now.Ticks));
    private static RSACryptoServiceProvider rsacrypto = new RSACryptoServiceProvider();
    static CommonMethods()
    {
        rsacrypto.FromXmlString(ConfigurationManager.AppSettings["RSAKey"]);
    }
    #endregion

    #region 适用本项目的方法
    public static string Decrypt(string encodedstr)
    {
        byte[] b = rsacrypto.Decrypt(HexStringToBytes(encodedstr), false);
        return Encoding.UTF8.GetString(b);
    }
    public static void MergeSort(ref object[,] data, int width)
    {
        int len = data.Length / width;
        if (len <= 1)
            return;
        else if (len == 2)
        {
            if ((int)data[0, 0] > (int)data[1, 0])
            {
                object temp;
                for (int j = 0; j < width; j++)
                {
                    temp = data[0, j];
                    data[0, j] = data[1, j];
                    data[1, j] = temp;
                }
            }
            return;
        }
        object[,] left = new object[len / 2, width];
        int i = 0;
        object[,] right = new object[len - len / 2, width];
        for (; i < len / 2; i++)
        {
            for (int j = 0; j < width; j++)
                left[i, j] = data[i, j];
        }
        for (int _i = 0; i < len; i++)
        {
            for (int j = 0; j < width; j++)
                right[_i, j] = data[i, j];
            _i++;
        }
        MergeSort(ref left, width);
        MergeSort(ref right, width);
        Merge(ref data, left, right, width);
    }
    private static void Merge(ref object[,] resultarr, object[,] arr1, object[,] arr2, int width)
    {
        int len1 = arr1.Length / width, len2 = arr2.Length / width;
        int index = 0, index1 = 0, index2 = 0;
        while (index1 < len1 && index2 < len2)
        {
            if ((int)arr1[index1, 0] < (int)arr2[index2, 0])
            {
                for (int j = 0; j < width; j++)
                    resultarr[index, j] = arr1[index1, j];
                index1++;
            }
            else
            {
                for (int j = 0; j < width; j++)
                    resultarr[index, j] = arr2[index2, j];
                index2++;
            }
            index++;
        }
        if (index1 != len1)
        {
            for (; index1 < len1; index1++)
            {
                for (int j = 0; j < width; j++)
                    resultarr[index, j] = arr1[index1, j];
                index++;
            }
        }
        else
        {
            for (; index2 < len2; index2++)
            {
                for (int j = 0; j < width; j++)
                    resultarr[index, j] = arr2[index2, j];
                index++;
            }
        }
    }
    public static int BinarySearch(object[,] data, int value, int datawidth)
    {
        int minindex = 0, maxindex = data.Length / datawidth - 1, midindex;
        while (minindex != maxindex)
        {
            midindex = (minindex + maxindex) / 2;
            if (value <= (int)data[midindex, 0])
                maxindex = midindex;
            else
                minindex = midindex + 1;
        }
        if (value != (int)data[minindex, 0])
            return -1;
        return minindex;
    }
    #endregion

    #region 可移植性强的方法
    /// <summary>
    /// 十六进制字符串转换为byte数组
    /// </summary>
    /// <param name="hexstring">十六进制字符串</param>
    /// <returns></returns>
    public static byte[] HexStringToBytes(string hexstring)
    {
        int strlen = hexstring.Length;
        if (strlen % 2 == 1)
            throw new Exception("字符串长度错误");
        else
        {
            byte[] bytes = new byte[strlen / 2];
            for (int i = 0; i < strlen / 2; i++)
                bytes[i] = (byte)(GetByte(hexstring[2 * i]) << 4 | GetByte(hexstring[2 * i + 1]));
            return bytes;
        }
    }
    /// <summary>
    /// byte数组转换为十六进制字符串
    /// </summary>
    /// <param name="bytes">要转换的byte数组</param>
    /// <param name="contain0x">指定是否包含十六进制符号“0x”</param>
    /// <returns></returns>
    public static string BytesToHexString(byte[] bytes, bool contain0x = false)
    {
        int bytenum = bytes.Length;
        char[] chararr;
        if (contain0x)
        {
            chararr = new char[bytenum * 4];
            for (int i = 0; i < bytenum; i++)
            {
                chararr[4 * i] = '0';
                chararr[4 * i + 1] = 'x';
                chararr[4 * i + 2] = GetHexChar(bytes[i] >> 4);
                chararr[4 * i + 3] = GetHexChar(bytes[i] % 16);
            }
        }
        else
        {
            chararr = new char[bytenum * 2];
            for (int i = 0; i < bytenum; i++)
            {
                chararr[2 * i] = GetHexChar(bytes[i] >> 4);
                chararr[2 * i + 1] = GetHexChar(bytes[i] % 16);
            }
        }
        return new string(chararr);
    }
    /// <summary>
    /// 调度当前线程休眠一定的时间（精度比Therad.Sleep()高多了，达到微秒量级，随不同机器而有所不同）
    /// </summary>
    /// <param name="sleepticks">休眠的时间（以tick（毫微秒）为单位，1 tick = 10^-7 seconds）</param>
    public static void Sleep(long sleepticks)
    {
        long duetime = -sleepticks; //转换为相对时间
        using (EventWaitHandle wh = new EventWaitHandle(false, EventResetMode.ManualReset))
        {
            using (SafeWaitHandle handle = CreateWaitableTimer(IntPtr.Zero, true, "timer_" + rand.Next(0, int.MaxValue)))
            {
                wh.SafeWaitHandle = handle;
                SetWaitableTimer(handle, ref duetime, 0, IntPtr.Zero, IntPtr.Zero, true);
                wh.WaitOne();
            }
        }
    }
    /// <summary>
    /// 判断一个字符串是否是整数
    /// </summary>
    /// <param name="s"></param>
    /// <param name="ignoreblank">指示是否忽略空字符串</param>
    /// <returns></returns>
    public static bool IsInterger(string s)
    {
        if (s.Length == 0)
            return false;
        for (int i = 0; i < s.Length; i++)
        {
            if (s[i] < '0' || s[i] > '9')
                return false;
        }
        return true;
    }
    /// <summary>
    /// 求元素在数组中的索引（使用Equals()函数比较）
    /// </summary>
    /// <param name="element"></param>
    /// <param name="array"></param>
    /// <returns>返回该元素在数组中的索引，如未在数组中找到该元素则返回-1</returns>
    public static int ElementIndexOfArray<T>(T element, T[] array)
    {
        int index = -1;
        for (int i = 0; i < array.Length; i++)
        {
            if (element.Equals(array[i]))
            {
                index = i;
                break;
            }
        }
        return index;
    }
    /// <summary>
    /// 求元素在列表中的索引（使用Equals()函数比较）
    /// </summary>
    /// <param name="element"></param>
    /// <param name="list"></param>
    /// <returns>返回该元素在列表中的索引值，如未在列表中找到该元素则返回-1</returns>
    public static int ElementIndexOfList<T>(T element, List<T> list)
    {
        int index = -1;
        for (int i = 0; i < list.Count; i++)
        {
            if (element.Equals(list[i]))
            {
                index = i;
                break;
            }
        }
        return index;
    }
    /// <summary>
    /// 创建随机字符串
    /// </summary>
    /// <param name="length">随机字符串长度</param>
    /// <param name="containuppercase">指定字符串中是否包含大写字母</param>
    /// <param name="containlowercase">指定字符串中是否包含小写字母</param>
    /// <param name="containnumber">指定字符串中是否包含数字</param>
    /// <param name="containsymbol">指定字符串中是否包含符号（暂时只含英文符号）</param>
    /// <returns></returns>
    public static string RandomString(int length, bool containuppercase = true, bool containlowercase = true, bool containnumber = true, bool containsymbol = false)
    {
        string charlist = "";
        if (containuppercase)
            charlist += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (containlowercase)
            charlist += "abcdefghijklmnopqrstuvwxyz";
        if (containnumber)
            charlist += "1234567890";
        if (containsymbol)
            charlist += ",./';[]\\`-=<>?:\"{}|~!@#$%^&*()_+";
        if (charlist.Length == 0)
            throw new Exception("参数未指定任何字符");
        string str = "";
        for (int i = 0; i < length; i++)
            str += charlist[rand.Next(0, charlist.Length)];
        return str;
    }
    #endregion

    #region 私有方法
    [DllImport("kernel32.dll")]
    private static extern SafeWaitHandle CreateWaitableTimer(IntPtr lpTimerAttributes, bool bManualReset, string lpTimerName);
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool SetWaitableTimer(SafeWaitHandle hTimer, [In] ref long pDueTime, int lPeriod, IntPtr pfnCompletionRoutine, IntPtr lpArgToCompletionRoutine, bool fResume);
    /// <summary>
    /// 获取数字对应的十六进制字符
    /// </summary>
    /// <param name="integer">一个在0～16之间的整数</param>
    /// <returns>返回char</returns>
    private static char GetHexChar(int integer)
    {
        if (integer < 0)
            throw new Exception("不正确的数字");
        else if (integer < 10)
            return (char)(integer + '0');
        else if (integer < 16)
            return (char)(integer + 'A' - 10);
        else
            throw new Exception("不正确的数字");
    }
    /// <summary>
    /// 获取十六进制字符对应的byte
    /// </summary>
    /// <param name="hexchar">一个十六进制字符，只能在数字0～9及大小写字母abcdef中取值</param>
    /// <returns>返回byte，其取值范围为0～16</returns>
    private static byte GetByte(char hexchar)
    {
        if (hexchar <= '9')
        {
            if (hexchar >= '0')
                return (byte)(hexchar - '0');
            else
                throw new Exception("错误的字符");
        }
        else if (hexchar >= 'a')
        {
            if (hexchar <= 'z')
                return (byte)(hexchar - 'a' + 10);
            else
                throw new Exception("错误的字符");
        }
        else if (hexchar < 'A')
            throw new Exception("错误的字符");
        else if (hexchar <= 'Z')
            return (byte)(hexchar - 'A' + 10);
        else
            throw new Exception("错误的字符");
        //这种判断顺序保证了字符没有错误时做判断次数的均值最小（效率最高）
    }
    /// <summary>
    /// 分隔字符串中的数字和符号
    /// </summary>
    /// <param name="s">要进行分隔的字符串</param>
    /// <param name="spacehandlemode">指定处理空格的方式，0：不处理、 1：合并、 2：删除</param>
    /// <param name="symbols">字符串中可能存在的符号，不在其中的字符（除数字外）将被忽略</param>
    /// <returns>返回string数组，其元素为分隔后的相间的数字或符号</returns>
    #endregion

}
