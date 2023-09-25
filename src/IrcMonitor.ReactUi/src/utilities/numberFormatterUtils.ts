export interface TokenExpireInformation {
  isExpiring: boolean;
  hasExpired: boolean;
}

const getBrowserLocale = () => {
  return "fi";
};

export const getFormattedNumber = (number: number): string => {
  const formattedNumber = new Intl.NumberFormat(getBrowserLocale(), {
    useGrouping: true,
    minimumFractionDigits: 0
  }).format(number);

  return formattedNumber;
};
