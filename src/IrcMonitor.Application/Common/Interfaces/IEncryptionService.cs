namespace IrcMonitor.Application.Common.Interfaces;
public interface IEncryptionService
{
    Task<string> Encrypt(string plainText, CancellationToken cancellationToken = default);
    Task<string> Decrypt(string cipherText, CancellationToken cancellationToken = default);
}
