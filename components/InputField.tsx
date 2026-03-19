import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  className,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] =
    useState(secureTextEntry);

  return (
    <View className={`mb-5 w-full ${className}`}>
      <Text className="text-[14px] font-bold text-[#1E293B] mb-2 ml-1">
        {label}
      </Text>

      <View
        className="flex-row items-center rounded-2xl border px-4 h-[56px]"
        style={
          isFocused
            ? {
              borderColor: "#0286FF",
              backgroundColor: "rgba(2,134,255,0.05)",
            }
            : {
              borderColor: "#E2E8F0",
              backgroundColor: "#F8FAFC",
            }
        }
      >
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={isFocused ? "#0286FF" : "#94A3B8"}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          className="flex-1 text-[16px] text-[#0F172A]"
          secureTextEntry={isSecureTextVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#94A3B8"
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
          >
            <Ionicons
              name={isSecureTextVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;