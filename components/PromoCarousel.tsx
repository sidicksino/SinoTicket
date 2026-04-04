import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Card width relative to screen
const CARD_WIDTH = width * 0.90;
const SPACING = 16;
// The distance the ScrollView must move to snap precisely to the next item
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
// Use explicit spacer components instead of padding to beat alignment bugs on Android/iOS
const SPACER_WIDTH = (width - CARD_WIDTH) / 2 - (SPACING / 2);

// Premium default data with images for "Tech and Features" theme
const promoData = [
  {
    id: '1',
    title: 'Tech Innovation',
    subtitle: 'Discover the latest features powering our new platform',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Seamless Experience',
    subtitle: 'Zero double-booking guarantee with our real-time engine',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Premium Events',
    subtitle: 'Book the best seats securely from anywhere in the world',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80'
  },
];

export default function PromoCarousel() {
  const { colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll mechanism
  useEffect(() => {
    let interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= promoData.length) {
        nextIndex = 0;
      }
      setCurrentIndex(nextIndex);
      // scrollToOffset directly targets the exact absolute coordinate ignoring index layouts
      flatListRef.current?.scrollToOffset({ offset: nextIndex * SNAP_INTERVAL, animated: true });
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Update dots when swiped manually by user
  const handleMomentumScrollEnd = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SNAP_INTERVAL);
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Interpolation inputs for the center, left, and right cards
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    // Scale shrinks the cards down significantly when they are "behind/coming up"
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    // Dim the unselected cards to enhance the 3D depth effect
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: CARD_WIDTH,
          marginHorizontal: SPACING / 2, // Total width allocated will equal exactly SNAP_INTERVAL
          transform: [{ scale }],
          opacity,
        }}
      >
        <View style={[styles.card, { backgroundColor: colors.black }]}>
          {/* Background Image */}
          <Image source={{ uri: item.image }} style={styles.imageBackground} />

          {/* Dark overlay proxy for readability */}
          <View style={[styles.overlay, { backgroundColor: colors.overlayMedium }]} />

          {/* Top Right Logo/Badge */}
          <View style={[styles.logoContainer, { backgroundColor: colors.white }]}>
            <Text style={[styles.logoText, { color: colors.black }]}>NEWS</Text>
          </View>

          {/* Bottom Text content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.white }]} numberOfLines={2}>{item.subtitle}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={promoData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Instead of buggy paddingHorizontal, we inject invisible bounding boxes to center items
        ListHeaderComponent={<View style={{ width: SPACER_WIDTH }} />}
        ListFooterComponent={<View style={{ width: SPACER_WIDTH }} />}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />

      {/* Pagination Dots beneath the Carousel */}
      <View style={styles.paginationContainer}>
        {promoData.map((_, index) => {
          const dotColor = index === currentIndex ? colors.primary : colors.subtext; // Active dot colored, inactive subtext
          const dotWidth = index === currentIndex ? 10 : 8; // Active dot slightly larger
          return (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: dotColor, width: dotWidth, height: dotWidth, borderRadius: dotWidth / 2 }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 24, // Matches typical modern app rounded card aesthetics
    overflow: 'hidden',
    // Soft shadow for depth
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  imageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Syne_700Bold', // Project font
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  dot: {
    marginHorizontal: 5,
  }
});
