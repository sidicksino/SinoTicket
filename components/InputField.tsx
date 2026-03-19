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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className={`mb-5 w-full ${className}`}>
        {label ? (
          <Text className={`text-[15px] font-syne font-bold text-[#334155] ml-1 mb-2 tracking-wide ${labelStyle}`}>
            {label}
          </Text>
        ) : null}
        <View
          className={`flex h-[60px] flex-row items-center justify-start rounded-2xl border px-4 ${containerStyle}`}
          style={
            isFocused
              ? {
                  borderColor: "#0286FF",
                  backgroundColor: "#FFFFFF",
                  shadowColor: "#0286FF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  elevation: 6,
                }
              : {
                  borderColor: "#E2E8F0",
                  backgroundColor: "#F8FAFC",
                }
          }
        >
          {icon && (
            <Ionicons
              name={icon as any}
              size={24}
              color={isFocused ? "#0286FF" : "#94A3B8"}
              className={`mr-3 ${iconStyle}`}
              style={{ marginRight: 12 }}
            />
          )}
          <TextInput
            className={`flex-1 font-medium text-[#0F172A] text-[16px] h-full text-left ${inputStyle}`}
            secureTextEntry={isSecureTextVisible}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor="#94A3B8"
            style={{ paddingVertical: 0 }}
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
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputField;