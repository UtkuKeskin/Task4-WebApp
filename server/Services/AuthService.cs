using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using server.Data;
using server.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace server.Services;

public class AuthService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    public AuthService(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public string GenerateToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException("JWT Key is not configured in appsettings.json.");
        }

        var issuer = _configuration["Jwt:Issuer"];
        if (string.IsNullOrEmpty(issuer))
        {
            throw new InvalidOperationException("JWT Issuer is not configured in appsettings.json.");
        }

        var audience = _configuration["Jwt:Audience"];
        if (string.IsNullOrEmpty(audience))
        {
            throw new InvalidOperationException("JWT Audience is not configured in appsettings.json.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User?> ValidateUser(string email, string passwordHash)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == passwordHash && !u.IsDeleted);
        if (user == null || user.Status == UserStatus.Blocked)
        {
            return null;
        }
        return user;
    }

    public async Task<User> LoginAsync(string email, string password)
    {
        Console.WriteLine($"Login attempt for email: {email}");
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);

        if (user == null)
        {
            Console.WriteLine("User not found or deleted.");
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (user.Status == UserStatus.Blocked)
        {
            Console.WriteLine($"User status is Blocked: {user.Status}");
            throw new UnauthorizedAccessException("Invalid email or password, or user is blocked.");
        }

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            Console.WriteLine("Password mismatch.");
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        user.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        Console.WriteLine("Login successful.");

        return user;
    }
}