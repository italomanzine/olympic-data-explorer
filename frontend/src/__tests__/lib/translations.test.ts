import { translations, sportTranslations, countryTranslations, Language } from '../../lib/i18n/translations';

describe('Translations Module', () => {
  describe('translations object', () => {
    it('should have all required languages', () => {
      const languages: Language[] = ['pt-BR', 'en', 'es', 'fr', 'zh'];
      languages.forEach(lang => {
        expect(translations[lang]).toBeDefined();
      });
    });

    it('should have consistent keys across languages', () => {
      const ptKeys = Object.keys(translations['pt-BR']);
      const languages: Language[] = ['en', 'es', 'fr', 'zh'];
      
      languages.forEach(lang => {
        const langKeys = Object.keys(translations[lang]);
        ptKeys.forEach(key => {
          expect(langKeys).toContain(key);
        });
      });
    });

    it('should have app_title in all languages', () => {
      expect(translations['pt-BR'].app_title).toBe('Dashboard Olímpico');
      expect(translations['en'].app_title).toBe('Olympic Dashboard');
      expect(translations['es'].app_title).toBe('Tablero Olímpico');
      expect(translations['fr'].app_title).toBe('Tableau de Bord Olympique');
      expect(translations['zh'].app_title).toBe('奥运仪表板');
    });

    it('should have loading translations', () => {
      expect(translations['pt-BR'].loading).toBe('Processando...');
      expect(translations['en'].loading).toBe('Processing...');
    });

    it('should have medal translations', () => {
      expect(translations['pt-BR'].gold).toBe('Ouro');
      expect(translations['en'].gold).toBe('Gold');
      expect(translations['es'].gold).toBe('Oro');
      expect(translations['fr'].gold).toBe('Or');
      expect(translations['zh'].gold).toBe('金牌');
    });

    it('should have filter translations', () => {
      expect(translations['pt-BR'].season).toBe('Temporada');
      expect(translations['en'].season).toBe('Season');
    });
  });

  describe('sportTranslations object', () => {
    it('should have sport translations for pt-BR', () => {
      expect(sportTranslations['pt-BR']).toBeDefined();
      expect(sportTranslations['pt-BR']['Swimming']).toBe('Natação');
      expect(sportTranslations['pt-BR']['Athletics']).toBe('Atletismo');
      expect(sportTranslations['pt-BR']['Football']).toBe('Futebol');
    });

    it('should have sport translations for es', () => {
      expect(sportTranslations['es']).toBeDefined();
      expect(sportTranslations['es']['Swimming']).toBe('Natación');
    });

    it('should have sport translations for fr', () => {
      expect(sportTranslations['fr']).toBeDefined();
      expect(sportTranslations['fr']['Swimming']).toBe('Natation');
    });

    it('should have sport translations for zh', () => {
      expect(sportTranslations['zh']).toBeDefined();
      expect(sportTranslations['zh']['Swimming']).toBe('游泳');
    });
  });

  describe('countryTranslations object', () => {
    it('should have country translations for pt-BR', () => {
      expect(countryTranslations['pt-BR']).toBeDefined();
      expect(countryTranslations['pt-BR']['USA']).toBe('Estados Unidos');
      expect(countryTranslations['pt-BR']['BRA']).toBe('Brasil');
      expect(countryTranslations['pt-BR']['GBR']).toBe('Reino Unido');
    });

    it('should have country translations for es', () => {
      expect(countryTranslations['es']).toBeDefined();
      expect(countryTranslations['es']['USA']).toBe('Estados Unidos');
      expect(countryTranslations['es']['ESP']).toBe('España');
    });

    it('should have country translations for fr', () => {
      expect(countryTranslations['fr']).toBeDefined();
      expect(countryTranslations['fr']['FRA']).toBe('France');
    });

    it('should have country translations for zh', () => {
      expect(countryTranslations['zh']).toBeDefined();
      expect(countryTranslations['zh']['CHN']).toBe('中国');
    });

    it('should have historical country translations', () => {
      expect(countryTranslations['pt-BR']['URS']).toBe('União Soviética');
      expect(countryTranslations['pt-BR']['GDR']).toBe('Alemanha Oriental');
    });
  });

  describe('edge cases', () => {
    it('should return undefined for non-existent sport', () => {
      expect(sportTranslations['pt-BR']['NonExistentSport']).toBeUndefined();
    });

    it('should return undefined for non-existent country', () => {
      expect(countryTranslations['pt-BR']['XYZ']).toBeUndefined();
    });
  });
});
