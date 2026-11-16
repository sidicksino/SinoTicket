import { useTheme } from "@/context/ThemeContext";
import { ButtonProps } from "@/types/type";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

/** The app's one button style: 54pt tall, rounded, full width. */
const CustomButton = ({
    onPress,
    title,
    bgVariant = "primary",
    textVariant = "default",
    IconLeft,
    IconRight,
    className,
    loading,
    disabled,
    style,
    ...props
}: ButtonProps) => {
    const { colors } = useTheme();

    const getBgStyle = (variant: ButtonProps["bgVariant"]) => {
        switch (variant) {
            case "secondary":
                return { backgroundColor: colors.subtext };
            case "danger":
                return { backgroundColor: colors.error };
            case "success":
                return { backgroundColor: colors.success };
            case "outline":
                return { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextStyle = (variant: ButtonProps["textVariant"]) => {
        switch (variant) {
            case "primary":
                return { color: colors.primary };
            case "secondary":
                return { color: colors.subtext };
            case "danger":
                return { color: colors.error };
            case "success":
                return { color: colors.success };
            default:
                return { color: colors.white };
        }
    };

    const isDisabled = !!disabled || !!loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: !!loading }}
            className={`w-full h-[54px] rounded-2xl px-4 flex flex-row justify-center items-center gap-2 ${className ?? ""}`}
            style={[getBgStyle(bgVariant), { opacity: disabled && !loading ? 0.5 : 1 }, style]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={textVariant === "default" ? colors.white : colors.primary} />
            ) : (
                <>
                    {IconLeft && <IconLeft />}
                    <Text className="text-[17px] font-bold" style={getTextStyle(textVariant)}>
                        {title}
                    </Text>
                    {IconRight && <IconRight />}
                </>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
