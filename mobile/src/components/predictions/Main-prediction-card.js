import React, { useEffect, useState } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import PropTypes from "prop-types";
import styles from "../../main-prediction-card.styles"; // Using a dedicated stylesheet

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 40;

const chartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(52, 73, 94, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForLabels: {
    fontSize: 10,
  },
};

// A small sub-component for the legend item
const LegendItem = ({ color, text }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendColor, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{text}</Text>
  </View>
);

LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default function MainPredictionCard({
  predictionData,
  confidenceLevel,
  texts,
}) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Prevent rendering if data is not available
  if (!predictionData || !predictionData.incomeExpenseChart) {
    return null;
  }

  return (
    <Animated.View style={[styles.predictionCard, { opacity: fadeAnim }]}>
      <View style={styles.predictionHeader}>
        <Text style={styles.predictionTitle}>{texts.subtitle}</Text>
        <Text style={styles.confidenceText}>
          {confidenceLevel}% {texts.confidenceLevel}
        </Text>
      </View>

      {/* Income vs Expenses Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={predictionData.incomeExpenseChart}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={[styles.chart, { marginLeft: -10 }]}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          verticalLabelRotation={30}
          xLabelsOffset={-10}
          withDots={true}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem
          color="#27ae60"
          text={texts.income || "Income"}
        />
        <LegendItem
          color="#e74c3c"
          text={texts.expenses || "Expenses"}
        />
      </View>
    </Animated.View>
  );
}

MainPredictionCard.propTypes = {
  predictionData: PropTypes.shape({
    incomeExpenseChart: PropTypes.object.isRequired,
  }).isRequired,
  confidenceLevel: PropTypes.number.isRequired,
  texts: PropTypes.shape({
    subtitle: PropTypes.string,
    confidenceLevel: PropTypes.string,
    income: PropTypes.string,
    expenses: PropTypes.string,
  }).isRequired,
};
