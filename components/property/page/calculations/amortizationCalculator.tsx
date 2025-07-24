'use client';

import { useState } from 'react';

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState<number | ''>(''); // Loan Amount
  const [loanTerm, setLoanTerm] = useState<number | ''>(''); // Loan Term in years
  const [interestRate, setInterestRate] = useState<number | ''>(''); // Annual Interest Rate
  const [errorMessage, setErrorMessage] = useState({
    loanTerm: '',
    interestRate: ''
  });

  const calculateMonthlyPayment = () => {
    if (loanAmount && loanTerm && interestRate !== '') {
      const monthlyInterestRate = interestRate / 100 / 12; // Convert annual rate to monthly
      const numberOfPayments = loanTerm * 12; // Total number of payments (months)
      const numerator =
        loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfPayments);
      const denominator =
        Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
      const monthlyPayment = numerator / denominator;

      return monthlyPayment || 0; // Return the calculated monthly payment
    }
    return 0;
  };

  // Validation logic for loan term and interest rate
  const handleLoanTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 60) {
      setErrorMessage((prev) => ({
        ...prev,
        loanTerm: 'Loan Term cannot be greater than 60'
      }));
    } else {
      setErrorMessage((prev) => ({ ...prev, loanTerm: '' }));
    }
    setLoanTerm(value);
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 100) {
      setErrorMessage((prev) => ({
        ...prev,
        interestRate: 'Interest Rate cannot be greater than 100'
      }));
    } else {
      setErrorMessage((prev) => ({ ...prev, interestRate: '' }));
    }
    setInterestRate(value);
  };

  return (
    <div className="my-2 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:text-gray-100">
      <h2 className="mb-4 text-xl font-bold">Amortization Calculator</h2>
      <p className="mb-4">Modify the values to quickly analyze a deal.</p>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300">
            Loan Amount*
          </label>
          <input
            type="number"
            className="rounded border bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter the loan amount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300">
            Loan Term (Years)*
          </label>
          <input
            type="number"
            className={`rounded border p-2 ${
              errorMessage.loanTerm ? 'border-red-500' : 'border-gray-300'
            } 
              bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100`}
            placeholder="Enter number of years"
            value={loanTerm}
            onChange={handleLoanTermChange}
          />
          {errorMessage.loanTerm && (
            <span className="text-sm text-red-500">
              {errorMessage.loanTerm}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300">
            Interest Rate (%) *
          </label>
          <input
            type="number"
            step="0.01"
            className={`rounded border p-2 ${
              errorMessage.interestRate ? 'border-red-500' : 'border-gray-300'
            } 
              bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100`}
            placeholder="Enter the interest rate"
            value={interestRate}
            onChange={handleInterestRateChange}
          />
          {errorMessage.interestRate && (
            <span className="text-sm text-red-500">
              {errorMessage.interestRate}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 text-right">
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          Monthly Payment:{' '}
        </span>
        <span className="font-bold">
          $
          {calculateMonthlyPayment().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
    </div>
  );
}
