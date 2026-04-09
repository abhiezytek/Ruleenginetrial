using InsuranceSTP.Models;

namespace InsuranceSTP.Services;

public interface IRequirementMstService
{
    Task<PagedResult<RequirementMstResponse>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? category = null,
        bool? isActive = null);
}
