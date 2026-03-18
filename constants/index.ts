import onboarding1 from "@/assets/images/onboarding1.png";
import onboarding2 from "@/assets/images/onboarding2.png";
import onboarding3 from "@/assets/images/onboarding3.png";

export const images = {
    onboarding1,
    onboarding2,
    onboarding3,
};
export const onboarding = [
    {
        id: 1,
        title: "Discover events across Chad",
        description:
            "Find concerts, festivals, and the best events happening near you with SinoTicket.",
        image: images.onboarding1,
    },
    {
        id: 2,
        title: "Book your event tickets fast",
        description:
            "Reserve your spot in seconds and never miss your favorite shows and parties.",
        image: images.onboarding2,
    },
    {
        id: 3,
        title: "Scan, enter, enjoy",
        description:
            "Get your digital ticket instantly and access events fast with secure QR code entry.",
        image: images.onboarding3,
    },
];

export const data = {
    onboarding,
};