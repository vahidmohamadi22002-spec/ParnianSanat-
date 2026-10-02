// ==========================================
// محاسبات مالی توقف و تولید ازدست‌رفته
// پرنیان صنعت
// ==========================================
//
// این فایل مسئول محاسبه ارزش مالی تولید
// ازدست‌رفته در زمان توقف تجهیزات است.
//
// نکته:
// قیمت‌ها قابل تنظیم هستند و صرفاً مقدار
// اولیه برای محاسبات نرم‌افزار محسوب می‌شوند.
// ==========================================


// ==========================================
// قیمت فروش محصولات
// واحد قیمت: تومان به ازای هر تن
// ==========================================

export const PRODUCT_PRICES = {

  // ------------------------------
  // محصولات سنگ‌شکن
  // ------------------------------

  "محصول کوبیت": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "قیمت قابل تنظیم محصول کوبیت"
  },


  // ------------------------------
  // محصولات ماسه‌ساز
  // ------------------------------

  "ماسه": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "قیمت قابل تنظیم ماسه"
  },


  // ------------------------------
  // محصولات سرند
  // ------------------------------

  "محصول سرند": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "قیمت قابل تنظیم محصول سرند"
  },

  "نخودی": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "قیمت قابل تنظیم محصول نخودی"
  },


  // ------------------------------
  // محصولات ماسه‌شوی
  // ------------------------------

  "ماسه شسته": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "قیمت قابل تنظیم ماسه شسته"
  },


  // ------------------------------
  // محصولات انتقالی
  // ------------------------------

  "خوراک خط": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "ارزش تقریبی خوراک خط"
  },

  "انتقال مواد": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "ارزش تقریبی مواد در حال انتقال"
  },

  "انتقال ماسه": {
    pricePerTon: 350000,
    currency: "تومان",
    unit: "تومان بر تن",
    description: "ارزش تقریبی ماسه در حال انتقال"
  }

};


// ==========================================
// دریافت قیمت یک محصول
// ==========================================

export function getProductPrice(
  productName
) {

  return (
    PRODUCT_PRICES[productName] || {
      pricePerTon: 0,
      currency: "تومان",
      unit: "تومان بر تن",
      description: "قیمت این محصول هنوز تعریف نشده است"
    }
  );

}


// ==========================================
// محاسبه ارزش مالی تولید ازدست‌رفته
// ==========================================
//
// lostProduction:
// مقدار تولید ازدست‌رفته بر حسب تن
//
// productName:
// نام محصول
//
// مثال:
//
// تولید ازدست‌رفته = 30 تن
// قیمت هر تن = 350,000 تومان
//
// ارزش تولید ازدست‌رفته:
// 30 × 350,000
// = 10,500,000 تومان
// ==========================================

export function calculateLostProductionValue(
  productName,
  lostProduction
) {

  const productPrice =
    getProductPrice(productName);

  const production =
    Number(lostProduction) || 0;

  const lostProductionValue =
    production *
    productPrice.pricePerTon;

  return {

    // مقدار تولید ازدست‌رفته
    lostProduction:
      production,

    // قیمت هر تن
    pricePerTon:
      productPrice.pricePerTon,

    // ارزش مالی تولید ازدست‌رفته
    lostProductionValue:
      lostProductionValue,

    // واحد پول
    currency:
      productPrice.currency,

    // واحد قیمت
    priceUnit:
      productPrice.unit,

    // نام محصول
    product:
      productName || "",

    // توضیحات قیمت
    description:
      productPrice.description

  };

}


// ==========================================
// محاسبه کامل ارزش مالی توقف
// ==========================================
//
// این تابع برای مراحل بعدی طراحی شده
// تا مستقیماً با اطلاعات تولید و توقف
// کار کند.
//
// downtimeMinutes:
// مدت توقف بر حسب دقیقه
//
// capacity:
// ظرفیت تولید بر حسب تن در ساعت
//
// productName:
// نام محصول
// ==========================================

export function calculateDowntimeValue(
  downtimeMinutes,
  capacity,
  productName
) {

  const minutes =
    Number(downtimeMinutes) || 0;

  const hourlyCapacity =
    Number(capacity) || 0;

  const lostProduction =
    hourlyCapacity *
    (minutes / 60);

  const financial =
    calculateLostProductionValue(
      productName,
      lostProduction
    );

  return {

    downtimeMinutes:
      minutes,

    capacity:
      hourlyCapacity,

    product:
      productName || "",

    lostProduction:
      financial.lostProduction,

    pricePerTon:
      financial.pricePerTon,

    lostProductionValue:
      financial.lostProductionValue,

    currency:
      financial.currency,

    priceUnit:
      financial.priceUnit

  };

}
