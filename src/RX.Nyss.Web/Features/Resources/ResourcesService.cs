﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Services.StringsResources;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data;
using RX.Nyss.Web.Configuration;
using RX.Nyss.Web.Features.Resources.Dto;
using static RX.Nyss.Common.Utils.DataContract.Result;

namespace RX.Nyss.Web.Features.Resources
{
    public interface IResourcesService
    {
        Task<Result<string>> SaveString(SaveStringRequestDto dto);
        Task<Result<string>> DeleteString(DeleteStringRequestDto dto);
        Task<Result<string>> SaveEmailString(SaveStringRequestDto dto);
        Task<Result<string>> DeleteEmailString(DeleteStringRequestDto dto);
        Task<Result<string>> SaveSmsString(SaveStringRequestDto dto);
        Task<Result<string>> DeleteSmsString(DeleteStringRequestDto dto);
        Task<Result<GetStringResponseDto>> GetString(string key);
        Task<Result<GetStringResponseDto>> GetEmailString(string key);
        Task<Result<GetStringResponseDto>> GetSmsString(string key);
        Task<Result<ListTranslationsResponseDto>> ListStringsTranslations(bool needsImprovementOnly);
        Task<Result<ListTranslationsResponseDto>> ListEmailTranslations(bool needsImprovementOnly);
        Task<Result<ListTranslationsResponseDto>> ListSmsTranslations(bool needsImprovementOnly);
    }

    public class ResourcesService : IResourcesService
    {
        private readonly IStringsResourcesService _stringsResourcesService;
        private readonly INyssContext _nyssContext;
        private readonly INyssWebConfig _config;

        public ResourcesService(
            IStringsResourcesService stringsResourcesService,
            INyssContext nyssContext,
            INyssWebConfig config)
        {
            _stringsResourcesService = stringsResourcesService;
            _nyssContext = nyssContext;
            _config = config;
        }

        public async Task<Result<GetStringResponseDto>> GetString(string key)
        {
            if (_config.IsProduction)
            {
                return Error<GetStringResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetStringsBlob();
            var entry = stringsBlob.Strings.FirstOrDefault(x => x.Key == key);

            var contentLanguages = await _nyssContext.ContentLanguages.ToListAsync();

            var dto = new GetStringResponseDto
            {
                Key = key,
                NeedsImprovement = entry == null || entry.NeedsImprovement,
                Translations = contentLanguages.Select(cl =>
                {
                    var languageCode = cl.LanguageCode.ToLower();

                    return new GetStringResponseDto.GetEntryDto
                    {
                        LanguageCode = languageCode,
                        Name = cl.DisplayName,
                        Value = entry?.Translations?.ContainsKey(languageCode) == true
                            ? entry.Translations[languageCode]
                            : ""
                    };
                }).ToList()
            };

            return Success(dto);
        }

        public async Task<Result<GetStringResponseDto>> GetEmailString(string key)
        {
            if (_config.IsProduction)
            {
                return Error<GetStringResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetEmailContentBlob();
            var entry = stringsBlob.Strings.FirstOrDefault(x => x.Key == key);

            var contentLanguages = await _nyssContext.ContentLanguages.ToListAsync();

            var dto = new GetStringResponseDto
            {
                Key = key,
                NeedsImprovement = entry == null || entry.NeedsImprovement,
                Translations = contentLanguages.Select(cl =>
                {
                    var languageCode = cl.LanguageCode.ToLower();

                    return new GetStringResponseDto.GetEntryDto
                    {
                        LanguageCode = languageCode,
                        Name = cl.DisplayName,
                        Value = entry?.Translations?.ContainsKey(languageCode) == true
                            ? entry.Translations[languageCode]
                            : ""
                    };
                }).ToList()
            };

            return Success(dto);
        }

        public async Task<Result<GetStringResponseDto>> GetSmsString(string key)
        {
            if (_config.IsProduction)
            {
                return Error<GetStringResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetSmsContentBlob();
            var entry = stringsBlob.Strings.FirstOrDefault(x => x.Key == key);

            var contentLanguages = await _nyssContext.ContentLanguages.ToListAsync();

            var dto = new GetStringResponseDto
            {
                Key = key,
                NeedsImprovement = entry == null || entry.NeedsImprovement,
                Translations = contentLanguages.Select(cl =>
                {
                    var languageCode = cl.LanguageCode.ToLower();

                    return new GetStringResponseDto.GetEntryDto
                    {
                        LanguageCode = languageCode,
                        Name = cl.DisplayName,
                        Value = entry?.Translations?.ContainsKey(languageCode) == true
                            ? entry.Translations[languageCode]
                            : ""
                    };
                }).ToList()
            };

            return Success(dto);
        }

        public async Task<Result<string>> SaveString(SaveStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetStringsBlob();
            var strings = stringsBlob.Strings.ToList();
            var entry = strings.FirstOrDefault(x => x.Key == dto.Key) ?? CreateEntry(strings, dto.Key);
            entry.NeedsImprovement = dto.NeedsImprovement;

            foreach (var dtoTranslation in dto.Translations)
            {
                var languageCode = dtoTranslation.LanguageCode.ToLower();

                if (entry.Translations.ContainsKey(languageCode))
                {
                    entry.Translations[languageCode] = dtoTranslation.Value;
                }
                else
                {
                    entry.Translations.Add(languageCode, dtoTranslation.Value);
                }
            }

            await _stringsResourcesService.SaveStringsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }

        public async Task<Result<string>> DeleteString(DeleteStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetStringsBlob();
            var strings = stringsBlob.Strings.Where(x => x.Key != dto.Key);

            await _stringsResourcesService.SaveStringsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }

        public async Task<Result<string>> SaveEmailString(SaveStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetEmailContentBlob();
            var strings = stringsBlob.Strings.ToList();
            var entry = strings.FirstOrDefault(x => x.Key == dto.Key) ?? CreateEntry(strings, dto.Key);
            entry.NeedsImprovement = dto.NeedsImprovement;

            foreach (var dtoTranslation in dto.Translations)
            {
                var languageCode = dtoTranslation.LanguageCode.ToLower();

                if (entry.Translations.ContainsKey(languageCode))
                {
                    entry.Translations[languageCode] = dtoTranslation.Value;
                }
                else
                {
                    entry.Translations.Add(languageCode, dtoTranslation.Value);
                }
            }

            await _stringsResourcesService.SaveEmailContentsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }

        public async Task<Result<string>> DeleteEmailString(DeleteStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetEmailContentBlob();
            var strings = stringsBlob.Strings.Where(x => x.Key != dto.Key);

            await _stringsResourcesService.SaveEmailContentsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }

        public async Task<Result<string>> SaveSmsString(SaveStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetSmsContentBlob();
            var strings = stringsBlob.Strings.ToList();
            var entry = strings.FirstOrDefault(x => x.Key == dto.Key) ?? CreateEntry(strings, dto.Key);
            entry.NeedsImprovement = dto.NeedsImprovement;

            foreach (var dtoTranslation in dto.Translations)
            {
                var languageCode = dtoTranslation.LanguageCode.ToLower();

                if (entry.Translations.ContainsKey(languageCode))
                {
                    entry.Translations[languageCode] = dtoTranslation.Value;
                }
                else
                {
                    entry.Translations.Add(languageCode, dtoTranslation.Value);
                }
            }

            await _stringsResourcesService.SaveSmsContentsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }
        public async Task<Result<string>> DeleteSmsString(DeleteStringRequestDto dto)
        {
            if (_config.IsProduction)
            {
                return Error<string>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetSmsContentBlob();
            var strings = stringsBlob.Strings.Where(x => x.Key != dto.Key);

            await _stringsResourcesService.SaveSmsContentsBlob(new StringsBlob { Strings = strings.OrderBy(x => x.Key) });

            return Success("Success");
        }

        public async Task<Result<ListTranslationsResponseDto>> ListStringsTranslations(bool needsImprovementOnly)
        {
            if (_config.IsProduction)
            {
                return Error<ListTranslationsResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetStringsBlob();
            var translations = stringsBlob.Strings.ToList();

            var languages = await _nyssContext.ContentLanguages
                .Select(cl => new ListTranslationsResponseDto.LanguageResponseDto
                {
                    DisplayName = cl.DisplayName,
                    LanguageCode = cl.LanguageCode
                })
                .ToListAsync();

            var dto = new ListTranslationsResponseDto
            {
                Languages = languages,
                Translations = translations
                    .Where(t => !needsImprovementOnly || t.NeedsImprovement)
                    .Select(t => new ListTranslationsResponseDto.TranslationsResponseDto
                    {
                        Key = t.Key,
                        NeedsImprovement = t.NeedsImprovement,
                        Translations = t.Translations
                    })
                    .ToList()
            };

            return Success(dto);
        }

        public async Task<Result<ListTranslationsResponseDto>> ListEmailTranslations(bool needsImprovementOnly)
        {
            if (_config.IsProduction)
            {
                return Error<ListTranslationsResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetEmailContentBlob();
            var translations = stringsBlob.Strings.ToList();

            var languages = await _nyssContext.ContentLanguages
                .Select(cl => new ListTranslationsResponseDto.LanguageResponseDto
                {
                    DisplayName = cl.DisplayName,
                    LanguageCode = cl.LanguageCode
                })
                .ToListAsync();

            var dto = new ListTranslationsResponseDto
            {
                Languages = languages,
                Translations = translations
                    .Where(t => !needsImprovementOnly || t.NeedsImprovement)
                    .Select(t => new ListTranslationsResponseDto.TranslationsResponseDto
                    {
                        Key = t.Key,
                        NeedsImprovement = t.NeedsImprovement,
                        Translations = t.Translations
                    })
                    .ToList()
            };

            return Success(dto);
        }

        public async Task<Result<ListTranslationsResponseDto>> ListSmsTranslations(bool needsImprovementOnly)
        {
            if (_config.IsProduction)
            {
                return Error<ListTranslationsResponseDto>(ResultKey.UnexpectedError);
            }

            var stringsBlob = await _stringsResourcesService.GetSmsContentBlob();
            var translations = stringsBlob.Strings.ToList();

            var languages = await _nyssContext.ContentLanguages
                .Select(cl => new ListTranslationsResponseDto.LanguageResponseDto
                {
                    DisplayName = cl.DisplayName,
                    LanguageCode = cl.LanguageCode
                })
                .ToListAsync();

            var dto = new ListTranslationsResponseDto
            {
                Languages = languages,
                Translations = translations
                    .Where(t => !needsImprovementOnly || t.NeedsImprovement)
                    .Select(t => new ListTranslationsResponseDto.TranslationsResponseDto
                    {
                        Key = t.Key,
                        NeedsImprovement = t.NeedsImprovement,
                        Translations = t.Translations
                    })
                    .ToList()
            };

            return Success(dto);
        }

        private static StringsBlob.Entry CreateEntry(ICollection<StringsBlob.Entry> strings, string key)
        {
            var entry = new StringsBlob.Entry
            {
                Key = key,
                Translations = new Dictionary<string, string>()
            };

            strings.Add(entry);
            return entry;
        }
    }
}
