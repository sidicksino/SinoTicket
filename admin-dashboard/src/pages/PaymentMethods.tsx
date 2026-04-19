import DocPage from "../components/DocPage";
import { useTranslation } from "../i18n";

export default function PaymentMethods() {
  const { t } = useTranslation();

  return (
    <DocPage
      eyebrow={t("docs.paymentMethods.eyebrow")}
      title={t("docs.paymentMethods.title")}
      subtitle={t("docs.paymentMethods.subtitle")}
      sections={[
        {
          title: t("docs.paymentMethods.sections.methods.title"),
          body: t("docs.paymentMethods.sections.methods.body"),
        },
        {
          title: t("docs.paymentMethods.sections.security.title"),
          body: t("docs.paymentMethods.sections.security.body"),
        },
      ]}
      footer={t("docs.paymentMethods.footer")}
    />
  );
}
