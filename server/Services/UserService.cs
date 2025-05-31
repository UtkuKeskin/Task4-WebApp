using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> Register(string name, string email, string password)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.IsDeleted);

        if (existingUser != null)
        {
            existingUser.Name = name;
            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            existingUser.CreatedAt = DateTime.UtcNow;
            existingUser.Status = UserStatus.Active;
            existingUser.IsDeleted = false;
            existingUser.LastLogin = DateTime.UtcNow; 
            await _context.SaveChangesAsync();
            return existingUser;
        }

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
            LastLogin = DateTime.UtcNow,
            Status = UserStatus.Active,
            IsDeleted = false
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> Login(string email, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        
        if (user == null || user.Status == UserStatus.Blocked || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        user.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<List<UserDTO>> GetUsers()
    {
        return await _context.Users
            .Where(u => !u.IsDeleted)
            .OrderByDescending(u => u.LastLogin)
            .Select(u => new UserDTO
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Status = u.Status,
                LastLogin = u.LastLogin,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    public async Task BlockUsers(List<int> userIds)
    {
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();

        if (users.Count == 0) return;

        foreach (var user in users)
        {
            user.Status = UserStatus.Blocked;
        }

        await _context.SaveChangesAsync();
    }

    public async Task UnblockUsers(List<int> userIds)
    {
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();

        if (users.Count == 0) return;

        foreach (var user in users)
        {
            user.Status = UserStatus.Active;
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteUsers(List<int> userIds)
    {
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();

        if (users.Count == 0) return;

        foreach (var user in users)
        {
            user.IsDeleted = true;
        }

        await _context.SaveChangesAsync();
    }
}