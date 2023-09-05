using System.Security.Cryptography;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;

namespace IrcMonitor.Application.Common.Utils;
public static class TokenUtils
{
    public static RSAParameters ConvertPemToRSAPrivateParameters(string pemData)
    {
        var trimmed = pemData.Trim();
        var textReader = new StringReader(trimmed);
        var pemReader = new PemReader(textReader);
        var privateKey = (RsaPrivateCrtKeyParameters)pemReader.ReadObject();
        var rsaParameters = DotNetUtilities.ToRSAParameters(privateKey);
        return rsaParameters;
    }

    public static RSAParameters ConvertPemToRSAPublicParameters(string pemData)
    {
        TextReader textReader = new StringReader(pemData);
        PemReader pemReader = new PemReader(textReader);
        RsaKeyParameters publicKey = (RsaKeyParameters)pemReader.ReadObject();
        if (publicKey == null)
        {
            throw new ArgumentException("Provided data is not a valid PEM-formatted RSA public key.");
        }

        RSAParameters rsaParameters = new RSAParameters
        {
            Modulus = publicKey.Modulus.ToByteArrayUnsigned(),
            Exponent = publicKey.Exponent.ToByteArrayUnsigned()
        };

        return rsaParameters;
    }
}

