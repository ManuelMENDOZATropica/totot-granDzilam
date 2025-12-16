import { useLanguage } from '@/contexts/LanguageContext';
import { type Language } from '@/lib/translations';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { language, setLanguage, translations } = useLanguage();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Language;
    setLanguage(value);
  };

  return (
    <div className={className}>
      <label htmlFor="language-select" className="sr-only">
        Language
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleChange}
        className="rounded-full border border-white/40 bg-white/20 px-3 py-2 text-sm font-medium text-white shadow-sm backdrop-blur transition hover:bg-white/30"
      >
        {(Object.keys(translations.languageNames) as Language[]).map((option) => (
          <option key={option} value={option} className="text-slate-900">
            {translations.languageNames[option]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
