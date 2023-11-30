﻿using System.Collections.Generic;

namespace RX.Nyss.Web.Features.Projects.Dto
{
    public class ProjectFormDataResponseDto
    {
        public IEnumerable<ProjectHealthRiskResponseDto> HealthRisks { get; set; }
        public IEnumerable<ProjectFormOrganization> Organizations { get; set; }
        public IEnumerable<AlertNotHandledRecipientDto> AlertNotHandledRecipients { get; set; }

        public class ProjectFormOrganization
        {
            public int Id { get; set; }

            public string Name { get; set; }
        }

        public class AlertNotHandledRecipientDto
        {
            public int Id { get; set; }
            public string Name { get; set; }

            public int? OrganizationId { get; set; }
        }
    }
}
