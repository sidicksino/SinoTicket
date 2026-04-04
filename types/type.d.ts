import { TouchableOpacityProps, TextInputProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
    loading?: boolean;
}

export interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

export interface Event {
  _id: string;
  title: string;
  category: string;
  date?: string;
  imageUrl?: string;
  venue_id?: { name: string };
  description?: string;
  price?: number;
  ticket_categories?: any[];
}