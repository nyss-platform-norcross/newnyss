﻿using FluentValidation;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Web.Features.Organizations;
using RX.Nyss.Web.Services;

namespace RX.Nyss.Web.Features.Managers.Dto
{
    public class CreateManagerRequestDto
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string AdditionalPhoneNumber { get; set; }
        public string Organization { get; set; }
        public bool? SetAsHeadManager { get; set; }
        public int? OrganizationId { get; set; }
        public int NationalSocietyId { get; set; }

        public class CreateManagerValidator : AbstractValidator<CreateManagerRequestDto>
        {
            public CreateManagerValidator(IOrganizationService organizationService)
            {
                RuleFor(m => m.Name).NotEmpty().MaximumLength(100);
                RuleFor(m => m.Email).NotEmpty().MaximumLength(100).EmailAddress();
                RuleFor(m => m.PhoneNumber).NotEmpty().MaximumLength(20).PhoneNumber();
                RuleFor(m => m.AdditionalPhoneNumber).MaximumLength(20).PhoneNumber().Unless(r => string.IsNullOrEmpty(r.AdditionalPhoneNumber));
                RuleFor(m => m.Organization).MaximumLength(100);
                RuleFor(m => m.OrganizationId)
                    .MustAsync((model, _, t) => organizationService.ValidateAccessForAssigningOrganization(model.NationalSocietyId))
                    .When(model => model.OrganizationId.HasValue)
                    .WithMessage(ResultKey.Organization.NotAccessToChangeOrganization);
            }
        }
    }
}
