import { Image, ImageSourcePropType, StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  FadeIn,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const gap = 10;

interface HeadTextProps {
  text?: string;
  side?: "left" | "right";
  image?: ImageSourcePropType;
}

const HeadText = (props: HeadTextProps) => {
  const { text, side, image } = props;
  const [totalWidth, setTotalWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const width = totalWidth - textWidth - gap;

  const Transition = LinearTransition.delay(1650)
    .springify()
    .damping(18)
    .stiffness(50);
  const LeftSlide = SlideInLeft.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50);
  const RightSlide = SlideInRight.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50);

  return (
    <Animated.View
      entering={FadeIn.delay(1000).springify().damping(18).stiffness(50)}
      layout={Transition}
      onLayout={(event) => {
        setTotalWidth(event.nativeEvent.layout.width);
      }}
      style={styles.headerContainer}
    >
      {Boolean(width > 0) && side === "left" && (
        <Animated.View
          entering={LeftSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
      {Boolean(text) && (
        <Animated.Text
          layout={Transition}
          onLayout={(event) => {
            setTextWidth(event.nativeEvent.layout.width);
          }}
          style={styles.headText}
        >
          {text}
        </Animated.Text>
      )}
      {Boolean(width > 0) && side === "right" && (
        <Animated.View
          entering={RightSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default function () {
  const { top, bottom } = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const router = useRouter();

    useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/(tabs)");
    }, 3000);

    return () => clearTimeout(timer); // Cleanup if user leaves early
  }, []);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };
  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <View style={{ gap }}>
        <HeadText
          text="Wellcome"
          side="right"
          image={require("../assets/images/One.png")}
        />
        <HeadText
          text="To"
          side="right"
          image={require("../assets/images/2.jpg")}
        />
        <HeadText
          text="My"
          side="left"
          image={require("../assets/images/3.jpg")}
        />
        <HeadText text="HealTime" />
        <HeadText side="right" image={require("../assets/images/4.jpg")} />
      </View>
      <Animated.View
        entering={FadeIn.delay(3000).springify().damping(18).stiffness(50)}
        style={[styles.buttonContainer, animatedStyle]}
      >
        <TouchableWithoutFeedback
        testID="getStartedButton"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            router.push("/(tabs)");
            scale.value = withSpring(1, { damping: 10, stiffness: 100 });

          }}
        >
          <Animated.View style={styles.button}>
            <Text style={styles.buttonText}>Get Started Be Healthy</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
  button: {
    backgroundColor: "#6495ed", // Blue background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded corners
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "Lemon",
    color: "#FFFFFF", // White text
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    justifyContent: "center",
    gap: gap,
    height: 80,
  },
  embedImage: {
    height: 80,
    borderRadius: 22,
    overflow: "hidden",
  },
  headText: {
    fontSize: 45,
    fontFamily: "Lemon",
    color: "#0C1824",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});