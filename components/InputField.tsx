import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(secureTextEntry);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className={`mb-5 w-full flex flex-col gap-2 ${className}`}>
        <Text className="text-[14px] font-bold text-[#1E293B] ml-1">
          {label}
        </Text>
        <View
          className={`flex h-[56px] flex-row items-center justify-start rounded-2xl border px-4 transition-colors duration-200 ${
            isFocused ? "border-[#0286FF] bg-[#0286FF]/5 shadow-sm shadow-[#0286FF]/10" : "border-[#E2E8F0] bg-[#F8FAFC]"
          }`}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={22}
              color={isFocused ? "#0286FF" : "#94A3B8"}
              className="mr-3"
              style={{ marginRight: 12 }}
            />
          )}
          <TextInput
            className="flex-1 font-medium text-[#0F172A] text-[16px] h-full"
            secureTextEntry={isSecureTextVisible}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor="#94A3B8"
            {...props}
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
              className="p-1"
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
    </TouchableWithoutFeedback>
  );
};

export default InputField;
