import React from "react";
import { View, Text, ScrollView } from "react-native";
import PropTypes from "prop-types";
import styles from "../../cashflow-forecast.styles";

// Centralized translations
const translations = {
  title: {
    EN: "4-Week Cash Flow Forecast",
    FIL: "4-Week Cash Flow Forecast",
  },
};

const ForecastCard = ({ period }) => (
  <View
    style={[
      styles.forecastCard,
      {
        backgroundColor: period.balance < 5000 ? "#e74c3c" : "#27ae60",
      },
    ]}
  >
    <Text style={styles.forecastPeriod}>{period.period}</Text>
    <Text style={styles.forecastIncome}>
      +₱{period.income.toLocaleString()}
    </Text>
    <Text style={styles.forecastExpenses}>
      -₱{period.expenses.toLocaleString()}
    </Text>
    <Text style={styles.forecastBalance}>
      ₱{period.balance.toLocaleString()}
    </Text>
  </View>
);

ForecastCard.propTypes = {
  period: PropTypes.shape({
    period: PropTypes.string.isRequired,
    income: PropTypes.number.isRequired,
    expenses: PropTypes.number.isRequired,
    balance: PropTypes.number.isRequired,
  }).isRequired,
};

const CashflowForecast = ({ language, data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.forecastSection}>
      <Text style={styles.sectionTitle}>📈 {translations.title[language]}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.forecastScroll}
      >
        {data.map((period, index) => (
          <ForecastCard
            key={index}
            period={period}
          />
        ))}
      </ScrollView>
    </View>
  );
};

CashflowForecast.propTypes = {
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CashflowForecast;
