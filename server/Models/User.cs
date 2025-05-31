namespace server.Models;

public enum UserStatus
{
    Active = 0,
    Blocked = 1
}

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; } 
    public required string PasswordHash { get; set; } 
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}