import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import { useTheme } from "@/context/ThemeContext";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(secureTextEntry);
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className={`mb-5 w-full ${className}`}>
        {label ? (
          <Text className={`text-[15px] font-syne font-bold ml-1 mb-2 tracking-wide ${labelStyle}`} style={{ color: colors.text }}>
            {label}
          </Text>
        ) : null}
        <View
          className={`flex h-[60px] flex-row items-center justify-start rounded-2xl border px-4 transition-all duration-300 ${containerStyle}`}
          style={
            isFocused
              ? {
                borderColor: colors.primary,
                backgroundColor: colors.inputBg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
                elevation: 6,
              }
              : {
                borderColor: colors.border,
                backgroundColor: colors.inputBg,
              }
          }
        >
          {icon && (
            <Ionicons name={icon as any}
              size={24}
              color={isFocused ? colors.primary : colors.tabBarIcon}
              className={`mr-3 ${iconStyle}`}
              style={{ marginRight: 12 }}
            />
          )}
          <TextInput
            className={`flex-1 font-medium text-[16px] h-full text-left ${inputStyle}`}
            secureTextEntry={isSecureTextVisible}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor={colors.subtext}
            style={{ paddingVertical: 0, color: colors.text }}
            {...props}
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
              className="p-2"
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSecureTextVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.tabBarIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputField;