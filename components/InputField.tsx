import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { InputFieldProps } from "@/types/type";

/**
 * Text field with an optional icon, label and password visibility toggle.
 * Keyboard avoidance is handled once per screen (see AuthScreen), not here.
 */
const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  hint,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(secureTextEntry);
  const { colors } = useTheme();

  return (
    <View className={`mb-3 w-full ${className ?? ""}`}>
      {label ? (
        <Text
          className={`text-[13px] font-semibold ml-1 mb-1.5 ${labelStyle ?? ""}`}
          style={{ color: colors.subtext }}
        >
          {label}
        </Text>
      ) : null}
      <View
        className={`flex h-[52px] flex-row items-center rounded-2xl border px-4 ${containerStyle ?? ""}`}
        style={{
          borderColor: isFocused ? colors.primary : colors.border,
          borderWidth: isFocused ? 1.5 : 1,
          backgroundColor: colors.inputBg,
        }}
      >
        {icon ? (
          <Ionicons
            name={icon as any}
            size={20}
            color={isFocused ? colors.primary : colors.tabBarIcon}
            style={{ marginRight: 10 }}
            className={iconStyle}
          />
        ) : null}
        <TextInput
          className={`flex-1 text-[16px] h-full ${inputStyle ?? ""}`}
          secureTextEntry={isHidden}
          placeholderTextColor={colors.subtext}
          accessibilityLabel={label || (props.placeholder as string)}
          style={{ paddingVertical: 0, color: colors.text }}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsHidden(!isHidden)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={isHidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.tabBarIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {hint ? (
        <Text className="text-[12px] ml-1 mt-1.5" style={{ color: colors.subtext }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

export default InputField;
