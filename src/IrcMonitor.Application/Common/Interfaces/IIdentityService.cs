﻿namespace IrcMonitor.Application.Common.Interfaces;

public interface IIdentityService
{
    bool IsAdmin { get; }
    bool HasAccessToChannel(int channelId);

    bool HasRole(string role);

    List<string> GetAccessibleChannels();
}
