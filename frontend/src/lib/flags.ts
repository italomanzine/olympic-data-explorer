/**
 * Utilitário para bandeiras de países usando flagcdn.com
 * 
 * Este módulo fornece funções para obter URLs de bandeiras
 * baseadas nos códigos NOC (National Olympic Committee)
 */

// Mapeamento de NOC para código ISO 3166-1 alpha-2 (usado pelo flagcdn)
// Alguns códigos NOC diferem do padrão ISO
const NOC_TO_ISO: Record<string, string> = {
  // Códigos que precisam de mapeamento especial
  "GBR": "gb",  // Great Britain
  "GER": "de",  // Germany (Deutschland)
  "SUI": "ch",  // Switzerland (Suisse)
  "NED": "nl",  // Netherlands
  "RSA": "za",  // South Africa
  "TPE": "tw",  // Chinese Taipei (Taiwan)
  "KOR": "kr",  // South Korea
  "PRK": "kp",  // North Korea
  "CHN": "cn",  // China
  "HKG": "hk",  // Hong Kong
  "IRI": "ir",  // Iran
  "UAE": "ae",  // United Arab Emirates
  "KSA": "sa",  // Saudi Arabia
  "VIE": "vn",  // Vietnam
  "SIN": "sg",  // Singapore
  "MAS": "my",  // Malaysia
  "INA": "id",  // Indonesia
  "PHI": "ph",  // Philippines
  "THA": "th",  // Thailand
  "MYA": "mm",  // Myanmar
  "LAO": "la",  // Laos
  "CAM": "kh",  // Cambodia
  "BRU": "bn",  // Brunei
  "TLS": "tl",  // Timor-Leste
  "NGR": "ng",  // Nigeria
  "ALG": "dz",  // Algeria
  "MAR": "ma",  // Morocco
  "TUN": "tn",  // Tunisia
  "EGY": "eg",  // Egypt
  "LBA": "ly",  // Libya
  "SUD": "sd",  // Sudan
  "ETH": "et",  // Ethiopia
  "KEN": "ke",  // Kenya
  "TAN": "tz",  // Tanzania
  "UGA": "ug",  // Uganda
  "ZIM": "zw",  // Zimbabwe
  "ZAM": "zm",  // Zambia
  "BOT": "bw",  // Botswana
  "NAM": "na",  // Namibia
  "ANG": "ao",  // Angola
  "MOZ": "mz",  // Mozambique
  "CGO": "cg",  // Congo
  "COD": "cd",  // DR Congo
  "CMR": "cm",  // Cameroon
  "GAB": "ga",  // Gabon
  "SEN": "sn",  // Senegal
  "CIV": "ci",  // Ivory Coast
  "GHA": "gh",  // Ghana
  "BEN": "bj",  // Benin
  "TOG": "tg",  // Togo
  "BUR": "bf",  // Burkina Faso
  "MLI": "ml",  // Mali
  "NIG": "ne",  // Niger
  "CHA": "td",  // Chad
  "CAF": "cf",  // Central African Republic
  "GBS": "gw",  // Guinea-Bissau
  "GUI": "gn",  // Guinea
  "SLE": "sl",  // Sierra Leone
  "LBR": "lr",  // Liberia
  "GAM": "gm",  // Gambia
  "MTN": "mr",  // Mauritania
  "CPV": "cv",  // Cape Verde
  "STP": "st",  // São Tomé and Príncipe
  "GEQ": "gq",  // Equatorial Guinea
  "COM": "km",  // Comoros
  "MAD": "mg",  // Madagascar
  "MRI": "mu",  // Mauritius
  "SEY": "sc",  // Seychelles
  "DJI": "dj",  // Djibouti
  "ERI": "er",  // Eritrea
  "SOM": "so",  // Somalia
  "RWA": "rw",  // Rwanda
  "BDI": "bi",  // Burundi
  "SWZ": "sz",  // Eswatini
  "LES": "ls",  // Lesotho
  "MWI": "mw",  // Malawi
  
  // Americas
  "USA": "us",  // United States
  "CAN": "ca",  // Canada
  "MEX": "mx",  // Mexico
  "GUA": "gt",  // Guatemala
  "HON": "hn",  // Honduras
  "ESA": "sv",  // El Salvador
  "NCA": "ni",  // Nicaragua
  "CRC": "cr",  // Costa Rica
  "PAN": "pa",  // Panama
  "CUB": "cu",  // Cuba
  "HAI": "ht",  // Haiti
  "DOM": "do",  // Dominican Republic
  "PUR": "pr",  // Puerto Rico
  "JAM": "jm",  // Jamaica
  "TTO": "tt",  // Trinidad and Tobago
  "BAR": "bb",  // Barbados
  "GRN": "gd",  // Grenada
  "LCA": "lc",  // Saint Lucia
  "VIN": "vc",  // Saint Vincent
  "SKN": "kn",  // Saint Kitts and Nevis
  "ANT": "ag",  // Antigua and Barbuda
  "BAH": "bs",  // Bahamas
  "BER": "bm",  // Bermuda
  "CAY": "ky",  // Cayman Islands
  "IVB": "vg",  // British Virgin Islands
  "ISV": "vi",  // US Virgin Islands
  "ARU": "aw",  // Aruba
  "AHO": "cw",  // Curaçao (Netherlands Antilles)
  "GUY": "gy",  // Guyana
  "SUR": "sr",  // Suriname
  "COL": "co",  // Colombia
  "VEN": "ve",  // Venezuela
  "ECU": "ec",  // Ecuador
  "PER": "pe",  // Peru
  "BOL": "bo",  // Bolivia
  "CHI": "cl",  // Chile
  "ARG": "ar",  // Argentina
  "PAR": "py",  // Paraguay
  "URU": "uy",  // Uruguay
  "BRA": "br",  // Brazil
  
  // Europe
  "GRE": "gr",  // Greece
  "POR": "pt",  // Portugal
  "ESP": "es",  // Spain
  "FRA": "fr",  // France
  "MON": "mc",  // Monaco
  "AND": "ad",  // Andorra
  "ITA": "it",  // Italy
  "SMR": "sm",  // San Marino
  "AUT": "at",  // Austria
  "LIE": "li",  // Liechtenstein
  "BEL": "be",  // Belgium
  "LUX": "lu",  // Luxembourg
  "IRL": "ie",  // Ireland
  "DEN": "dk",  // Denmark
  "NOR": "no",  // Norway
  "SWE": "se",  // Sweden
  "FIN": "fi",  // Finland
  "ISL": "is",  // Iceland
  "EST": "ee",  // Estonia
  "LAT": "lv",  // Latvia
  "LTU": "lt",  // Lithuania
  "POL": "pl",  // Poland
  "CZE": "cz",  // Czech Republic
  "SVK": "sk",  // Slovakia
  "HUN": "hu",  // Hungary
  "SLO": "si",  // Slovenia
  "CRO": "hr",  // Croatia
  "BIH": "ba",  // Bosnia and Herzegovina
  "SRB": "rs",  // Serbia
  "MNE": "me",  // Montenegro
  "MKD": "mk",  // North Macedonia
  "ALB": "al",  // Albania
  "KOS": "xk",  // Kosovo
  "ROU": "ro",  // Romania
  "BUL": "bg",  // Bulgaria
  "MDA": "md",  // Moldova
  "UKR": "ua",  // Ukraine
  "BLR": "by",  // Belarus
  "RUS": "ru",  // Russia
  "GEO": "ge",  // Georgia
  "ARM": "am",  // Armenia
  "AZE": "az",  // Azerbaijan
  "TUR": "tr",  // Turkey
  "CYP": "cy",  // Cyprus
  "MLT": "mt",  // Malta
  
  // Middle East / Central Asia
  "ISR": "il",  // Israel
  "PLE": "ps",  // Palestine
  "JOR": "jo",  // Jordan
  "LBN": "lb",  // Lebanon
  "SYR": "sy",  // Syria
  "IRQ": "iq",  // Iraq
  "KUW": "kw",  // Kuwait
  "BRN": "bh",  // Bahrain
  "QAT": "qa",  // Qatar
  "OMA": "om",  // Oman
  "YEM": "ye",  // Yemen
  "AFG": "af",  // Afghanistan
  "PAK": "pk",  // Pakistan
  "IND": "in",  // India
  "SRI": "lk",  // Sri Lanka
  "BAN": "bd",  // Bangladesh
  "NEP": "np",  // Nepal
  "BHU": "bt",  // Bhutan
  "MDV": "mv",  // Maldives
  "KAZ": "kz",  // Kazakhstan
  "UZB": "uz",  // Uzbekistan
  "TKM": "tm",  // Turkmenistan
  "KGZ": "kg",  // Kyrgyzstan
  "TJK": "tj",  // Tajikistan
  "MGL": "mn",  // Mongolia
  
  // Oceania
  "AUS": "au",  // Australia
  "NZL": "nz",  // New Zealand
  "FIJ": "fj",  // Fiji
  "PNG": "pg",  // Papua New Guinea
  "SOL": "sb",  // Solomon Islands
  "VAN": "vu",  // Vanuatu
  "SAM": "ws",  // Samoa
  "ASA": "as",  // American Samoa
  "TGA": "to",  // Tonga
  "COK": "ck",  // Cook Islands
  "FSM": "fm",  // Micronesia
  "PLW": "pw",  // Palau
  "MHL": "mh",  // Marshall Islands
  "NRU": "nr",  // Nauru
  "KIR": "ki",  // Kiribati
  "TUV": "tv",  // Tuvalu
  "GUM": "gu",  // Guam
  
  // Países históricos / especiais
  "URS": "ru",  // USSR -> Russia flag
  "EUN": "ru",  // Unified Team (1992) -> Russia flag
  "TCH": "cz",  // Czechoslovakia -> Czech flag
  "YUG": "rs",  // Yugoslavia -> Serbia flag
  "SCG": "rs",  // Serbia and Montenegro -> Serbia flag
  "GDR": "de",  // East Germany -> Germany flag
  "FRG": "de",  // West Germany -> Germany flag
  "ROC": "ru",  // Russian Olympic Committee
  "AIN": "un",  // Individual Neutral Athletes (usamos flag UN)
  "EOR": "un",  // Refugee Olympic Team
  "IOA": "un",  // Independent Olympic Athletes
};

/**
 * Obtém a URL da bandeira para um código NOC
 * @param noc Código NOC do país (ex: "BRA", "USA", "GBR")
 * @param size Largura da bandeira em pixels (padrão: 40)
 * @returns URL da bandeira ou URL de fallback
 */
export function getFlagUrl(noc: string, size: number = 40): string {
  const isoCode = NOC_TO_ISO[noc.toUpperCase()] || noc.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w${size}/${isoCode}.png`;
}

/**
 * Obtém a URL da bandeira em formato SVG (melhor qualidade)
 * @param noc Código NOC do país
 * @returns URL da bandeira SVG
 */
export function getFlagSvgUrl(noc: string): string {
  const isoCode = NOC_TO_ISO[noc.toUpperCase()] || noc.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/${isoCode}.svg`;
}

/**
 * Obtém a URL da bandeira com srcset para diferentes resoluções
 * @param noc Código NOC do país
 * @returns Objeto com url e srcset para imagens responsivas
 */
export function getFlagWithSrcSet(noc: string): { src: string; srcSet: string } {
  const isoCode = NOC_TO_ISO[noc.toUpperCase()] || noc.toLowerCase().substring(0, 2);
  return {
    src: `https://flagcdn.com/w40/${isoCode}.png`,
    srcSet: `https://flagcdn.com/w40/${isoCode}.png 1x, https://flagcdn.com/w80/${isoCode}.png 2x`
  };
}

/**
 * Verifica se temos mapeamento para um código NOC
 * @param noc Código NOC
 * @returns true se temos mapeamento conhecido
 */
export function hasKnownFlag(noc: string): boolean {
  return noc.toUpperCase() in NOC_TO_ISO;
}

/**
 * Obtém o código ISO a partir do NOC
 * @param noc Código NOC
 * @returns Código ISO ou o próprio NOC em lowercase
 */
export function nocToIso(noc: string): string {
  return NOC_TO_ISO[noc.toUpperCase()] || noc.toLowerCase().substring(0, 2);
}

// Lista de todos os NOCs conhecidos (útil para validação)
export const KNOWN_NOCS = Object.keys(NOC_TO_ISO);
