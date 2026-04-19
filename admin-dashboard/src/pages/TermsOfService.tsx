import DocPage from "../components/DocPage";
import { useTranslation } from "../i18n";

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <DocPage
      eyebrow={t("docs.termsOfService.eyebrow")}
      title={t("docs.termsOfService.title")}
      subtitle={t("docs.termsOfService.subtitle")}
      sections={[
        {
          title: t("docs.termsOfService.sections.use.title"),
          body: t("docs.termsOfService.sections.use.body"),
        },
        {
          title: t("docs.termsOfService.sections.refunds.title"),
          body: t("docs.termsOfService.sections.refunds.body"),
        },
      ]}
      footer={t("docs.termsOfService.footer")}
    />
  );
}
