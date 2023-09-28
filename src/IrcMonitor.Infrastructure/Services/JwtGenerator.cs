using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Azure.Security.KeyVault.Keys;
using Azure.Security.KeyVault.Keys.Cryptography;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Common.Utils;
using IrcMonitor.Domain.Models;
using IrcMonitor.Infrastructure.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace IrcMonitor.Infrastructure.Services;
internal class JwtGenerator : IJwtGenerator
{

    private readonly AuthenticationSettings _authenticationSettings;
    private readonly IApplicationDbContext _context;
    private readonly KeyClient _client;


    private const bool UseLocal = false;

    public JwtGenerator(AuthenticationSettings authenticationSettings, IApplicationDbContext context, KeyClient client)
    {
        _authenticationSettings = authenticationSettings;
        _context = context;
        _client = client;
    }

    public async Task<CreateUserAuthTokenReturnModel> CreateUserAuthToken(string userId)
    {

        var userInDb = await _context.Users.Include(x => x.Roles).FirstOrDefaultAsync(x => x.Email == userId);
        var isAdmin = userInDb?.Roles.Any(r => r.Role == RoleConstants.Admin) ?? false;
        var isViewer = userInDb?.Roles.Any(r => r.Role == RoleConstants.Viewer) ?? false;

        var roles = new List<string>();
        var tokenHandler = new JwtSecurityTokenHandler();
        var identity = new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Sid, userId.ToString())
        });

        if (isAdmin)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, RoleConstants.Admin));
            roles.Add(RoleConstants.Admin);
        }

        if (isViewer)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, RoleConstants.Viewer));
            roles.Add(RoleConstants.Viewer);
        }

        var readableChannels = userInDb?.Roles.Where(x => x.Role == RoleConstants.Viewer && x.ChannelId != null).Select(d => d.ChannelId).ToList();

        if (readableChannels != null && readableChannels.Any())
        {
            identity.AddClaims(readableChannels.Where(x => x.HasValue).Select(x => new Claim(CustomClaims.ChannelViewer, x.ToString() ?? "")));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Audience = _authenticationSettings.PageUrl,
            Issuer = _authenticationSettings.GetIssuer,
            Subject = identity,
            Expires = DateTime.UtcNow.AddMinutes(60),
        };

        var accessToken = _authenticationSettings.UseKeyFromKeyVault ? await FormTokenFromKeyVault(tokenDescriptor) : FormFromLocalKey(tokenDescriptor);


        return new CreateUserAuthTokenReturnModel
        {
            AccessToken = accessToken,
            Roles = roles
        };
    }



    private async Task<string> FormTokenFromKeyVault(SecurityTokenDescriptor tokenDescriptor)
    {
        var cryptoClient = _client.GetCryptographyClient(_authenticationSettings.KeyVault.KeyName);
        var tokenHandler = new JwtSecurityTokenHandler();
        var unsignedToken = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);
        var header = new
        {
            alg = "RS256",
            typ = "JWT"
        };
        var encodedHeader = Base64UrlEncoder.Encode(Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(header)));
        // Convert the payload to Base64Url format
        var encodedPayload = Base64UrlEncoder.Encode(Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(unsignedToken.Payload)));
        // Construct the JWT payload (header + payload)
        var jwtPayload = $"{encodedHeader}.{encodedPayload}";
        // Generate the hash to sign
        var bytesToSign = Encoding.ASCII.GetBytes(jwtPayload);
        var hashToSign = SHA256.HashData(bytesToSign);

        // Use Azure Key Vault to sign the hash
        var signature = await cryptoClient.SignAsync(SignatureAlgorithm.RS256, hashToSign);
        var rawSignature = Base64UrlEncoder.Encode(signature.Signature);

        return $"{jwtPayload}.{rawSignature}";
    }


    private string FormFromLocalKey(SecurityTokenDescriptor tokenDescriptor)
    {
        var rsaParameters = TokenUtils.ConvertPemToRSAPrivateParameters(_authenticationSettings.JwtPrivateSigningKey);
        var privateRSA = RSA.Create();
        var tokenHandler = new JwtSecurityTokenHandler();
        privateRSA.ImportParameters(rsaParameters);
        tokenDescriptor.SigningCredentials = new SigningCredentials(new RsaSecurityKey(privateRSA), SecurityAlgorithms.RsaSha256);
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
