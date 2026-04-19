import DocPage from "../components/DocPage";
import { useTranslation } from "../i18n";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <DocPage
      eyebrow={t("docs.privacyPolicy.eyebrow")}
      title={t("docs.privacyPolicy.title")}
      subtitle={t("docs.privacyPolicy.subtitle")}
      sections={[
        {
          title: t("docs.privacyPolicy.sections.data.title"),
          body: t("docs.privacyPolicy.sections.data.body"),
        },
        {
          title: t("docs.privacyPolicy.sections.security.title"),
          body: t("docs.privacyPolicy.sections.security.body"),
        },
      ]}
      footer={t("docs.privacyPolicy.footer")}
    />
  );
}
