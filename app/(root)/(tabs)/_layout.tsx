import { MaterialIcons } from '@expo/vector-icons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon
          sf="house"
          androidSrc={<VectorIcon family={MaterialIcons} name="home" />}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ticket">
        <Icon
          sf="ticket"
          androidSrc={<VectorIcon family={MaterialIcons} name="local-activity" />}
        />
        <Label>Tickets</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Icon
          sf="clock"
          androidSrc={<VectorIcon family={MaterialIcons} name="history" />}
        />
        <Label>History</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          sf="person"
          androidSrc={<VectorIcon family={MaterialIcons} name="person" />}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

