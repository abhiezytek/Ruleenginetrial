using Microsoft.EntityFrameworkCore;
using InsuranceSTP.Data;
using InsuranceSTP.Models;

namespace InsuranceSTP.Services;

public class RequirementMstService : IRequirementMstService
{
    private readonly AppDbContext _context;

    public RequirementMstService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<RequirementMstResponse>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? category = null,
        bool? isActive = null)
    {
        var query = _context.RequirementMsts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(r =>
                r.Code.ToLower().Contains(q) ||
                r.Name.ToLower().Contains(q) ||
                (r.Description != null && r.Description.ToLower().Contains(q)));
        }

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(r => r.Category == category);

        if (isActive.HasValue)
            query = query.Where(r => r.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(r => r.SortOrder)
            .ThenBy(r => r.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RequirementMstResponse
            {
                Id = r.Id,
                Code = r.Code,
                Name = r.Name,
                Description = r.Description,
                Category = r.Category,
                IsActive = r.IsActive,
                SortOrder = r.SortOrder,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return new PagedResult<RequirementMstResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
