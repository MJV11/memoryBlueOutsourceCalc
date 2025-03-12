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
    MonthlyFeePerSDR: 11500, // memoryBlue offers services at 11500 monthly per SDR contracted
    MonthlyLicensesAndSalesToolsCostPerSDR: 225,
    MonthlyInfrastructureAndFacilitiesCostPerSDR: 350,
    RecruitmentCostPerSDR: 7200,
    OnboardingAndTrainingCostPerSDR: 8800,
    MonthlyTurnoverRate: 30 / 12, // 30% is the bottom of the national yearly average
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
      MonthlyTurnoverRate
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
    
    // Monthly operational costs
    const monthlyOperationalCosts = MonthlyLicensesAndSalesToolsCostPerSDR + 
                                    MonthlyInfrastructureAndFacilitiesCostPerSDR;
    
    // Monthly turnover costs (recruitment and training costs spread monthly based on turnover rate)
    const monthlyTurnoverCosts = (RecruitmentCostPerSDR + OnboardingAndTrainingCostPerSDR) * 
                                (MonthlyTurnoverRate / 100);
    
    // Total monthly cost per in-house SDR
    const totalMonthlyInHouseCostPerSDR = monthlyDirectCostPerSDR + 
                                         monthlyOperationalCosts + 
                                         monthlyTurnoverCosts;
    
    // Total yearly in-house cost per SDR
    const totalYearlyInHouseCostPerSDR = totalMonthlyInHouseCostPerSDR * 12;
    
    // Total cost for all SDRs
    const totalMonthlyInHouseCostForAllSDRs = totalMonthlyInHouseCostPerSDR * SDRsSeekingToHire;
    const totalYearlyInHouseCostForAllSDRs = totalYearlyInHouseCostPerSDR * SDRsSeekingToHire;
    
    // memoryBlue service cost calculations
    const monthlyMemoryBlueCost = MonthlyFeePerSDR;
    const yearlyMemoryBlueCost = monthlyMemoryBlueCost * 12;
    const totalMonthlyMemoryBlueCostForAllSDRs = monthlyMemoryBlueCost * SDRsSeekingToHire;
    const totalYearlyMemoryBlueCostForAllSDRs = yearlyMemoryBlueCost * SDRsSeekingToHire;
    
    // Cost comparison and savings
    const monthlySavingsPerSDR = totalMonthlyInHouseCostPerSDR - monthlyMemoryBlueCost;
    const yearlySavingsPerSDR = totalYearlyInHouseCostPerSDR - yearlyMemoryBlueCost;
    const totalMonthlySavings = monthlySavingsPerSDR * SDRsSeekingToHire;
    const totalYearlySavings = yearlySavingsPerSDR * SDRsSeekingToHire;
    
    // Calculate percentage savings
    const savingsPercentage = (yearlySavingsPerSDR / totalYearlyInHouseCostPerSDR) * 100;
    
    // Return all calculations
    return {
      // In-house cost breakdowns
      payrollTaxPerSDR,
      benefitsCostPerSDR,
      managerCostAllocation,
      yearlyDirectCostPerSDR,
      monthlyDirectCostPerSDR,
      monthlyOperationalCosts,
      monthlyTurnoverCosts,
      
      // Total in-house costs
      totalMonthlyInHouseCostPerSDR,
      totalYearlyInHouseCostPerSDR,
      totalMonthlyInHouseCostForAllSDRs,
      totalYearlyInHouseCostForAllSDRs,
      
      // memoryBlue costs
      monthlyMemoryBlueCost,
      yearlyMemoryBlueCost,
      totalMonthlyMemoryBlueCostForAllSDRs,
      totalYearlyMemoryBlueCostForAllSDRs,
      
      // Savings
      monthlySavingsPerSDR,
      yearlySavingsPerSDR,
      totalMonthlySavings,
      totalYearlySavings,
      savingsPercentage
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
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">SDR Cost Calculator: In-House vs. memoryBlue</h1>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-800">
          This calculator helps you compare the cost of hiring Sales Development Representatives (SDRs) in-house 
          versus using memoryBlue's outsourced SDR services. Enter your company-specific values to get a 
          personalized cost comparison.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-3">Company-Specific Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Yearly Salary Per SDR */}
            <div>
              <label htmlFor="YearlySalaryPerSDR" className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Salary Per SDR ($)
              </label>
              <input
                type="number"
                id="YearlySalaryPerSDR"
                name="YearlySalaryPerSDR"
                value={formData.YearlySalaryPerSDR}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md ${errors.YearlySalaryPerSDR ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.YearlySalaryPerSDR && <p className="mt-1 text-sm text-red-600">{errors.YearlySalaryPerSDR}</p>}
            </div>
            
            {/* Avg Yearly Commissions Per SDR */}
            <div>
              <label htmlFor="AvgYearlyCommissionsPerSDR" className="block text-sm font-medium text-gray-700 mb-1">
                Avg Yearly Commissions Per SDR ($)
              </label>
              <input
                type="number"
                id="AvgYearlyCommissionsPerSDR"
                name="AvgYearlyCommissionsPerSDR"
                value={formData.AvgYearlyCommissionsPerSDR}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md ${errors.AvgYearlyCommissionsPerSDR ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.AvgYearlyCommissionsPerSDR && <p className="mt-1 text-sm text-red-600">{errors.AvgYearlyCommissionsPerSDR}</p>}
            </div>
            
            {/* Payroll Tax Rate */}
            <div>
              <label htmlFor="PayrollTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
                Payroll Tax Rate (%)
              </label>
              <input
                type="number"
                id="PayrollTaxRate"
                name="PayrollTaxRate"
                value={formData.PayrollTaxRate}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md ${errors.PayrollTaxRate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.PayrollTaxRate && <p className="mt-1 text-sm text-red-600">{errors.PayrollTaxRate}</p>}
            </div>
            
            {/* Benefits Rate */}
            <div>
              <label htmlFor="BenefitsRate" className="block text-sm font-medium text-gray-700 mb-1">
                Benefits Rate (% of Salary)
              </label>
              <input
                type="number"
                id="BenefitsRate"
                name="BenefitsRate"
                value={formData.BenefitsRate}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md ${errors.BenefitsRate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.BenefitsRate && <p className="mt-1 text-sm text-red-600">{errors.BenefitsRate}</p>}
            </div>
            
            {/* Yearly Salary Per Manager */}
            <div>
              <label htmlFor="YearlySalaryPerManager" className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Salary Per SDR Manager ($)
              </label>
              <input
                type="number"
                id="YearlySalaryPerManager"
                name="YearlySalaryPerManager"
                value={formData.YearlySalaryPerManager}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md ${errors.YearlySalaryPerManager ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.YearlySalaryPerManager && <p className="mt-1 text-sm text-red-600">{errors.YearlySalaryPerManager}</p>}
            </div>
            
            {/* SDRs Per Manager */}
            <div>
              <label htmlFor="SDRsPerManager" className="block text-sm font-medium text-gray-700 mb-1">
                SDRs Per Manager
              </label>
              <input
                type="number"
                id="SDRsPerManager"
                name="SDRsPerManager"
                value={formData.SDRsPerManager}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md ${errors.SDRsPerManager ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.SDRsPerManager && <p className="mt-1 text-sm text-red-600">{errors.SDRsPerManager}</p>}
            </div>
            
            {/* SDRs Seeking To Hire */}
            <div>
              <label htmlFor="SDRsSeekingToHire" className="block text-sm font-medium text-gray-700 mb-1">
                Number of SDRs Seeking To Hire
              </label>
              <input
                type="number"
                id="SDRsSeekingToHire"
                name="SDRsSeekingToHire"
                value={formData.SDRsSeekingToHire}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md ${errors.SDRsSeekingToHire ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.SDRsSeekingToHire && <p className="mt-1 text-sm text-red-600">{errors.SDRsSeekingToHire}</p>}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Reset Values
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Calculate Costs
          </button>
        </div>
      </form>
      
      {isSubmitted && results && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-center mb-4">Cost Comparison Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In-House Costs Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">In-House SDR Costs</h3>
              
              <div className="space-y-2 mb-4">
                <p className="flex justify-between">
                  <span>Base Salary:</span>
                  <span>{formatCurrency(formData.YearlySalaryPerSDR)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Average Commissions:</span>
                  <span>{formatCurrency(formData.AvgYearlyCommissionsPerSDR)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Payroll Taxes:</span>
                  <span>{formatCurrency(results.payrollTaxPerSDR)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Benefits Cost:</span>
                  <span>{formatCurrency(results.benefitsCostPerSDR)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Manager Cost Allocation:</span>
                  <span>{formatCurrency(results.managerCostAllocation)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Licenses & Tools:</span>
                  <span>{formatCurrency(fixedData.MonthlyLicensesAndSalesToolsCostPerSDR * 12)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Infrastructure & Facilities:</span>
                  <span>{formatCurrency(fixedData.MonthlyInfrastructureAndFacilitiesCostPerSDR * 12)}/year</span>
                </p>
                <p className="flex justify-between">
                  <span>Recruitment & Turnover:</span>
                  <span>{formatCurrency(results.monthlyTurnoverCosts * 12)}/year</span>
                </p>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <p className="flex justify-between font-semibold">
                  <span>Total Cost Per SDR:</span>
                  <span>{formatCurrency(results.totalYearlyInHouseCostPerSDR)}/year</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>Monthly Cost Per SDR:</span>
                  <span>{formatCurrency(results.totalMonthlyInHouseCostPerSDR)}/month</span>
                </p>
                <p className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total In-House Cost ({formData.SDRsSeekingToHire} SDRs):</span>
                  <span>{formatCurrency(results.totalYearlyInHouseCostForAllSDRs)}/year</span>
                </p>
              </div>
            </div>
            
            {/* memoryBlue Costs Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">memoryBlue SDR Services</h3>
              
              <div className="space-y-2 mb-4">
                <p className="flex justify-between">
                  <span>Monthly Fee Per SDR:</span>
                  <span>{formatCurrency(fixedData.MonthlyFeePerSDR)}/month</span>
                </p>
                <p className="flex justify-between italic text-sm text-gray-600">
                  <span>No additional costs for:</span>
                  <span></span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>• Recruitment & Training</span>
                  <span>Included</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>• Licenses & Technology</span>
                  <span>Included</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>• Management</span>
                  <span>Included</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>• Infrastructure</span>
                  <span>Included</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>• Payroll Taxes & Benefits</span>
                  <span>Included</span>
                </p>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <p className="flex justify-between font-semibold">
                  <span>Cost Per SDR:</span>
                  <span>{formatCurrency(results.yearlyMemoryBlueCost)}/year</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>Monthly Cost Per SDR:</span>
                  <span>{formatCurrency(results.monthlyMemoryBlueCost)}/month</span>
                </p>
                <p className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total memoryBlue Cost ({formData.SDRsSeekingToHire} SDRs):</span>
                  <span>{formatCurrency(results.totalYearlyMemoryBlueCostForAllSDRs)}/year</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Savings Summary */}
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold mb-3 text-green-800">Potential Savings with memoryBlue</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="flex justify-between font-medium">
                  <span>Monthly Savings Per SDR:</span>
                  <span>{formatCurrency(results.monthlySavingsPerSDR)}</span>
                </p>
                <p className="flex justify-between font-medium">
                  <span>Yearly Savings Per SDR:</span>
                  <span>{formatCurrency(results.yearlySavingsPerSDR)}</span>
                </p>
              </div>
              
              <div>
                <p className="flex justify-between font-medium">
                  <span>Total Monthly Savings:</span>
                  <span>{formatCurrency(results.totalMonthlySavings)}</span>
                </p>
                <p className="flex justify-between font-bold">
                  <span>Total Yearly Savings:</span>
                  <span>{formatCurrency(results.totalYearlySavings)}</span>
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t text-center">
              <p className="text-xl font-bold text-green-700">
                Potential Cost Savings: {formatPercentage(results.savingsPercentage)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Based on your inputs, using memoryBlue's services could save approximately {formatCurrency(results.totalYearlySavings)} per year 
                compared to hiring in-house SDRs.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={handleReset} 
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              Start Over
            </button>
            <button 
              onClick={handleRecalculate} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Recalculate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;