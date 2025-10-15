import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LanguageSwitcher() {
  useEffect(() => {
    // Apply stored language on load
    const savedLang = localStorage.getItem("selectedLanguage") || "en";

    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        clearInterval(interval);
        select.value = savedLang;
        select.dispatchEvent(new Event("change"));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
      localStorage.setItem("selectedLanguage", lang);
    }
  };

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ha", name: "Hausa", flag: "🇳🇬" },
    { code: "yo", name: "Yoruba", flag: "🇳🇬" },
    { code: "ig", name: "Igbo", flag: "🇳🇬" },
    { code: "ff", name: "Fulfulde", flag: "🌍" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
  ];

  return (
    <div className="dropdown">
      <button
        className="btn btn-primary dropdown-toggle"
        type="button"
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        🌐 Language
      </button>
      <ul className="dropdown-menu" aria-labelledby="languageDropdown">
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => changeLanguage(lang.code)}
            >
              <span>{lang.flag}</span> {lang.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
