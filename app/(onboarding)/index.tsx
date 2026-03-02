import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        title: 'Easy Track with HobortGo',
        description: 'Experience real-time shipment tracking with our state-of-the-art logistics platform.',
        image: require('../../assets/images/onboarding_1.png'),
    },
    {
        title: 'Digital Proof of Delivery',
        description: 'Instantly verify drop-offs with secure e-signatures and high-quality photo captures.',
        image: require('../../assets/images/onboarding_2.jpg'),
    },
    {
        title: 'Fast & Reliable Transit',
        description: 'Empowering couriers with optimized routes and unparalleled delivery accuracy.',
        image: require('../../assets/images/onboarding_3.png'),
    }
];

export default function OnboardingScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<any>(null);
    const router = useRouter();

    const handleNext = () => {
        if (activeIndex === ONBOARDING_DATA.length - 1) {
            router.replace('/(auth)/login');
        } else {
            carouselRef.current?.snapToNext();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="flex-1 items-center justify-center p-4">
            <View className="w-full h-[65%] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 items-center justify-center relative mt-16">
                <Image
                    source={item.image}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover', alignItems: 'center' }}
                />

                {/* Subtle gradient overlay at bottom of image for blending if needed */}
                <View className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/10 to-transparent" />
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Top Toolbar: Title & Skip button */}
            <View className="absolute top-16 w-full px-8 z-10 flex-row justify-between items-center">
                <Text className="text-xl font-extrabold tracking-tight text-[#1e4b69]">
                    Hobort<Text className="text-[#f0782d]">Go</Text>
                </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                    <Text className="text-gray-400 font-bold text-sm tracking-widest uppercase">Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Slider occupying major mid space */}
            <View className="h-full pb-12 pt-4 -mt-24 z-0">
                <Carousel
                    ref={carouselRef}
                    data={ONBOARDING_DATA}
                    renderItem={renderItem}
                    sliderWidth={screenWidth}
                    itemWidth={screenWidth}
                    vertical={false}
                    onSnapToItem={(index) => setActiveIndex(index)}
                    inactiveSlideScale={0.95}
                    inactiveSlideOpacity={0.8}
                    autoplay={true}
                    autoplayDelay={1000}
                    autoplayInterval={4000}
                    loop={true}
                />
            </View>

            {/* Bottom Content Section */}
            <View className="flex-1 justify-end">

                {/* Dynamic Text Content */}
                <View className="min-h-[120px] justify-center mb-6">
                    <Text className="text-3xl font-bold text-[#111827] text-center tracking-tight mb-3">
                        {ONBOARDING_DATA[activeIndex].title}
                    </Text>
                    <Text className="text-[#6B7280] text-center text-base leading-2 font-normal px-2 max-w-sm mx-auto">
                        {ONBOARDING_DATA[activeIndex].description}
                    </Text>
                </View>

                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-10 px-6 items-center">
                    {/* Next/Start Button */}
                    <TouchableOpacity
                        className="w-full h-16 bg-[#f0782d] rounded-lg items-center justify-center"
                        onPress={handleNext}
                    >
                        <Text className="text-white font-bold text-lg tracking-wide rounded-lg">
                            {activeIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Continue"}
                        </Text>
                    </TouchableOpacity>
                </View>


            </View>
        </View>
    );
}
