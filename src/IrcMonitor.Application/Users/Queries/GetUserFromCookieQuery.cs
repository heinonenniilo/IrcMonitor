using System.Security.Cryptography;
using System.Text.Json;
using MediatR;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Users.Commands;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Users.Queries;
public class GetUserFromCookieQuery : IRequest<UserVm>
{
}

public class GetUserFromCookieQueryHandler : IRequestHandler<GetUserFromCookieQuery, UserVm>
{
    private readonly IEncryptionService _encryptionService;
    private readonly ICookieService _cookieService;
    private readonly AuthenticationSettings _authSettings;

    public GetUserFromCookieQueryHandler(IEncryptionService encryptionService, ICookieService cookieService, AuthenticationSettings authSettings)
    {
        _encryptionService = encryptionService;
        _cookieService = cookieService;
        _authSettings = authSettings;
    }

    public async Task<UserVm> Handle(GetUserFromCookieQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var encryptedUser = await _cookieService.GetCookie(_authSettings.GoogleAuth.UserCookieKey);
            var json = await _encryptionService.Decrypt(encryptedUser, cancellationToken);
            return JsonSerializer.Deserialize<UserVm>(json);
        }
        catch (Exception ex) when (ex is InvalidOperationException or FormatException or ArgumentException or CryptographicException or JsonException)
        {
            return null;
        }
    }
}
