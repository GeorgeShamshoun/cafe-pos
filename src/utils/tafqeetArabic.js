export const tafqeetArabic = (num = 0) => {
  num = Number(num || 0);
  if (num === 0) return "صفر جنيه لا غير";

  const ones = [
    "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة",
    "ستة", "سبعة", "ثمانية", "تسعة",
  ];

  const teens = [
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر",
    "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر",
  ];

  const tens = [
    "", "", "عشرون", "ثلاثون", "أربعون", "خمسون",
    "ستون", "سبعون", "ثمانون", "تسعون",
  ];

  const hundreds = [
    "", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة",
    "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة",
  ];

  const getUnder100 = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${ones[o]} و${tens[t]}` : tens[t];
  };

  const getUnder1000 = (n) => {
    if (n === 0) return "";
    const h = Math.floor(n / 100);
    const r = n % 100;
    const hText = hundreds[h];
    const rText = getUnder100(r);
    if (h === 0) return rText;
    if (r === 0) return hText;
    return `${hText} و${rText}`;
  };

  // وحدات الأعداد الكبيرة مع صيغ المفرد والمثنى والجمع
  const units = [
    {
      value: 1_000_000,
      singular: "مليون",
      dual: "مليونان",
      plural: "ملايين",
    },
    {
      value: 1_000,
      singular: "ألف",
      dual: "ألفان",
      plural: "آلاف",
    },
  ];

  const convert = (n) => {
    if (n === 0) return "";
    if (n < 1000) return getUnder1000(n);

    let result = "";

    for (const unit of units) {
      const count = Math.floor(n / unit.value);
      n = n % unit.value;

      if (count === 0) continue;

      let unitText = "";

      if (count === 1) {
        // ألف / مليون بدون "واحد"
        unitText = unit.singular;
      } else if (count === 2) {
        // ألفان / مليونان بدون "اثنان"
        unitText = unit.dual;
      } else if (count <= 10) {
        // ثلاثة آلاف ... عشرة آلاف
        unitText = `${getUnder100(count)} ${unit.plural}`;
      } else if (count <= 99) {
        // أحد عشر ألفاً ... تسعة وتسعون ألفاً
        unitText = `${getUnder100(count)} ${unit.singular}`;
      } else {
        // مائة ألف وما فوق
        unitText = `${getUnder1000(count)} ${unit.singular}`;
      }

      result += result ? ` و${unitText}` : unitText;
    }

    // الباقي أقل من ألف
    if (n > 0) {
      result += result ? ` و${getUnder1000(n)}` : getUnder1000(n);
    }

    return result;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = convert(integerPart) + " جنيه";

  if (decimalPart > 0) {
    result += ` و${convert(decimalPart)} قرش`;
  }

  return result + " لا غير";
};