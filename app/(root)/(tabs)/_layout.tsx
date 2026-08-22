import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
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
        <NativeTabs.Trigger.Icon
          sf="house"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="home" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.home")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ticket">
        <NativeTabs.Trigger.Icon
          sf="ticket"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="local-activity" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.tickets")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon
          sf="clock"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="history" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.history")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf="person"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="person" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.profile")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
