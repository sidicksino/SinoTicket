import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.tabBar}
      iconColor={{
        default: colors.tabBarIcon,
        selected: colors.primary,
      }}
      labelStyle={{
        selected: {
          color: colors.primary,
          fontWeight: '700',
        },
        default: {
          color: colors.tabBarIcon,
        }
      }}
      rippleColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      indicatorColor={colors.primaryLight}
    >
      <NativeTabs.Trigger name="home">
        <Icon
          sf="house"
          androidSrc={<VectorIcon family={MaterialIcons} name="home" />}
        />
        <Label>{t("tabs.home")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ticket">
        <Icon
          sf="ticket"
          androidSrc={<VectorIcon family={MaterialIcons} name="local-activity" />}
        />
        <Label>{t("tabs.tickets")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Icon
          sf="clock"
          androidSrc={<VectorIcon family={MaterialIcons} name="history" />}
        />
        <Label>{t("tabs.history")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          sf="person"
          androidSrc={<VectorIcon family={MaterialIcons} name="person" />}
        />
        <Label>{t("tabs.profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
