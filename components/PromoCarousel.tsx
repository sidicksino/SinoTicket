import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');
// Card width relative to screen to allow side peeking (80% width)
const CARD_WIDTH = width * 0.8; 
const SPACING = 16;
// Distance to move to snap exactly to the next card
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
// Padding to center the first and last cards perfectly
const PADDING_HORIZONTAL = (width - CARD_WIDTH) / 2;

const promoData = [
  { id: '1', title: 'Ticket', subtitle: 'Book the best seats' },
  { id: '2', title: 'Tech', subtitle: 'Powered by cutting edge' },
  { id: '3', title: 'Features', subtitle: 'Anti double-booking' },
];

export default function PromoCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Determine the animation inputs relative to scroll position
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    // Scale down the cards that are barely peeking
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    
    // Dim the unselected, peeking cards slightly
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: CARD_WIDTH,
          marginRight: index === promoData.length - 1 ? 0 : SPACING,
          transform: [{ scale }],
          opacity,
        }}
      >
         <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
         </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={promoData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    height: 180,
  },
  card: {
    flex: 1,
    backgroundColor: '#3182CE', // Vibrant blue matching your screenshot
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#3182CE',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 48,
    fontFamily: 'Syne_700Bold', // Uses project's existing bold font
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  }
});
