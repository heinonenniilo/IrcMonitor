using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using IrcMonitor.Infrastructure.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace IrcMonitor.Infrastructure.Services;
internal class JwtGenerator : IJwtGenerator
{

    private readonly AuthenticationSettings _authenticationSettings;
    private readonly IApplicationDbContext _context;
    public JwtGenerator(AuthenticationSettings authenticationSettings, IApplicationDbContext context)
    {
        _authenticationSettings = authenticationSettings;
        _context = context;
    }

    string IJwtGenerator.CreateUserAuthToken(string userId)
    {
        var privateRSA = RSA.Create();
        privateRSA.ImportRSAPrivateKey(Convert.FromBase64String(_authenticationSettings.JwtPrivateSigningKey), out _);


        var userInDb = _context.Users.Include(x => x.Roles).FirstOrDefault(x => x.Email == userId);

        var isAdmin = userInDb?.Roles.Any(r => r.Role == RoleConstants.Admin) ?? false;
        var isViewer = userInDb?.Roles.Any(r => r.Role == RoleConstants.Viewer) ?? false;

        var key = new RsaSecurityKey(privateRSA);
        var tokenHandler = new JwtSecurityTokenHandler();

        var identity = new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Sid, userId.ToString())
        });

        if (isAdmin)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, RoleConstants.Admin));
        }

        if (isViewer)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, RoleConstants.Viewer));
        }

        var readableChannels = userInDb?.Roles.Where(x => x.Role == RoleConstants.Viewer && x.ChannelId != null).Select(d => d.ChannelId).ToList();

        if (readableChannels != null && readableChannels.Any())
        {
            identity.AddClaims(readableChannels.Where(x => x.HasValue).Select(x => new Claim(CustomClaims.ChannelViewer, x.ToString())));
        }
      
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Audience = "IrcMonitor",
            Issuer = "IrcMonitor",
            Subject = identity,
            Expires = DateTime.UtcNow.AddMinutes(60),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
