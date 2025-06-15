/**
 * Calculate discount amount based on weight and discount percentage
 */
export const calculateDiscountAmount = (
  weight: number,
  discountPercentage: number
): number => {
  if (!weight || !discountPercentage) return 0;
  return Math.round((weight * discountPercentage) / 100);
};

/**
 * Calculate the net weight after applying discount
 */
export const calculateNetWeight = (
  grossWeight: number,
  discountAmount: number
): number => {
  if (!grossWeight) return 0;
  if (!discountAmount) return grossWeight;
  return Math.round(grossWeight - discountAmount);
};

/**
 * Calculate discount percentage based on gross weight and discount amount
 */
export const calculateDiscountPercentage = (
  grossWeight: number,
  discountAmount: number
): number => {
  if (!grossWeight || !discountAmount) return 0;
  return Math.round((discountAmount / grossWeight) * 100);
};

/**
 * Calculate total contract quantity including additional kilos
 */
export const calculateTotalContractQuantity = (
  bagQuantity: number,
  bagCount: number,
  additionalKilos: number = 0
): number => {
  if (!bagQuantity || !bagCount) return 0;
  const quantityPerKilo = bagQuantity / 50; // Calculate contract quantity per kilo
  const bagsQuantity = bagQuantity * bagCount;
  const additionalQuantity = additionalKilos * quantityPerKilo;
  return Math.round(bagsQuantity + additionalQuantity);
};

/**
 * Calculate free quantity (weight outside contract)
 */
export const calculateFreeQuantity = (
  netWeight: number,
  contractQuantity: number
): number => {
  if (!netWeight) return 0;
  const freeQuantity = netWeight - contractQuantity;
  return Math.max(0, Math.round(freeQuantity));
};

/**
 * Calculate total contract amount
 */
export const calculateContractAmount = (
  contractPrice: number,
  contractQuantity: number,
  netWeight: number
): number => {
  if (!contractPrice) return 0;
  
  if (contractQuantity >= netWeight) {
    return Math.round(netWeight * contractPrice);
  }
  
  return Math.round(contractQuantity * contractPrice);
};

/**
 * Calculate total free amount
 */
export const calculateFreeAmount = (
  freePrice: number,
  freeQuantity: number
): number => {
  if (!freePrice || !freeQuantity) return 0;
  return Math.round(freePrice * freeQuantity);
};

/**
 * Calculate seed rights cost per kilogram
 */
export const calculateSeedPricePerKg = (
  bagPrice: number,
  bagWeight: number = 50
): number => {
  if (!bagPrice || !bagWeight) return 0;
  return Math.round(bagPrice / bagWeight);
};

/**
 * Calculate total seed rights
 */
export const calculateSeedRights = (
  bagPrice: number,
  bagCount: number,
  additionalKilos: number = 0,
  bagWeight: number = 50
): number => {
  if (!bagPrice) return 0;
  
  const fullBagsCost = bagPrice * bagCount;
  const pricePerKg = calculateSeedPricePerKg(bagPrice, bagWeight);
  const additionalCost = pricePerKg * additionalKilos;
  
  return Math.round(fullBagsCost + additionalCost);
};

/**
 * Calculate total amount
 */
export const calculateTotalAmount = (
  contractAmount: number,
  freeAmount: number
): number => {
  return Math.round((contractAmount || 0) + (freeAmount || 0));
};

/**
 * Calculate net amount after deducting seed rights
 */
export const calculateNetAmount = (
  totalAmount: number,
  seedRights: number
): number => {
  return Math.round((totalAmount || 0) - (seedRights || 0));
};

/**
 * Calculate final amount after additional deductions
 */
export const calculateFinalAmount = (
  netAmount: number,
  additionalDeductions: number
): number => {
  return Math.round((netAmount || 0) - (additionalDeductions || 0));
};