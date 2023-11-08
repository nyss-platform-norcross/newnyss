using System.Collections.Generic;
using RX.Nyss.Data.Models;

namespace RX.Nyss.Web.Features.ProjectAlertNotHandledRecipients.Dto
{
    public class ProjectAlertNotHandledRecipientsResponseDto
    {
        public List<RecipientDto> Users { get; set; }
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; }
    }
}
