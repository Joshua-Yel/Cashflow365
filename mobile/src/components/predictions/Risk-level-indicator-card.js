import React from "react";
import { View, Text, Dimensions } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import PropTypes from "prop-types";
import styles from "../../risk-level-indicator.styles.js";

const { width } = Dimensions.get("window");
const chartWidth = width - 40;

/**
 * A card component that displays a financial risk level using a progress chart.
 * @param {{ riskLevel: number, texts: object }} props
 * @returns {JSX.Element | null}
 */
const RiskLevelIndicator = ({ riskLevel, texts }) => {
  if (riskLevel === null || riskLevel === undefined) {
    return null; // Don't render if there's no data
  }

  const getRiskColor = (opacity = 1) => {
    if (riskLevel > 0.8) return `rgba(231, 76, 60, ${opacity})`; // Red
    if (riskLevel > 0.6) return `rgba(243, 156, 18, ${opacity})`; // Orange
    return `rgba(39, 174, 96, ${opacity})`; // Green
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: getRiskColor,
  };

  return (
    <View style={styles.riskCard}>
      <Text style={styles.riskTitle}>{texts.riskTitle}</Text>
      <ProgressChart
        data={{ data: [riskLevel] }}
        width={chartWidth}
        height={120}
        strokeWidth={16}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={true}
      />
      <Text style={[styles.riskPercentage, { color: getRiskColor() }]}>
        {Math.round(riskLevel * 100)}% {texts.riskLabel}
      </Text>
    </View>
  );
};

RiskLevelIndicator.propTypes = {
  riskLevel: PropTypes.number.isRequired,
  texts: PropTypes.shape({
    riskTitle: PropTypes.string,
    riskLabel: PropTypes.string,
  }).isRequired,
};

export default RiskLevelIndicator;
