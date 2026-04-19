import DocPage from "../components/DocPage";
import { useTranslation } from "../i18n";

export default function HelpCenter() {
  const { t } = useTranslation();

  return (
    <DocPage
      eyebrow={t("docs.helpCenter.eyebrow")}
      title={t("docs.helpCenter.title")}
      subtitle={t("docs.helpCenter.subtitle")}
      sections={[
        {
          title: t("docs.helpCenter.sections.support.title"),
          body: t("docs.helpCenter.sections.support.body"),
        },
        {
          title: t("docs.helpCenter.sections.tickets.title"),
          body: t("docs.helpCenter.sections.tickets.body"),
        },
      ]}
      footer={t("docs.helpCenter.footer")}
    />
  );
}
