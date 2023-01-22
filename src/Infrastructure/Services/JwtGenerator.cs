using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using Microsoft.IdentityModel.Tokens;

namespace IrcMonitor.Infrastructure.Services;
internal class JwtGenerator : IJwtGenerator
{

    private readonly AuthenticationSettings _authenticationSettings;
    public JwtGenerator(AuthenticationSettings authenticationSettings)
    {
        _authenticationSettings = authenticationSettings;
    }

    string IJwtGenerator.CreateUserAuthToken(string userId)
    {
        var privateRSA = RSA.Create();
        privateRSA.ImportRSAPrivateKey(Convert.FromBase64String(_authenticationSettings.JwtPrivateSigningKey), out _);

        var key = new RsaSecurityKey(privateRSA);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Audience = "IrcMonitor",
            Issuer = "IrcMonitor",
            Subject = new ClaimsIdentity(new Claim[]
            {
                            new Claim(ClaimTypes.Sid, userId.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(60),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
