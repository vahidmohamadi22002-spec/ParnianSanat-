// ==========================================
// اطلاعات تولید و ظرفیت تجهیزات
// پرنیان صنعت
// ==========================================

// ظرفیت تولید ساعتی هر تجهیز
// واحد: تن بر ساعت (t/h)
//
// نکته:
// تجهیزاتی که مستقیماً تولید یا انتقال محصول ندارند
// فعلاً ظرفیت آنها صفر است.

export const PRODUCTION_CAPACITY = {

  // ------------------------------
  // سنگ‌شکن‌ها
  // ------------------------------

  "KUBIT-01": {
    capacity: 60,
    unit: "تن بر ساعت",
    product: "محصول کوبیت",
    description: "ظرفیت تولید ساعتی کوبیت"
  },


  // ------------------------------
  // ماسه‌ساز
  // ------------------------------

  "SAND-01": {
    capacity: 60,
    unit: "تن بر ساعت",
    product: "ماسه",
    description: "ظرفیت تولید ساعتی ماسه‌ساز"
  },


  // ------------------------------
  // سرندها
  // ------------------------------

  "SCREEN-01": {
    capacity: 80,
    unit: "تن بر ساعت",
    product: "محصول سرند",
    description: "ظرفیت عبوری سرند شماره ۱"
  },

  "SCREEN-02": {
    capacity: 70,
    unit: "تن بر ساعت",
    product: "محصول سرند",
    description: "ظرفیت عبوری سرند شماره ۲"
  },

  "SCREEN-03": {
    capacity: 60,
    unit: "تن بر ساعت",
    product: "نخودی",
    description: "ظرفیت تولید محصول نخودی"
  },


  // ------------------------------
  // ماسه‌شوی
  // ------------------------------

  "WASHER-01": {
    capacity: 60,
    unit: "تن بر ساعت",
    product: "ماسه شسته",
    description: "ظرفیت شست‌وشوی ساعتی"
  },


  // ------------------------------
  // فیدر
  // ------------------------------

  "FEEDER-01": {
    capacity: 80,
    unit: "تن بر ساعت",
    product: "خوراک خط",
    description: "ظرفیت خوراک‌دهی فیدر"
  },


  // ------------------------------
  // نوارهای نقاله
  // ------------------------------

  "CONVEYOR-01": {
    capacity: 80,
    unit: "تن بر ساعت",
    product: "انتقال مواد",
    description: "ظرفیت انتقال نوار اصلی"
  },

  "CONVEYOR-02": {
    capacity: 80,
    unit: "تن بر ساعت",
    product: "انتقال مواد",
    description: "ظرفیت انتقال نوار خروجی"
  },

  "BELT-03": {
    capacity: 60,
    unit: "تن بر ساعت",
    product: "انتقال ماسه",
    description: "ظرفیت انتقال نوار زیر ماسه‌ساز"
  },


  // ------------------------------
  // تجهیزات غیرتولیدی
  // ------------------------------

  "PUMP-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "پمپ آب - بدون ظرفیت تولید مستقیم"
  },

  "GEARBOX-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "گیربکس - بدون ظرفیت تولید مستقیم"
  },


  // ------------------------------
  // موتورها
  // ------------------------------

  "MOTOR-KUBIT-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور کوبیت"
  },

  "MOTOR-SAND-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور ماسه‌ساز"
  },

  "MOTOR-SCREEN-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور سرند شماره ۱"
  },

  "MOTOR-SCREEN-02": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور سرند شماره ۲"
  },

  "MOTOR-SCREEN-03": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور سرند نخودی"
  },

  "MOTOR-WASHER-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور ماسه‌شوی"
  },

  "MOTOR-FEEDER-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور فیدر"
  },

  "MOTOR-CONVEYOR-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور نوار اصلی"
  },

  "MOTOR-CONVEYOR-02": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور نوار خروجی"
  },

  "MOTOR-BELT-03": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور نوار زیر ماسه‌ساز"
  },

  "MOTOR-PUMP-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "موتور پمپ"
  },


  // ------------------------------
  // تابلوها
  // ------------------------------

  "PANEL-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "تابلو برق"
  },

  "PANEL-CONTROL-01": {
    capacity: 0,
    unit: "تن بر ساعت",
    product: "",
    description: "تابلو کنترل"
  }

};


// ==========================================
// دریافت اطلاعات ظرفیت یک تجهیز
// ==========================================

export function getProductionCapacity(
  equipmentId
) {

  return (
    PRODUCTION_CAPACITY[equipmentId] || {
      capacity: 0,
      unit: "تن بر ساعت",
      product: "",
      description: "ظرفیت برای این تجهیز تعریف نشده است"
    }
  );

}


// ==========================================
// محاسبه تولید ازدست‌رفته
// ==========================================
//
// downtimeMinutes = مدت توقف بر حسب دقیقه
// capacity = ظرفیت تولید بر حسب تن بر ساعت
//
// مثال:
// ظرفیت 60 تن/ساعت
// توقف 30 دقیقه
// تولید ازدست‌رفته = 30 تن
//

export function calculateLostProduction(
  equipmentId,
  downtimeMinutes
) {

  const production =
    getProductionCapacity(equipmentId);

  const minutes =
    Number(downtimeMinutes) || 0;

  const lostProduction =
    production.capacity *
    (minutes / 60);

  return {
    lostProduction,
    capacity: production.capacity,
    unit: production.unit,
    product: production.product,
    downtimeMinutes: minutes
  };

}
