import {
  getFlagUrl,
  getFlagSvgUrl,
  getFlagWithSrcSet,
  hasKnownFlag,
  nocToIso,
  KNOWN_NOCS,
} from '../../lib/flags';

describe('Flags Module', () => {
  describe('getFlagUrl', () => {
    it('should return flag URL for known NOC', () => {
      const url = getFlagUrl('BRA');
      expect(url).toBe('https://flagcdn.com/w40/br.png');
    });

    it('should return flag URL with custom size', () => {
      const url = getFlagUrl('USA', 80);
      expect(url).toBe('https://flagcdn.com/w80/us.png');
    });

    it('should handle unknown NOC by using first 2 chars lowercase', () => {
      const url = getFlagUrl('XYZ');
      expect(url).toBe('https://flagcdn.com/w40/xy.png');
    });

    it('should handle case insensitivity', () => {
      const url = getFlagUrl('usa');
      expect(url).toBe('https://flagcdn.com/w40/us.png');
    });

    it('should handle GBR correctly', () => {
      const url = getFlagUrl('GBR');
      expect(url).toBe('https://flagcdn.com/w40/gb.png');
    });

    it('should handle GER correctly', () => {
      const url = getFlagUrl('GER');
      expect(url).toBe('https://flagcdn.com/w40/de.png');
    });

    it('should handle SUI correctly', () => {
      const url = getFlagUrl('SUI');
      expect(url).toBe('https://flagcdn.com/w40/ch.png');
    });
  });

  describe('getFlagSvgUrl', () => {
    it('should return SVG URL for known NOC', () => {
      const url = getFlagSvgUrl('BRA');
      expect(url).toBe('https://flagcdn.com/br.svg');
    });

    it('should handle unknown NOC', () => {
      const url = getFlagSvgUrl('XYZ');
      expect(url).toBe('https://flagcdn.com/xy.svg');
    });
  });

  describe('getFlagWithSrcSet', () => {
    it('should return src and srcSet for known NOC', () => {
      const result = getFlagWithSrcSet('USA');
      expect(result.src).toBe('https://flagcdn.com/w40/us.png');
      expect(result.srcSet).toBe('https://flagcdn.com/w40/us.png 1x, https://flagcdn.com/w80/us.png 2x');
    });

    it('should handle unknown NOC', () => {
      const result = getFlagWithSrcSet('XYZ');
      expect(result.src).toBe('https://flagcdn.com/w40/xy.png');
    });
  });

  describe('hasKnownFlag', () => {
    it('should return true for known NOC', () => {
      expect(hasKnownFlag('USA')).toBe(true);
      expect(hasKnownFlag('BRA')).toBe(true);
      expect(hasKnownFlag('GBR')).toBe(true);
    });

    it('should return false for unknown NOC', () => {
      expect(hasKnownFlag('XYZ')).toBe(false);
      expect(hasKnownFlag('ABC')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(hasKnownFlag('usa')).toBe(true);
    });
  });

  describe('nocToIso', () => {
    it('should convert known NOC to ISO', () => {
      expect(nocToIso('USA')).toBe('us');
      expect(nocToIso('BRA')).toBe('br');
      expect(nocToIso('GBR')).toBe('gb');
      expect(nocToIso('GER')).toBe('de');
    });

    it('should return first 2 chars lowercase for unknown NOC', () => {
      expect(nocToIso('XYZ')).toBe('xy');
      expect(nocToIso('ABC')).toBe('ab');
    });
  });

  describe('KNOWN_NOCS', () => {
    it('should be an array with known NOCs', () => {
      expect(Array.isArray(KNOWN_NOCS)).toBe(true);
      expect(KNOWN_NOCS.length).toBeGreaterThan(0);
      expect(KNOWN_NOCS).toContain('USA');
      expect(KNOWN_NOCS).toContain('BRA');
      expect(KNOWN_NOCS).toContain('GBR');
    });
  });

  describe('edge cases', () => {
    it('should handle historical countries', () => {
      expect(nocToIso('URS')).toBe('ru'); // USSR
      expect(nocToIso('GDR')).toBe('de'); // East Germany
      expect(nocToIso('TCH')).toBe('cz'); // Czechoslovakia
    });

    it('should handle special Olympic entities', () => {
      expect(nocToIso('ROC')).toBe('ru'); // Russian Olympic Committee
      expect(nocToIso('EUN')).toBe('ru'); // Unified Team
    });
  });
});
