import { useTheme } from "@/context/ThemeContext";
import { ButtonProps } from "@/types/type";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
    onPress,
    title,
    bgVariant = "primary",
    textVariant = "default",
    IconLeft,
    IconRight,
    className,
    loading,
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

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            className={`w-full rounded-xl p-4 flex flex-row justify-center items-center${className}`}
            style={[
                getBgStyle(bgVariant),
                { shadowColor: colors.text, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={textVariant === "default" ? colors.white : colors.primary} />
            ) : (
                <>
                    {IconLeft && <IconLeft />}
                    <Text className="text-lg font-bold" style={getTextStyle(textVariant)}>
                        {title}
                    </Text>
                    {IconRight && <IconRight />}
                </>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;