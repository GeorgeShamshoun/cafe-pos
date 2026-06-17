export const tafqeetEnglish = (num = 0) => {
  num = Number(num || 0);

  if (num === 0) {
    return "Zero pounds only";
  }

  const ones = [
    "", "One", "Two", "Three", "Four",
    "Five", "Six", "Seven", "Eight", "Nine",
  ];

  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const convertUnder100 = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];

    const t = Math.floor(n / 10);
    const o = n % 10;

    return o ? `${tens[t]}-${ones[o]}` : tens[t];
  };

  const convertUnder1000 = (n) => {
    const h = Math.floor(n / 100);
    const r = n % 100;

    if (h === 0) return convertUnder100(r);
    if (r === 0) return `${ones[h]} Hundred`;

    return `${ones[h]} Hundred ${convertUnder100(r)}`;
  };

  const convert = (n) => {
    if (n < 1000) return convertUnder1000(n);

    if (n < 1_000_000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;

      const text = `${convert(thousands)} Thousand`;

      return rest
        ? `${text} ${convertUnder1000(rest)}`
        : text;
    }

    const millions = Math.floor(n / 1_000_000);
    const rest = n % 1_000_000;

    const text = `${convert(millions)} Million`;

    return rest
      ? `${text} ${convert(rest)}`
      : text;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = `${convert(integerPart)} Pounds`;

  if (decimalPart > 0) {
    result += ` and ${convert(decimalPart)} Piasters`;
  }

  return `${result} only`;
};