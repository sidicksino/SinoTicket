import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="mb-4 w-full"
    >
      <TouchableWithoutFeedback>
        <View className="flex flex-col gap-2">
          <Text className="text-[15px] font-semibold text-[#333333]">
            {label}
          </Text>
          <View
            className={`flex flex-row items-center justify-start rounded-xl border bg-neutral-50 px-4 py-3 shadow-sm shadow-neutral-200/50 ${
              isFocused ? "border-[#0286FF]" : "border-neutral-200"
            } ${className}`}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color="#666666"
                className="mr-3"
                style={{ marginRight: 12 }}
              />
            )}
            <TextInput
              className="flex-1 font-medium text-black text-[15px]"
              secureTextEntry={isSecureTextVisible}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor="#9ca3af"
              {...props}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
              >
                <Ionicons
                  name={isSecureTextVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
