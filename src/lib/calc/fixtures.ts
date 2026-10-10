import type { RentalInput } from './rental';

/** Jeu de données de référence partagé par les tests. */
export const RENTAL: RentalInput = {
  price: 150000, notaryRate: 0.08, works: 10000, furniture: 0, monthlyRent: 750, vacancyMonths: 1,
  propertyTax: 900, coOwnership: 600, insurancePno: 150, managementRate: 0, maintenanceRate: 0.05,
  downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
  regime: 'aucune', marginalRate: 0.3, socialRate: 0.172, microAllowance: 0.3, annualDepreciation: 0,
  appreciation: 0, indexation: 0, horizon: 20,
};
