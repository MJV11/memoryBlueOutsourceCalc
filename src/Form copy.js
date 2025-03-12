import React, { useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const Form = () => {
  const [formData, setFormData] = useState({
    YearlySalaryPerSDR: 65000,
    AvgYearlyCommissionsPerSDR: 36000,
    PayrollTaxRate: 7.65,
    YearlySalaryPerManager: 137000,
    SDRsPerManager: 7,
    SDRsSeekingToHire: 7,
    BenefitsRate: 20,
  });

  const [fixedData] = useState({
    MonthlyFeePerSDR: 11500,
    MonthlyLicensesAndSalesToolsCostPerSDR: 225,
    MonthlyInfrastructureAndFacilitiesCostPerSDR: 350,
    RecruitmentCostPerSDR: 7200,
    OnboardingAndTrainingCostPerSDR: 8800,
    MonthlyTurnoverRate: 30 / 12,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: parseFloat(value) || 0 }));
  };

  const calculateCosts = () => {
    const {
      YearlySalaryPerSDR, AvgYearlyCommissionsPerSDR, PayrollTaxRate,
      YearlySalaryPerManager, SDRsPerManager, SDRsSeekingToHire, BenefitsRate
    } = formData;

    const {
      MonthlyFeePerSDR, MonthlyLicensesAndSalesToolsCostPerSDR, MonthlyInfrastructureAndFacilitiesCostPerSDR,
      RecruitmentCostPerSDR, OnboardingAndTrainingCostPerSDR, MonthlyTurnoverRate
    } = fixedData;

    const payrollTaxPerSDR = (YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR) * (PayrollTaxRate / 100);
    const benefitsCostPerSDR = YearlySalaryPerSDR * (BenefitsRate / 100);
    const managerCostAllocation = (YearlySalaryPerManager / SDRsPerManager);

    const yearlyDirectCostPerSDR = YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR + payrollTaxPerSDR + benefitsCostPerSDR + managerCostAllocation;
    const monthlyDirectCostPerSDR = yearlyDirectCostPerSDR / 12;

    const monthlyOperationalCosts = MonthlyLicensesAndSalesToolsCostPerSDR + MonthlyInfrastructureAndFacilitiesCostPerSDR;
    const monthlyTurnoverCosts = (RecruitmentCostPerSDR + OnboardingAndTrainingCostPerSDR) * (MonthlyTurnoverRate / 100);

    const totalMonthlyInHouseCostPerSDR = monthlyDirectCostPerSDR + monthlyOperationalCosts + monthlyTurnoverCosts;
    const totalYearlyInHouseCostPerSDR = totalMonthlyInHouseCostPerSDR * 12;

    const totalMonthlyInHouseCostForAllSDRs = totalMonthlyInHouseCostPerSDR * SDRsSeekingToHire;
    const totalYearlyInHouseCostForAllSDRs = totalYearlyInHouseCostPerSDR * SDRsSeekingToHire;

    const monthlyMemoryBlueCost = MonthlyFeePerSDR;
    const yearlyMemoryBlueCost = monthlyMemoryBlueCost * 12;
    const totalMonthlyMemoryBlueCostForAllSDRs = monthlyMemoryBlueCost * SDRsSeekingToHire;
    const totalYearlyMemoryBlueCostForAllSDRs = yearlyMemoryBlueCost * SDRsSeekingToHire;

    const monthlySavingsPerSDR = totalMonthlyInHouseCostPerSDR - monthlyMemoryBlueCost;
    const yearlySavingsPerSDR = totalYearlyInHouseCostPerSDR - yearlyMemoryBlueCost;
    const totalMonthlySavings = monthlySavingsPerSDR * SDRsSeekingToHire;
    const totalYearlySavings = yearlySavingsPerSDR * SDRsSeekingToHire;

    const savingsPercentage = (yearlySavingsPerSDR / totalYearlyInHouseCostPerSDR) * 100;

    return {
      totalMonthlyInHouseCostForAllSDRs, totalYearlyInHouseCostForAllSDRs,
      totalMonthlyMemoryBlueCostForAllSDRs, totalYearlyMemoryBlueCostForAllSDRs,
      totalMonthlySavings, totalYearlySavings, savingsPercentage
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedResults = calculateCosts();
    setResults(calculatedResults);
    setIsSubmitted(true);
  };

  const MyDocument = ({ results }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>SDR Cost Comparison Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Total In-House Cost</Text>
          <Text style={styles.text}>Monthly: {formatCurrency(results.totalMonthlyInHouseCostForAllSDRs)}</Text>
          <Text style={styles.text}>Yearly: {formatCurrency(results.totalYearlyInHouseCostForAllSDRs)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Total memoryBlue Cost</Text>
          <Text style={styles.text}>Monthly: {formatCurrency(results.totalMonthlyMemoryBlueCostForAllSDRs)}</Text>
          <Text style={styles.text}>Yearly: {formatCurrency(results.totalYearlyMemoryBlueCostForAllSDRs)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Savings</Text>
          <Text style={styles.text}>Monthly: {formatCurrency(results.totalMonthlySavings)}</Text>
          <Text style={styles.text}>Yearly: {formatCurrency(results.totalYearlySavings)}</Text>
          <Text style={styles.text}>Savings Percentage: {formatPercentage(results.savingsPercentage)}</Text>
        </View>
      </Page>
    </Document>
  );

  const styles = StyleSheet.create({
    page: { padding: 30 },
    headerContainer: { textAlign: "center", marginBottom: 20 },
    header: { fontSize: 18, fontWeight: "bold" },
    section: { marginBottom: 15 },
    subHeader: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
    text: { fontSize: 12 }
  });

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key.replace(/([A-Z])/g, " $1")}:</label>
            <input type="number" name={key} value={formData[key]} onChange={handleChange} />
          </div>
        ))}
        <button type="submit">Calculate</button>
      </form>

      {isSubmitted && results && (
        <div>
          <h2>Results</h2>
          <p>Total In-House Cost (Yearly): {formatCurrency(results.totalYearlyInHouseCostForAllSDRs)}</p>
          <p>Total memoryBlue Cost (Yearly): {formatCurrency(results.totalYearlyMemoryBlueCostForAllSDRs)}</p>
          <p>Total Savings (Yearly): {formatCurrency(results.totalYearlySavings)}</p>
          <p>Savings Percentage: {formatPercentage(results.savingsPercentage)}</p>

          <PDFDownloadLink document={<MyDocument results={results} />} fileName="SDR_Cost_Comparison.pdf">
            {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default Form;
