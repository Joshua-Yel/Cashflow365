import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Enhanced color palette with gradients
const categoryColors = {
  food: ["#ff6b6b", "#ee5a52"],
  transport: ["#4ecdc4", "#44a08d"],
  bills: ["#feca57", "#ff9ff3"],
  medicine: ["#a55eea", "#8b5cf6"],
  education: ["#26de81", "#20bf6b"],
  emergency: ["#fd9644", "#f8b500"],
  other: ["#778ca3", "#596275"],
};

const getColorForCategory = (category) => {
  return categoryColors[category.toLowerCase()] || ["#95a5a6", "#7f8c8d"];
};

const AnimatedCard = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const MetricCard = ({
  title,
  value,
  subtitle,
  color,
  icon,
  trend,
  trendDirection = "up-is-good",
}) => (
  <AnimatedCard style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <View style={styles.trendContainer}>
        {trend !== undefined && isFinite(trend) ? (
          <Text
            style={[
              styles.trendText,
              {
                color:
                  (trend >= 0 && trendDirection === "up-is-good") ||
                  (trend < 0 && trendDirection === "up-is-bad")
                    ? "#27ae60"
                    : "#e74c3c",
              },
            ]}
          >
            {trend >= 0 ? "↗" : "↘"} {Math.abs(trend).toFixed(1)}%
          </Text>
        ) : null}
      </View>
    </View>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </AnimatedCard>
);

const InsightCard = ({ title, description, type, onPress }) => {
  const getBgColor = () => {
    switch (type) {
      case "warning":
        return ["#ff9ff3", "#feca57"];
      case "success":
        return ["#26de81", "#20bf6b"];
      case "info":
        return ["#4ecdc4", "#44a08d"];
      default:
        return ["#a55eea", "#8b5cf6"];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getBgColor()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.insightCard}
      >
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
        <View style={styles.insightArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const DetailedAnalysisScreen = ({ route, navigation }) => {
  const { incomeTransactions, expenseTransactions, language } = route.params;
  const [analysis, setAnalysis] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30"); // 7, 30, 90 days
  const [activeInsight, setActiveInsight] = useState(0);

  const texts = {
    EN: {
      title: "Financial Analysis",
      keyMetrics: "Key Metrics",
      totalIncome: "Total Income",
      totalExpenses: "Total Expenses",
      netCashflow: "Net Cashflow",
      savingsRate: "Savings Rate",
      spendingBreakdown: "Spending Breakdown",
      largestExpenses: "Top Expenses",
      insights: "Smart Insights",
      trends: "Spending Trends",
      noData: "Not enough data for analysis.",
      last7Days: "7 Days",
      last30Days: "30 Days",
      last90Days: "90 Days",
      avgDaily: "Daily Average",
      compared: "vs last period",
    },
    FIL: {
      title: "Financial Analysis",
      keyMetrics: "Mga Key Metric",
      totalIncome: "Kabuuang Kita",
      totalExpenses: "Kabuuang Gastos",
      netCashflow: "Netong Cashflow",
      savingsRate: "Rate ng Ipon",
      spendingBreakdown: "Breakdown ng Gastusin",
      largestExpenses: "Pinakamalaking Gastos",
      insights: "Smart Insights",
      trends: "Mga Trend sa Gastos",
      noData: "Walang sapat na data para sa pagsusuri.",
      last7Days: "7 Araw",
      last30Days: "30 Araw",
      last90Days: "90 Araw",
      avgDaily: "Araw-araw na Average",
      compared: "vs nakaraang period",
    },
  };

  const currentTexts = texts[language];

  const generateInsights = (analysisData) => {
    const insights = [];

    if (analysisData.savingsRate < 10) {
      insights.push({
        type: "warning",
        title: language === "EN" ? "Low Savings Rate" : "Mababang Savings Rate",
        description:
          language === "EN"
            ? "Consider reducing expenses to improve your financial health"
            : "Mag-isip ng pagbabawas ng gastos para sa maayos na kalagayan ng pera",
      });
    }

    if (
      analysisData.pieChartData[0]?.population >
      analysisData.totalExpenses * 0.4
    ) {
      insights.push({
        type: "info",
        title:
          language === "EN"
            ? "High Category Spending"
            : "Mataas na Gastos sa Category",
        description:
          language === "EN"
            ? `${analysisData.pieChartData[0].name} takes up most of your budget`
            : `${analysisData.pieChartData[0].name} ang kumukuha ng karamihan sa inyong budget`,
      });
    }

    if (analysisData.netCashflow > 0) {
      insights.push({
        type: "success",
        title: language === "EN" ? "Great Job!" : "Magaling!",
        description:
          language === "EN"
            ? "You're saving money this period. Keep it up!"
            : "Nag-iipon kayo ngayong period. Ipagpatuloy!",
      });
    }

    return insights;
  };

  useEffect(() => {
    const daysAgo = parseInt(selectedPeriod);
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - daysAgo);
    const periodStartMs = periodStart.getTime();

    const prevPeriodEnd = new Date(periodStart);
    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - daysAgo);
    const prevPeriodStartMs = prevPeriodStart.getTime();
    const prevPeriodEndMs = prevPeriodEnd.getTime();

    const recentIncome = incomeTransactions.filter(
      (t) => t.createdAt >= periodStartMs
    );
    const recentExpenses = expenseTransactions.filter(
      (t) => t.createdAt >= periodStartMs
    );

    const prevIncome = incomeTransactions.filter(
      (t) => t.createdAt >= prevPeriodStartMs && t.createdAt < prevPeriodEndMs
    );
    const prevExpenses = expenseTransactions.filter(
      (t) => t.createdAt >= prevPeriodStartMs && t.createdAt < prevPeriodEndMs
    );

    if (recentExpenses.length === 0 && recentIncome.length === 0) {
      setAnalysis(null);
      return;
    }

    const totalIncome = recentIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;
    const avgDailyIncome = totalIncome / daysAgo;
    const avgDailyExpenses = totalExpenses / daysAgo;

    const prevTotalIncome = prevIncome.reduce((sum, t) => sum + t.amount, 0);
    const prevTotalExpenses = prevExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const calculateTrend = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const incomeTrend = calculateTrend(totalIncome, prevTotalIncome);
    const expenseTrend = calculateTrend(totalExpenses, prevTotalExpenses);

    // Calculate spending by category
    const spendingByCategory = recentExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const pieChartData = Object.entries(spendingByCategory)
      .map(([name, population]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        population,
        color: getColorForCategory(name)[0],
        legendFontColor: "#333",
        legendFontSize: 12,
      }))
      .sort((a, b) => b.population - a.population);

    // Generate spending trends (last 7 days)
    const trendLabels = [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayExpenses = expenseTransactions
        .filter((t) => t.createdAt >= dayStart && t.createdAt < dayEnd)
        .reduce((sum, t) => sum + t.amount, 0);

      last7Days.push(dayExpenses);
    }

    const largestExpenses = [...recentExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const analysisResult = {
      totalIncome,
      totalExpenses,
      netCashflow,
      savingsRate,
      avgDailyIncome,
      avgDailyExpenses,
      pieChartData,
      largestExpenses,
      trendData: last7Days,
      trendLabels,
      incomeTrend,
      expenseTrend,
    };

    analysisResult.insights = generateInsights(analysisResult);
    setAnalysis(analysisResult);
  }, [incomeTransactions, expenseTransactions, language, selectedPeriod]);

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {["7", "30", "90"].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.activePeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.activePeriodButtonText,
            ]}
          >
            {period === "7"
              ? currentTexts.last7Days
              : period === "30"
                ? currentTexts.last30Days
                : currentTexts.last90Days}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentTexts.title}</Text>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>📊</Text>
        </View>
      </LinearGradient>

      {!analysis ? (
        <View style={styles.centeredMessage}>
          <Text style={styles.noDataText}>{currentTexts.noData}</Text>
          <Text style={styles.noDataSubtext}>💰</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PeriodSelector />

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title={currentTexts.totalIncome}
              value={`₱${analysis.totalIncome.toLocaleString()}`}
              subtitle={`₱${analysis.avgDailyIncome.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })} ${currentTexts.avgDaily}`}
              color="#27ae60"
              icon="💰"
              trend={analysis.incomeTrend}
              trendDirection="up-is-good"
            />
            <MetricCard
              title={currentTexts.totalExpenses}
              value={`₱${analysis.totalExpenses.toLocaleString()}`}
              subtitle={`₱${analysis.avgDailyExpenses.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })} ${currentTexts.avgDaily}`}
              color="#e74c3c"
              icon="💸"
              trend={analysis.expenseTrend}
              trendDirection="up-is-bad"
            />
            <MetricCard
              title={currentTexts.netCashflow}
              value={`₱${analysis.netCashflow.toLocaleString("en-US")}`}
              subtitle={
                analysis.netCashflow >= 0 ? "Positive flow" : "Negative flow"
              }
              color={analysis.netCashflow >= 0 ? "#27ae60" : "#e74c3c"}
              icon={analysis.netCashflow >= 0 ? "📈" : "📉"}
            />
            <MetricCard
              title={currentTexts.savingsRate}
              value={`${analysis.savingsRate.toFixed(1)}%`}
              subtitle={
                analysis.savingsRate >= 20 ? "Excellent!" : "Needs improvement"
              }
              color={
                analysis.savingsRate >= 20
                  ? "#27ae60"
                  : analysis.savingsRate >= 10
                    ? "#f39c12"
                    : "#e74c3c"
              }
              icon="🎯"
            />
          </View>

          {/* Smart Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <AnimatedCard
              style={styles.card}
              delay={200}
            >
              <Text style={styles.cardTitle}>{currentTexts.insights}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.insightsContainer}
              >
                {analysis.insights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    title={insight.title}
                    description={insight.description}
                    type={insight.type}
                    onPress={() =>
                      Alert.alert(insight.title, insight.description)
                    }
                  />
                ))}
              </ScrollView>
            </AnimatedCard>
          )}

          {/* Spending Trends */}
          {analysis.trendData && analysis.trendData.some((d) => d > 0) && (
            <AnimatedCard
              style={styles.card}
              delay={300}
            >
              <Text style={styles.cardTitle}>{currentTexts.trends}</Text>
              <LineChart
                data={{
                  labels: analysis.trendLabels,
                  datasets: [
                    {
                      data: analysis.trendData,
                      color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                      strokeWidth: 3,
                    },
                  ],
                }}
                width={width - 60}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                }}
                bezier
                style={styles.chart}
              />
            </AnimatedCard>
          )}

          {/* Spending Breakdown */}
          {analysis.pieChartData.length > 0 && (
            <AnimatedCard
              style={styles.card}
              delay={400}
            >
              <Text style={styles.cardTitle}>
                {currentTexts.spendingBreakdown}
              </Text>
              <PieChart
                data={analysis.pieChartData}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
              />
              <View style={styles.categoryLegend}>
                {analysis.pieChartData.slice(0, 3).map((item, index) => (
                  <View
                    key={index}
                    style={styles.legendItem}
                  >
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendText}>{item.name}</Text>
                    <Text style={styles.legendAmount}>
                      ₱{item.population.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>
          )}

          {/* Top Expenses */}
          {analysis.largestExpenses.length > 0 && (
            <AnimatedCard
              style={styles.card}
              delay={500}
            >
              <Text style={styles.cardTitle}>
                {currentTexts.largestExpenses}
              </Text>
              {analysis.largestExpenses.map((expense, index) => (
                <View
                  key={index}
                  style={styles.expenseItem}
                >
                  <View style={styles.expenseLeft}>
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: getColorForCategory(
                            expense.category
                          )[0],
                        },
                      ]}
                    >
                      <Text style={styles.categoryBadgeText}>
                        {expense.category.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text style={styles.expenseCategory}>
                        {expense.category.charAt(0).toUpperCase() +
                          expense.category.slice(1)}
                      </Text>
                      <Text style={styles.expenseDescription}>
                        {expense.description}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    ₱{expense.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </AnimatedCard>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerIcon: {
    padding: 8,
  },
  headerIconText: {
    fontSize: 24,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 10,
  },
  noDataSubtext: {
    fontSize: 48,
    opacity: 0.3,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  activePeriodButton: {
    backgroundColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  activePeriodButtonText: {
    color: "#ffffff",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
  },
  trendContainer: {
    alignItems: "flex-end",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  metricTitle: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 10,
    color: "#95a5a6",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  insightsContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  insightCard: {
    width: 200,
    padding: 16,
    borderRadius: 15,
    marginRight: 12,
    minHeight: 100,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 16,
    flex: 1,
  },
  insightArrow: {
    alignItems: "flex-end",
  },
  arrowText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  chart: {
    borderRadius: 16,
    marginHorizontal: -10,
  },
  categoryLegend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: "#2c3e50",
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7f8c8d",
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  expenseLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  expenseDescription: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});

export default DetailedAnalysisScreen;
