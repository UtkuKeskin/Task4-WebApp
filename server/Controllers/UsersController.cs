using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;
using System.Security.Claims;

namespace server.Controllers;

[Route("api/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserService _userService;
    private readonly AuthService _authService;

    public UsersController(AppDbContext context, UserService userService, AuthService authService)
    {
        _context = context;
        _userService = userService;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _userService.Register(request.Name, request.Email, request.Password);
            var token = _authService.GenerateToken(user);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            if (ex.InnerException?.Message.Contains("unique constraint") ?? false)
            {
                return BadRequest(new { Message = "Email already exists." });
            }

            Console.WriteLine("⚠️ Register Error:");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine($"InnerException: {ex.InnerException?.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");

            return StatusCode(500, new
            {
                Message = ex.Message,
                Inner = ex.InnerException?.Message,
                StackTrace = ex.StackTrace
            });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"Login attempt for email: {request.Email}");
        try
        {
            var user = await _authService.LoginAsync(request.Email, request.Password);
            var token = _authService.GenerateToken(user);
            Console.WriteLine($"Login successful for email: {request.Email}");
            return Ok(new { Token = token });
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"UnauthorizedAccessException: {ex.Message}");
            return Unauthorized(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in Login: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetUsers()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"UserIdClaim: {userIdClaim}");
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { Message = "Invalid user authentication." });
        }

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized(new { Message = "Invalid user ID in token." });
        }
        
        var users = await _userService.GetUsers();
        return Ok(users);
    }

    [HttpPost("block")]
    [Authorize]
    public async Task<IActionResult> BlockUsers([FromBody] List<int> userIds)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { Message = "Invalid user authentication." });
        }

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized(new { Message = "Invalid user ID in token." });
        }

        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId && !u.IsDeleted);
        if (currentUser == null || currentUser.Status == UserStatus.Blocked)
        {
            return Unauthorized(new { Message = "Account is blocked or deleted. Please log in again." });
        }

        await _userService.BlockUsers(userIds);
        return Ok(new { Message = "Users blocked successfully." });
    }

    [HttpPost("unblock")]
    [Authorize]
    public async Task<IActionResult> UnblockUsers([FromBody] List<int> userIds)
    {
        Console.WriteLine("UnblockUsers - Method Entered");
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"UnblockUsers - UserIdClaim: {userIdClaim}");
        if (string.IsNullOrEmpty(userIdClaim))
        {
            Console.WriteLine("UnblockUsers - Unauthorized: Invalid user authentication.");
            return Unauthorized(new { Message = "Invalid user authentication." });
        }

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            Console.WriteLine("UnblockUsers - Unauthorized: Invalid user ID in token.");
            return Unauthorized(new { Message = "Invalid user ID in token." });
        }

        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId && !u.IsDeleted);
        Console.WriteLine($"UnblockUsers - CurrentUser: {currentUser?.Id}, Status: {currentUser?.Status}");
        if (currentUser == null || currentUser.Status == UserStatus.Blocked)
        {
            Console.WriteLine("UnblockUsers - Unauthorized: Account is blocked or deleted.");
            return Unauthorized(new { Message = "Account is blocked or deleted. Please log in again." });
        }

        await _userService.UnblockUsers(userIds);
        return Ok(new { Message = "Users unblocked successfully." });
    }

    [HttpDelete("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteUsers([FromBody] List<int> userIds)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { Message = "Invalid user authentication." });
        }

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized(new { Message = "Invalid user ID in token." });
        }

        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId && !u.IsDeleted);
        if (currentUser == null || currentUser.Status == UserStatus.Blocked)
        {
            return Unauthorized(new { Message = "Account is blocked or deleted. Please log in again." });
        }

        await _userService.DeleteUsers(userIds);
        return Ok(new { Message = "Users deleted successfully." });
    }
}

public class RegisterRequest
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}