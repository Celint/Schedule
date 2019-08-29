using System;
using System.Configuration;


/// <summary>
/// 用于处理自定义配置的类
/// </summary>
public class Config : ConfigurationSection
{
    [ConfigurationProperty("dutyTimes", IsDefaultCollection = false)]
    public DutyTimeCollection DutyTimes
    {
        get { return (DutyTimeCollection)base["dutyTimes"]; }
    }
    [ConfigurationProperty("departments", IsDefaultCollection = false)]
    public DepartmentCollection Departments
    {
        get { return (DepartmentCollection)base["departments"]; }
    }
}

public class DutyTimeCollection : ConfigurationElementCollection
{
    protected override ConfigurationElement CreateNewElement()
    {
        return new DutyTime();
    }
    protected override object GetElementKey(ConfigurationElement element)
    {
        return ((DutyTime)element).Sequence;
    }
    [ConfigurationProperty("graceTime", IsRequired = true)]
    public TimeSpan GraceTime
    {
        get { return TimeSpan.Parse(base["graceTime"].ToString()); }
        set { base["graceTime"] = value; }
    }
    [ConfigurationProperty("aheadTime", IsRequired = true)]
    public TimeSpan AheadTime
    {
        get { return TimeSpan.Parse(base["aheadTime"].ToString()); }
        set { base["aheadTime"] = value; }
    }
    public DutyTime this[int i]
    {
        get { return (DutyTime)BaseGet(i); }
    }
    public new DutyTime this[string key]
    {
        get { return (DutyTime)BaseGet(key); }
    }
}
public class DepartmentCollection : ConfigurationElementCollection
{
    protected override ConfigurationElement CreateNewElement()
    {
        return new Department();
    }
    protected override object GetElementKey(ConfigurationElement element)
    {
        return ((Department)element).Name;
    }
    public Department this[int i]
    {
        get { return (Department)BaseGet(i); }
    }
    public new Department this[string key]
    {
        get { return (Department)BaseGet(key); }
    }
}

public class DutyTime : ConfigurationElement
{

    [ConfigurationProperty("seq", IsKey = true, IsRequired = true)]
    public string Sequence
    {
        get { return (string)base["seq"]; }
    }
    [ConfigurationProperty("startTime", IsRequired = true)]
    public TimeSpan StartTime
    {
        get { return TimeSpan.Parse(base["startTime"].ToString()); }
        set { base["startTime"] = value; }
    }
    [ConfigurationProperty("endTime", IsRequired = true)]
    public TimeSpan EndTime
    {
        get { return TimeSpan.Parse(base["endTime"].ToString()); }
        set { base["endTime"] = value; }
    }

}
public class Department : ConfigurationElement
{

    [ConfigurationProperty("name", IsKey = true, IsRequired = true)]
    public string Name
    {
        get { return (string)base["name"]; }
        set { base["name"] = value; }
    }
    [ConfigurationProperty("shortName", IsRequired = true)]
    public string ShorName
    {
        get { return (string)base["shortName"]; }
        set { base["shortName"] = value; }
    }

}
