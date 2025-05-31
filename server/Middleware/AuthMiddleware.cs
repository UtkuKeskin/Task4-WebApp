using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Threading.Tasks;
using System.Security.Claims;

namespace server.Middleware;

public class AuthMiddleware
{
    private readonly RequestDelegate _next;

    public AuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        if (context.Request.Path.StartsWithSegments("/api/users/register") || 
            context.Request.Path.StartsWithSegments("/api/users/login"))
        {
            await _next(context);
            return;
        }
        if (context.Request.Method == "GET")
        {
            await _next(context);
            return;
        }

        var user = await GetCurrentUser(context, dbContext);
        if (user == null || user.IsDeleted || user.Status == UserStatus.Blocked)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("{\"message\": \"Account is blocked or deleted. Please log in again.\"}");
            return;
        }

        await _next(context);
    }

    private async Task<User?> GetCurrentUser(HttpContext context, AppDbContext dbContext)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return null;
        return await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == int.Parse(userId) && !u.IsDeleted);
    }
}

public static class AuthMiddlewareExtensions
{
    public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AuthMiddleware>();
    }
}