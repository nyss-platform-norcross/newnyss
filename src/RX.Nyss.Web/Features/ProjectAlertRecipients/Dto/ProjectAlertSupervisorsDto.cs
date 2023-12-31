﻿using RX.Nyss.Data.Concepts;

namespace RX.Nyss.Web.Features.ProjectAlertRecipients.Dto
{
    public class ProjectAlertSupervisorsDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int OrganizationId { get; set; }
        public Role Role { get; set; }
    }
}
