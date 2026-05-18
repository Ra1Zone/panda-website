import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getLocalized } from "@/lib/localize";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {getLocalized({ en: "Oops! Page not found", ar: "عذرا! الصفحة غير موجودة", he: "אופס! הדף לא נמצא" }, lang)}
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {getLocalized({ en: "Return to Home", ar: "العودة للرئيسية", he: "חזרה לבית" }, lang)}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
