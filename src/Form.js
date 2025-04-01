import React, { useState } from "react";

// Main Form Component
const Form = () => {
  // All provided figures given by national averages. If given a range, the conservative values are selected.
  // State to store all form field values. These are given by the user and overwrite the default ones given below.
  const [formData, setFormData] = useState({
    YearlySalaryPerSDR: 65000,
    AvgYearlyCommissionsPerSDR: 36000,
    PayrollTaxRate: 7.65, // Percentage
    YearlySalaryPerManager: 137000,
    SDRsPerManager: 7,
    SDRsSeekingToHire: 7,
    BenefitsRate: 20, // Default 20% of salary for benefits
  });

  const [fixedData, setFixedData] = useState({
    MonthlyFeePerSDR: 11500, // MemoryBlue offers services at 11500 monthly per SDR contracted
    MonthlyLicensesAndSalesToolsCostPerSDR: 225,
    MonthlyInfrastructureAndFacilitiesCostPerSDR: 350,
    RecruitmentCostPerSDR: 7200,
    OnboardingAndTrainingCostPerSDR: 8800,
    MonthlyTurnoverRate: 30 / 12, // 30% is the bottom of the national yearly average
    LegalandCompliance: 0,
  });

  // State to track form submission status
  const [isSubmitted, setIsSubmitted] = useState(false);
  // State to track validation errors
  const [errors, setErrors] = useState({});
  // State to track calculated results
  const [results, setResults] = useState(null);

  // Handle input changes for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert input to number and ensure it's valid !! Needed not just for form inputs but also for cybersecurity
    const numericValue = parseFloat(value) || 0;

    setFormData(prevData => ({
      ...prevData,
      [name]: numericValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Calculate costs based on form data
  const calculateCosts = () => {
    // Destructure values for easier reference
    const {
      YearlySalaryPerSDR,
      AvgYearlyCommissionsPerSDR,
      PayrollTaxRate,
      YearlySalaryPerManager,
      SDRsPerManager,
      SDRsSeekingToHire,
      BenefitsRate
    } = formData;

    const {
      MonthlyFeePerSDR,
      MonthlyLicensesAndSalesToolsCostPerSDR,
      MonthlyInfrastructureAndFacilitiesCostPerSDR,
      RecruitmentCostPerSDR,
      OnboardingAndTrainingCostPerSDR,
      MonthlyTurnoverRate,
      LegalandCompliance
    } = fixedData;

    // Calculate in-house costs
    const payrollTaxPerSDR = (YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR) * (PayrollTaxRate / 100);
    const benefitsCostPerSDR = YearlySalaryPerSDR * (BenefitsRate / 100);

    // Calculate manager cost allocation
    // This represents the cost of management spread across the SDR team
    const managerCostAllocation = (YearlySalaryPerManager / SDRsPerManager);

    // Calculate total yearly direct cost per SDR
    const yearlyDirectCostPerSDR = YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR +
      payrollTaxPerSDR + benefitsCostPerSDR + managerCostAllocation;

    // Monthly direct cost per SDR
    const monthlyDirectCostPerSDR = yearlyDirectCostPerSDR / 12;

    const totalMonthlyInHouse = MonthlyInfrastructureAndFacilitiesCostPerSDR + managerCostAllocation / 12
      + OnboardingAndTrainingCostPerSDR * MonthlyTurnoverRate / 100 + RecruitmentCostPerSDR * MonthlyTurnoverRate / 100
      + MonthlyLicensesAndSalesToolsCostPerSDR + benefitsCostPerSDR / 12 + payrollTaxPerSDR / 12 + AvgYearlyCommissionsPerSDR / 12 +
      + YearlySalaryPerSDR / 12 + LegalandCompliance

    // Return all calculations
    return {
      // In-house cost breakdowns
      payrollTaxPerSDR,
      benefitsCostPerSDR,
      managerCostAllocation,
      yearlyDirectCostPerSDR,
      monthlyDirectCostPerSDR,
      totalMonthlyInHouse,
    };
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Check for negative numbers
    Object.entries(formData).forEach(([key, value]) => {
      if (value < 0) {
        newErrors[key] = "Value cannot be negative";
      }
    });

    // Validate specific fields
    if (formData.SDRsPerManager <= 0) {
      newErrors.SDRsPerManager = "Must have at least 1 SDR per manager";
    }

    if (formData.SDRsSeekingToHire <= 0) {
      newErrors.SDRsSeekingToHire = "Must be hiring at least 1 SDR";
    }

    if (formData.PayrollTaxRate <= 0 || formData.PayrollTaxRate > 100) {
      newErrors.PayrollTaxRate = "Tax rate must be between 0 and 100 percent";
    }

    if (formData.BenefitsRate < 0 || formData.BenefitsRate > 100) {
      newErrors.BenefitsRate = "Benefits rate must be between 0 and 100 percent";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = validateForm();

    if (isValid) {
      // Calculate the costs
      const calculatedResults = calculateCosts();
      setResults(calculatedResults);
      setIsSubmitted(true);
    }
  };

  // Handle key press events - submit on Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Reset form to start over
  const handleReset = () => {
    setFormData({
      YearlySalaryPerSDR: 65000,
      AvgYearlyCommissionsPerSDR: 36000,
      PayrollTaxRate: 7.65,
      YearlySalaryPerManager: 137000,
      SDRsPerManager: 7,
      SDRsSeekingToHire: 7,
      BenefitsRate: 20,
    });
    setErrors({});
    setIsSubmitted(false);
    setResults(null);
  };

  // Recalculate with current values
  const handleRecalculate = () => {
    handleSubmit({ preventDefault: () => { } });
  };

  return (
    <div className="max-w-4xl  bg-white flex-center flex-column">
      <h1 className="text-2xl font-bold justify-center">Insourcing vs. Outsourcing Calculator</h1>

      <p className="justify-center">
        This calculator helps you compare the cost of hiring Sales Development Representatives (SDRs) in-house
        versus using MemoryBlue's outsourced SDR services. Enter your company-specific values to get a
        personalized cost comparison.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex-center flex-column justify-center">
          <h2 className="text-lg font-semibold">Compare Costs:</h2>
          <div className="">
            {/* Yearly Salary Per SDR */}
            <div>
              <label htmlFor="YearlySalaryPerSDR" className="block text-sm">Yearly Salary per SDR:</label>
            </div>
            <div>
              <input
                type="number"
                id="YearlySalaryPerSDR"
                name="YearlySalaryPerSDR"
                value={formData.YearlySalaryPerSDR}
                onChange={handleChange}
                className={`input text-medium  ${errors.YearlySalaryPerSDR ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.YearlySalaryPerSDR && <p className="text-sm">{errors.YearlySalaryPerSDR}</p>}
            </div>

            {/* Avg Yearly Commissions Per SDR */}
            <div>
              <label htmlFor="AvgYearlyCommissionsPerSDR" className="block text-sm">Average Yearly Commissions:</label>
            </div><div>
              <input
                type="number"
                id="AvgYearlyCommissionsPerSDR"
                name="AvgYearlyCommissionsPerSDR"
                value={formData.AvgYearlyCommissionsPerSDR}
                onChange={handleChange}
                className={`input text-medium  ${errors.AvgYearlyCommissionsPerSDR ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.AvgYearlyCommissionsPerSDR && <p className="text-sm">{errors.AvgYearlyCommissionsPerSDR}</p>}
            </div>

            {/* Payroll Tax Rate */}
            <div>
              <label htmlFor="PayrollTaxRate" className="block text-sm"> Payroll Tax Rate:</label>
            </div>
            <div>
              <input
                type="number"
                id="PayrollTaxRate"
                name="PayrollTaxRate"
                value={formData.PayrollTaxRate}
                onChange={handleChange}
                step="0.01"
                className={`input text-medium  ${errors.PayrollTaxRate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.PayrollTaxRate && <p className="text-sm">{errors.PayrollTaxRate}</p>}
            </div>

            {/* Benefits Rate */}
            <div>
              <label htmlFor="BenefitsRate" className="block text-sm">Benefits Rate (% of Salary):</label>
            </div>
            <div>
              <input
                type="number"
                id="BenefitsRate"
                name="BenefitsRate"
                value={formData.BenefitsRate}
                onChange={handleChange}
                step="0.1"
                className={`input text-medium  ${errors.BenefitsRate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.BenefitsRate && <p className="text-sm">{errors.BenefitsRate}</p>}
            </div>

            {/* Yearly Salary Per Manager */}
            <div>
              <label htmlFor="YearlySalaryPerManager" className="block text-sm">Yearly Salary per SDR Manager:</label>
            </div>
            <div>
              <input
                type="number"
                id="YearlySalaryPerManager"
                name="YearlySalaryPerManager"
                value={formData.YearlySalaryPerManager}
                onChange={handleChange}
                className={`input text-medium  ${errors.YearlySalaryPerManager ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.YearlySalaryPerManager && <p className="text-sm">{errors.YearlySalaryPerManager}</p>}
            </div>

            {/* SDRs Per Manager */}
            <div>
              <label htmlFor="SDRsPerManager" className="block text-sm">SDRs Per Manager:</label>
            </div>
            <div>
              <input
                type="number"
                id="SDRsPerManager"
                name="SDRsPerManager"
                value={formData.SDRsPerManager}
                onChange={handleChange}
                className={`input text-medium  ${errors.SDRsPerManager ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.SDRsPerManager && <p className="text-sm">{errors.SDRsPerManager}</p>}
            </div>

            {/* SDRs Seeking To Hire */}
            <div>
              <label htmlFor="SDRsSeekingToHire" className="block text-sm">Number of SDRs Seeking To Hire:</label>
            </div>
            <div>
              <input
                type="number"
                id="SDRsSeekingToHire"
                name="SDRsSeekingToHire"
                value={formData.SDRsSeekingToHire}
                onChange={handleChange}
                className={`input text-medium  ${errors.SDRsSeekingToHire ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.SDRsSeekingToHire && <p className="text-sm">{errors.SDRsSeekingToHire}</p>}
            </div>
          </div>
          <div className="flex-column flex-center">
            <button type="button" onClick={handleReset} className="input-button text-medium">Reset Values</button>
            <button type="submit" className="input-button text-medium">Calculate Costs</button>
          </div>
        </div>
      </form>

      {isSubmitted && results && (
        <div className="export-table flex-center flex-column">
          <h2 className="text-xl font-bold justify-center calc-results"> Cost Comparison Results</h2>
          <h3 className="text-lg font-semibold justify-center table-subheading" col-span="3">Direct Monthly Costs per SDR</h3>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="text-lg font-semibold"> </th>
                <th className="text-lg font-semibold justify-center"> In-House </th>
                <th className="text-lg font-semibold justify-center"> MemoryBlue </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-medium justify-left">Monthly Fee:</td>
                <td lassName="text-medium justify-center"></td>
                <td className="text-medium justify-center">{formatCurrency(fixedData.MonthlyFeePerSDR)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Salary:</td>
                <td className="text-medium justify-center">{formatCurrency(formData.YearlySalaryPerSDR / 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Commissions:</td>
                <td className="text-medium justify-center">{formatCurrency(formData.AvgYearlyCommissionsPerSDR / 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Payroll Tax:</td>
                <td className="text-medium justify-center">{formatCurrency(results.payrollTaxPerSDR / 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Benefits:</td>
                <td className="text-medium justify-center">{formatCurrency(results.benefitsCostPerSDR / 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Tools and Licenses:</td>
                <td className="text-medium justify-center">{formatCurrency(fixedData.MonthlyLicensesAndSalesToolsCostPerSDR)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left font-semisemibold">Total Direct Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(fixedData.MonthlyLicensesAndSalesToolsCostPerSDR
                  + results.benefitsCostPerSDR / 12 + results.payrollTaxPerSDR / 12 + formData.AvgYearlyCommissionsPerSDR / 12 +
                  + formData.YearlySalaryPerSDR / 12)}</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(fixedData.MonthlyFeePerSDR)}</td>
              </tr>
            </tbody>
          </table>
          <h3 className="text-lg font-semibold justify-center table-subheading">Indirect Monthly Costs per SDR</h3>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="text-lg font-semibold"> </th>
                <th className="text-lg font-semibold justify-center"> In-House </th>
                <th className="text-lg font-semibold justify-center"> MemoryBlue </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-medium justify-left">Management:</td>
                <td className="text-medium justify-center">{formatCurrency(results.managerCostAllocation / 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Infrastructure:</td>
                <td className="text-medium justify-center">{formatCurrency(fixedData.MonthlyInfrastructureAndFacilitiesCostPerSDR)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Recruiting:</td>
                <td className="text-medium justify-center">{formatCurrency(
                  (fixedData.RecruitmentCostPerSDR) * fixedData.MonthlyTurnoverRate / 100
                )}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Onboarding:</td>
                <td className="text-medium justify-center">{formatCurrency(
                  (fixedData.OnboardingAndTrainingCostPerSDR) * fixedData.MonthlyTurnoverRate / 100
                )}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Legal and Compliance:</td>
                <td className="text-medium justify-center">{formatCurrency(
                  fixedData.LegalandCompliance
                )}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left font-semisemibold">Total Indirect Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(
                  fixedData.MonthlyInfrastructureAndFacilitiesCostPerSDR + results.managerCostAllocation / 12
                  + (fixedData.OnboardingAndTrainingCostPerSDR) * fixedData.MonthlyTurnoverRate / 100
                  + (fixedData.RecruitmentCostPerSDR) * fixedData.MonthlyTurnoverRate / 100
                )}</td>
              </tr>
            </tbody>
          </table>
          <h3 className="text-lg font-semibold justify-center table-subheading">One-Time Startup Costs per SDR</h3>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="text-lg font-semibold"> </th>
                <th className="text-lg font-semibold justify-center"> In-House </th>
                <th className="text-lg font-semibold justify-center"> MemoryBlue </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-medium justify-left">Recruiting:</td>
                <td className="text-medium justify-center">{formatCurrency(
                  (fixedData.RecruitmentCostPerSDR)
                )}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left">Onboarding:</td>
                <td className="text-medium justify-center">{formatCurrency(
                  (fixedData.OnboardingAndTrainingCostPerSDR)
                )}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left font-semisemibold">Total Startup Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(
                  (fixedData.OnboardingAndTrainingCostPerSDR)
                  + (fixedData.RecruitmentCostPerSDR)
                )}</td>
              </tr>
            </tbody>
          </table>
          <h3 className="text-lg font-semibold justify-center table-subheading">First Year Costs per SDR</h3>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="text-lg font-semibold"> </th>
                <th className="text-lg font-semibold justify-center"> In-House </th>
                <th className="text-lg font-semibold justify-center"> MemoryBlue </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-medium justify-left font-semisemibold">Total Monthly Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(results.totalMonthlyInHouse)}</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(fixedData.MonthlyFeePerSDR)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left font-semisemibold">Total Yearly Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(results.totalMonthlyInHouse * 12)}</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(fixedData.MonthlyFeePerSDR * 12)}</td>
              </tr>
              <tr>
                <td className="text-medium justify-left font-semisemibold">First Year Cost:</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(results.totalMonthlyInHouse * 12
                  + (fixedData.OnboardingAndTrainingCostPerSDR) + (fixedData.RecruitmentCostPerSDR))}</td>
                <td className="text-medium justify-center font-semisemibold">{formatCurrency(fixedData.MonthlyFeePerSDR * 12)}</td>
              </tr>
            </tbody>
          </table>


          <h3 className="text-lg font-semibold justify-center table-subheading">Savings</h3>
          <table className="calc-table">
            <tr>
              <td className="text-medium justify-left font-semisemibold">Yearly Savings per SDR: </td>
              <td className="text-medium justify-left font-semisemibold">{formatCurrency(results.totalMonthlyInHouse * 12
                + (fixedData.OnboardingAndTrainingCostPerSDR)
                + (fixedData.RecruitmentCostPerSDR)
                - fixedData.MonthlyFeePerSDR * 12)}</td>
            </tr>
            <tr>
              <td className="text-medium justify-left font-semisemibold">Yearly Savings for {formData.SDRsSeekingToHire} SDRs: </td>
              <td className="text-medium justify-left font-semisemibold">{formatCurrency((results.totalMonthlyInHouse * 12
                + (fixedData.OnboardingAndTrainingCostPerSDR)
                + (fixedData.RecruitmentCostPerSDR)
                - fixedData.MonthlyFeePerSDR * 12) * formData.SDRsSeekingToHire)}</td>
            </tr>
          </table>
          <h3 className="text-lg font-semibold justify-center table-subheading">Additional Considerations</h3>
          <div className="text-medium justify-left">
            Outsourcing to experienced professionals often yields higher pipeline throughput than starting
            an in-house team. Outsourcing allows clients to rapidly scale up and down, including for seasonal sales efforts.
            Outsourcing offers flexibility in hiring and firing, but without worrying about finding the right fit for your team
            or developing the right brand and culture.
            Additionally, outsourcing avoids the opportunity cost of lost revenue when training the initial team,
            whereas the outsourced team can jump right into the pipeline. Similarly, outsourcing avoids lost revenue to turnover
            and spending on unproductive time.
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;