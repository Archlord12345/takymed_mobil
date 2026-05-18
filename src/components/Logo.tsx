import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 120, showText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>TAKYMED</Text>
          <Text style={styles.tagline}>Take Your Medicine</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -10,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2563eb',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: -4,
    opacity: 0.6,
  },
});
