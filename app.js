import { html } from "htm/preact";
import { useState } from "preact/hooks";

import { Equipment, EQUIPMENT } from "./components/equipment.js";
import { EquipmentDetail } from "./components/equipment-detail.js";
import { RepairForm } from "./components/repair-form.js";
import { PM } from "./components/pm.js";
import { PMChecklist } from "./components/pm-checklist.js";
import { Inspection } from "./components/inspection.js";
import { Reports } from "./components/reports.js";

const STORAGE_KEYS = {
  repairs: "parnian_sanat_repairs",
  pm: "parnian_sanat_pm",
  inspections: "parnian_sanat_inspections"
};

const TOTAL_EQUIPMENT = EQUIPMENT.length;

const HEALTHY_EQUIPMENT = EQUIPMENT.filter(
  equipment => equipment.status === "healthy"
).length;

const ATTENTION_EQUIPMENT = EQUIPMENT.filter(
  equipment => equipment.status === "attention"
).length;

const CRITICAL_EQUIPMENT = EQUIPMENT.filter(
  equipment => equipment.status === "critical"
).length;


function loadData(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("خطا در خواندن اطلاعات:", error);
    return [];
  }
}


function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("خطا در ذخیره اطلاعات:", error);
  }
}


function getDateTimeValue(item) {
  const date = item?.date || "";
  const time = item?.time || "";

  return `${date} ${time}`;
}


function sortLatest(items) {
  return [...items].sort((a, b) => {
    return getDateTimeValue(b).localeCompare(
      getDateTimeValue(a)
    );
  });
}


function getActivityIcon(type) {
  if (type === "repair") {
    return "🔧";
  }

  if (type === "pm") {
    return "📋";
  }

  if (type === "inspection") {
    return "🔍";
  }

  return "📌";
}


function getActivityTitle(type) {
  if (type === "repair") {
    return "تعمیرات";
  }

  if (type === "pm") {
    return "PM";
  }

  if (type === "inspection") {
    return "بازرسی";
  }

  return "فعالیت";
}


function getActivityResult(item, type) {
  if (type === "repair") {
    return item?.repairStatusText || "تعمیر ثبت شده";
  }

  if (type === "pm") {
    return item?.resultText || "PM ثبت شده";
  }

  if (type === "inspection") {
    return item?.resultText || "بازرسی ثبت شده";
  }

  return "";
}


/*
 * فرمت نمایش اعداد
 */
function formatNumber(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("fa-IR").format(
    Math.round(number)
  );
}


/*
 * فرمت نمایش درصد
 */
function formatPercent(value) {
  const number = Number(value) || 0;

  return `${new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 1
  }).format(number)}٪`;
}


/*
 * فرمت نمایش مبلغ
 */
function formatCurrency(value) {
  const number = Number(value) || 0;

  return `${formatNumber(number)} تومان`;
}


/*
 * تبدیل دقیقه به ساعت و دقیقه
 */
function formatDuration(totalMinutes) {
  const minutes =
    Number(totalMinutes) || 0;

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes} دقیقه`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ساعت`;
  }

  return `${hours} ساعت و ${remainingMinutes} دقیقه`;
}


/*
 * محاسبه KPI های توقف و تولید
 */
function calculateRepairKPIs(repairs) {

  let totalDowntimeMinutes = 0;
  let totalLostProduction = 0;
  let totalLostProductionValue = 0;

  repairs.forEach(repair => {

    totalDowntimeMinutes +=
      Number(
        repair?.downtimeTotalMinutes
      ) || 0;

    totalLostProduction +=
      Number(
        repair?.lostProduction
      ) || 0;

    totalLostProductionValue +=
      Number(
        repair?.lostProductionValue
      ) || 0;

  });

  return {
    totalDowntimeMinutes,
    totalLostProduction,
    totalLostProductionValue
  };

}


/*
 * ==========================================
 * KPI های نگهداری
 * ==========================================
 */
function calculateMaintenanceKPIs(
  repairs = [],
  pmRecords = []
) {

  const totalRepairs =
    repairs.length;

  const totalPM =
    pmRecords.length;


  const repairsWithDowntime =
    repairs.filter(
      repair =>
        Number(
          repair?.downtimeTotalMinutes
        ) > 0
    ).length;


  const totalDowntimeMinutes =
    repairs.reduce(
      (sum, repair) =>
        sum +
        (
          Number(
            repair?.downtimeTotalMinutes
          ) || 0
        ),
      0
    );


  const mttrMinutes =
    repairsWithDowntime > 0
      ? totalDowntimeMinutes /
        repairsWithDowntime
      : 0;


  const emergencyRepairs =
    repairs.filter(
      repair =>
        repair?.repairType === "emergency"
    ).length;


  const preventiveRepairs =
    repairs.filter(
      repair =>
        repair?.repairType === "preventive"
    ).length;


  const emergencyRate =
    totalRepairs > 0
      ? (
          emergencyRepairs /
          totalRepairs
        ) * 100
      : 0;


  const preventiveRate =
    totalRepairs > 0
      ? (
          preventiveRepairs /
          totalRepairs
        ) * 100
      : 0;


  const equipmentWithPM =
    new Set(
      pmRecords
        .map(record => record?.equipmentId)
        .filter(Boolean)
    ).size;


  const pmCoverage =
    TOTAL_EQUIPMENT > 0
      ? (
          equipmentWithPM /
          TOTAL_EQUIPMENT
        ) * 100
      : 0;


  return {

    totalRepairs,

    totalPM,

    repairsWithDowntime,

    totalDowntimeMinutes,

    mttrMinutes,

    emergencyRepairs,

    preventiveRepairs,

    emergencyRate,

    preventiveRate,

    equipmentWithPM,

    pmCoverage

  };

}


/*
 * ==========================================
 * حدود اولیه ارتعاش
 * ==========================================
 *
 * کمتر از 2.8 mm/s
 * وضعیت عادی
 *
 * 2.8 تا کمتر از 4.5 mm/s
 * نیازمند بررسی
 *
 * 4.5 mm/s و بالاتر
 * بحرانی
 *
 * این حدود فعلاً عملیاتی و اولیه هستند
 * و در مرحله بعد برای هر تجهیز قابل تنظیم
 * خواهند شد.
 */

const VIBRATION_LIMITS = {
  normal: 2.8,
  critical: 4.5
};


/*
 * خواندن تاریخچه ارتعاش یک تجهیز
 */
function loadVibrationHistory(equipmentId) {

  try {

    const key =
      `parnian_sanat_vibration_${equipmentId}`;

    const saved =
      localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(
      "خطا در خواندن تاریخچه ارتعاش:",
      error
    );

    return [];

  }

}


/*
 * دریافت آخرین رکورد ارتعاش
 */
function getLatestVibrationRecord(equipmentId) {

  const history =
    loadVibrationHistory(equipmentId);

  if (!history.length) {
    return null;
  }

  return [...history].sort((a, b) => {

    const dateA =
      `${a?.date || ""} ${a?.time || ""}`;

    const dateB =
      `${b?.date || ""} ${b?.time || ""}`;

    return dateB.localeCompare(dateA);

  })[0];

}


/*
 * تعیین وضعیت ارتعاش
 */
function getVibrationStatus(value) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "unknown";
  }

  if (
    number >=
    VIBRATION_LIMITS.critical
  ) {
    return "critical";
  }

  if (
    number >=
    VIBRATION_LIMITS.normal
  ) {
    return "attention";
  }

  return "healthy";

}


/*
 * نام فارسی بخش مورد اندازه‌گیری
 */
function getVibrationComponentLabel(component) {

  if (component === "bearing") {
    return "بلبرینگ";
  }

  if (component === "motor") {
    return "موتور";
  }

  if (component === "gearbox") {
    return "گیربکس";
  }

  return "ارتعاش";
}


/*
 * پیشنهاد اقدام تعمیراتی
 */
function getVibrationAction(component, status) {

  if (component === "bearing") {

    if (status === "critical") {
      return "بررسی فوری بلبرینگ، لقی، روانکاری و هم‌راستایی";
    }

    return "بررسی بلبرینگ، روانکاری و لقی";

  }


  if (component === "motor") {

    if (status === "critical") {
      return "بررسی فوری بالانس، یاتاقان موتور و هم‌راستایی کوپلینگ";
    }

    return "بررسی بالانس، یاتاقان و هم‌راستایی";

  }


  if (component === "gearbox") {

    if (status === "critical") {
      return "بررسی فوری گیربکس، چرخ‌دنده، بلبرینگ و روغن";
    }

    return "بررسی گیربکس، روغن، چرخ‌دنده و بلبرینگ";

  }


  return "بررسی وضعیت ارتعاش تجهیز";

}


/*
 * ==========================================
 * ساخت هشدارهای ارتعاش
 * ==========================================
 */
function buildVibrationAlerts() {

  const alerts = [];

  EQUIPMENT.forEach(equipment => {

    const latest =
      getLatestVibrationRecord(
        equipment.id
      );

    if (!latest) {
      return;
    }


    const components = [
      {
        key: "bearing",
        value: latest?.bearing
      },
      {
        key: "motor",
        value: latest?.motor
      },
      {
        key: "gearbox",
        value: latest?.gearbox
      }
    ];


    components.forEach(component => {

      const value =
        Number(component.value);

      if (!Number.isFinite(value)) {
        return;
      }


      const status =
        getVibrationStatus(value);


      if (status === "healthy") {
        return;
      }


      const componentLabel =
        getVibrationComponentLabel(
          component.key
        );


      if (status === "critical") {

        alerts.push({

          id:
            `vibration-critical-${equipment.id}-${component.key}-${latest.id || latest.date || ""}`,

          level: "critical",

          icon: "📳",

          title:
            "ارتعاش بحرانی",

          equipmentName:
            equipment.name,

          message:
            `${componentLabel} ${formatNumber(value)} mm/s RMS ثبت شده است و از محدوده بحرانی اولیه عبور کرده.`,

          action:
            getVibrationAction(
              component.key,
              status
            ),

          date:
            latest.date,

          time:
            latest.time

        });

      } else {

        alerts.push({

          id:
            `vibration-attention-${equipment.id}-${component.key}-${latest.id || latest.date || ""}`,

          level: "attention",

          icon: "📳",

          title:
            "افزایش ارتعاش",

          equipmentName:
            equipment.name,

          message:
            `${componentLabel} ${formatNumber(value)} mm/s RMS ثبت شده و نیازمند بررسی است.`,

          action:
            getVibrationAction(
              component.key,
              status
            ),

          date:
            latest.date,

          time:
            latest.time

        });

      }

    });

  });


  return alerts;

}


/*
 * ==========================================
 * ساخت هشدارهای هوشمند
 * ==========================================
 */
function buildSmartAlerts(
  repairs,
  pmRecords,
  inspectionRecords
) {

  const alerts = [];


  /*
   * 1. تجهیزات بحرانی
   */
  EQUIPMENT
    .filter(
      equipment =>
        equipment.status === "critical"
    )
    .forEach(equipment => {

      alerts.push({

        id:
          `critical-${equipment.id}`,

        level:
          "critical",

        icon:
          "🔴",

        title:
          "تجهیز بحرانی",

        equipmentName:
          equipment.name,

        message:
          "این تجهیز در وضعیت بحرانی قرار دارد و نیازمند اقدام فوری است.",

        action:
          "اقدام فوری"

      });

    });


  /*
   * 2. تجهیزات نیازمند بررسی
   */
  EQUIPMENT
    .filter(
      equipment =>
        equipment.status === "attention"
    )
    .forEach(equipment => {

      alerts.push({

        id:
          `attention-${equipment.id}`,

        level:
          "attention",

        icon:
          "🟠",

        title:
          "نیازمند بررسی",

        equipmentName:
          equipment.name,

        message:
          "این تجهیز نیازمند بررسی و پیگیری است.",

        action:
          "بررسی"

      });

    });


  /*
   * 3. PM دارای مشکل
   */
  pmRecords.forEach(record => {

    const result =
      String(
        record?.result || ""
      ).toLowerCase();


    if (
      result === "problem" ||
      result === "critical"
    ) {

      alerts.push({

        id:
          `pm-problem-${record.id}`,

        level:
          "critical",

        icon:
          "📋",

        title:
          "PM دارای مشکل",

        equipmentName:
          record.equipmentName ||
          "تجهیز نامشخص",

        message:
          record.resultText ||
          "نتیجه آخرین PM نشان‌دهنده وجود مشکل است.",

        action:
          "پیگیری PM",

        date:
          record.date,

        time:
          record.time

      });

    } else if (
      result === "attention"
    ) {

      alerts.push({

        id:
          `pm-attention-${record.id}`,

        level:
          "attention",

        icon:
          "📋",

        title:
          "PM نیازمند پیگیری",

        equipmentName:
          record.equipmentName ||
          "تجهیز نامشخص",

        message:
          record.resultText ||
          "در آخرین PM موردی نیازمند پیگیری ثبت شده است.",

        action:
          "پیگیری PM",

        date:
          record.date,

        time:
          record.time

      });

    }

  });


  /*
   * 4. بازرسی دارای مشکل
   */
  inspectionRecords.forEach(record => {

    const result =
      String(
        record?.result || ""
      ).toLowerCase();


    if (
      result === "problem" ||
      result === "critical"
    ) {

      alerts.push({

        id:
          `inspection-problem-${record.id}`,

        level:
          "critical",

        icon:
          "🔍",

        title:
          "بازرسی دارای مشکل",

        equipmentName:
          record.equipmentName ||
          "تجهیز نامشخص",

        message:
          record.resultText ||
          "در بازرسی مشکل ثبت شده است.",

        action:
          "اقدام فوری",

        date:
          record.date,

        time:
          record.time

      });

    } else if (
      result === "attention"
    ) {

      alerts.push({

        id:
          `inspection-attention-${record.id}`,

        level:
          "attention",

        icon:
          "🔍",

        title:
          "بازرسی نیازمند پیگیری",

        equipmentName:
          record.equipmentName ||
          "تجهیز نامشخص",

        message:
          record.resultText ||
          "در بازرسی موردی نیازمند پیگیری ثبت شده است.",

        action:
          "بررسی",

        date:
          record.date,

        time:
          record.time

      });

    }

  });


  /*
   * 5. تعمیرات با وضعیت توقف تجهیز
   */
  repairs.forEach(repair => {

    const condition =
      repair?.equipmentCondition;


    if (
      condition === "stopped"
    ) {

      alerts.push({

        id:
          `repair-stopped-${repair.id}`,

        level:
          "critical",

        icon:
          "🛑",

        title:
          "تجهیز متوقف است",

        equipmentName:
          repair.equipmentName ||
          "تجهیز نامشخص",

        message:
          "در آخرین تعمیر، وضعیت تجهیز متوقف ثبت شده است.",

        action:
          "اقدام فوری",

        date:
          repair.date,

        time:
          repair.time

      });

    }

  });


  /*
   * 6. هشدارهای ارتعاش
   */
  const vibrationAlerts =
    buildVibrationAlerts();


  alerts.push(
    ...vibrationAlerts
  );


  /*
   * هشدارهای جدیدتر ابتدا نمایش داده شوند
   */
  return alerts.sort((a, b) => {

    const aDate =
      `${a.date || ""} ${a.time || ""}`;

    const bDate =
      `${b.date || ""} ${b.time || ""}`;

    return bDate.localeCompare(aDate);

  });

}


export function App() {

  const [page, setPage] =
    useState("dashboard");


  const [selectedEquipment, setSelectedEquipment] =
    useState(null);


  const [selectedPM, setSelectedPM] =
    useState(null);


  const [repairs, setRepairs] =
    useState(() =>
      loadData(STORAGE_KEYS.repairs)
    );


  const [pmRecords, setPMRecords] =
    useState(() =>
      loadData(STORAGE_KEYS.pm)
    );


  const [inspectionRecords, setInspectionRecords] =
    useState(() =>
      loadData(STORAGE_KEYS.inspections)
    );


  function handleSaveRepair(repair) {

    const updated = [
      ...repairs,
      repair
    ];


    setRepairs(updated);


    saveData(
      STORAGE_KEYS.repairs,
      updated
    );


    setPage("equipment-detail");

  }


  function handleSavePM(pmRecord) {

    const updated = [
      ...pmRecords,
      pmRecord
    ];


    setPMRecords(updated);


    saveData(
      STORAGE_KEYS.pm,
      updated
    );


    setPage("pm");

  }


  function handleSaveInspection(inspection) {

    const updated = [
      ...inspectionRecords,
      inspection
    ];


    setInspectionRecords(updated);


    saveData(
      STORAGE_KEYS.inspections,
      updated
    );


    setPage("equipment-detail");

  }


  function openEquipment(equipment) {

    setSelectedEquipment(
      equipment
    );

    setPage(
      "equipment-detail"
    );

  }


  function openRepair(equipment) {

    setSelectedEquipment(
      equipment
    );

    setPage(
      "repair-form"
    );

  }


  function openInspection(equipment) {

    setSelectedEquipment(
      equipment
    );

    setPage(
      "inspection"
    );

  }


  function openPMChecklist(equipment) {

    setSelectedEquipment(
      equipment
    );

    setSelectedPM(null);

    setPage(
      "pm-checklist"
    );

  }


  const selectedRepairs =
    selectedEquipment
      ? repairs.filter(
          repair =>
            repair.equipmentId ===
            selectedEquipment.id
        )
      : [];


  const selectedPMRecords =
    selectedEquipment
      ? pmRecords.filter(
          record =>
            record.equipmentId ===
            selectedEquipment.id
        )
      : [];


  const selectedInspections =
    selectedEquipment
      ? inspectionRecords.filter(
          record =>
            record.equipmentId ===
            selectedEquipment.id
        )
      : [];


  const totalPM =
    pmRecords.length;


  const totalRepairs =
    repairs.length;


  const totalInspections =
    inspectionRecords.length;


  /*
   * KPI های توقف و تولید
   */
  const repairKPIs =
    calculateRepairKPIs(
      repairs
    );


  const totalDowntimeMinutes =
    repairKPIs.totalDowntimeMinutes;


  const totalLostProduction =
    repairKPIs.totalLostProduction;


  const totalLostProductionValue =
    repairKPIs.totalLostProductionValue;


  /*
   * KPI های نگهداری
   */
  const maintenanceKPIs =
    calculateMaintenanceKPIs(
      repairs,
      pmRecords
    );


  const criticalAlerts =
    CRITICAL_EQUIPMENT;


  const attentionAlerts =
    ATTENTION_EQUIPMENT;


  /*
   * آخرین فعالیت‌ها
   */
  const latestActivities = [

    ...repairs.map(item => ({
      ...item,
      activityType:
        "repair"
    })),

    ...pmRecords.map(item => ({
      ...item,
      activityType:
        "pm"
    })),

    ...inspectionRecords.map(item => ({
      ...item,
      activityType:
        "inspection"
    }))

  ];


  const sortedActivities =
    sortLatest(
      latestActivities
    );


  const recentActivities =
    sortedActivities.slice(
      0,
      8
    );


  /*
   * هشدارهای هوشمند
   */
  const smartAlerts =
    buildSmartAlerts(
      repairs,
      pmRecords,
      inspectionRecords
    );


  const criticalSmartAlerts =
    smartAlerts.filter(
      alert =>
        alert.level ===
        "critical"
    );


  const attentionSmartAlerts =
    smartAlerts.filter(
      alert =>
        alert.level ===
        "attention"
    );


  /*
   * ==========================================
   * صفحه گزارش مدیریتی
   * ==========================================
   */

  if (page === "reports") {

    return html`

      <${Reports}

        repairs=${repairs}

        pmRecords=${pmRecords}

        inspections=${inspectionRecords}

        onBack=${() =>
          setPage("dashboard")}

      />

    `;

  }


  if (page === "pm-checklist") {

    return html`

      <${PMChecklist}

        equipment=${selectedEquipment}

        pmRecord=${selectedPM}

        onBack=${() =>
          setPage("pm")}

        onSave=${handleSavePM}

      />

    `;

  }


  if (page === "pm") {

    return html`

      <${PM}

        onBack=${() =>
          setPage("dashboard")}

        onChecklist=${openPMChecklist}

        onSelectEquipment=${openEquipment}

        pmRecords=${pmRecords}

      />

    `;

  }


  if (page === "inspection") {

    return html`

      <${Inspection}

        equipment=${selectedEquipment}

        onBack=${() =>
          setPage("equipment-detail")}

        onSave=${handleSaveInspection}

      />

    `;

  }


  if (page === "repair-form") {

    return html`

      <${RepairForm}

        equipment=${selectedEquipment}

        onBack=${() =>
          setPage("equipment-detail")}

        onSave=${handleSaveRepair}

      />

    `;

  }


  if (page === "equipment-detail") {

    return html`

      <${EquipmentDetail}

        equipment=${selectedEquipment}

        repairs=${selectedRepairs}

        pmRecords=${selectedPMRecords}

        inspections=${selectedInspections}

        onBack=${() =>
          setPage("equipment")}

        onRepair=${openRepair}

        onInspection=${openInspection}

      />

    `;

  }


  if (page === "equipment") {

    return html`

      <${Equipment}

        onBack=${() =>
          setPage("dashboard")}

        onSelect=${openEquipment}

      />

    `;

  }


  return html`

    <div class="app-shell">

      <header class="top-header">

        <div>

          <div class="brand-name">
            پرنیان صنعت
          </div>

          <div class="brand-slogan">
            همراه شما در حفظ بهره‌وری تجهیزات
          </div>

        </div>


        <div class="header-badge">
          سیستم مدیریت نگهداری
        </div>

      </header>


      <main class="dashboard">


        <section class="dashboard-intro">

          <div>

            <h1>
              داشبورد مدیریت تعمیرات و نگهداری
            </h1>

            <p>
              وضعیت لحظه‌ای تجهیزات، تعمیرات،
              PM و بازرسی‌ها
            </p>

          </div>

        </section>


        <!-- آمار تجهیزات -->

        <section class="stats-grid">


          <div
            class="stat-card"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              ⚙️
            </div>

            <div class="stat-content">

              <span>
                کل تجهیزات
              </span>

              <strong>
                ${TOTAL_EQUIPMENT}
              </strong>

              <small>
                تجهیزات ثبت‌شده
              </small>

            </div>

          </div>


          <div
            class="stat-card"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              🟢
            </div>

            <div class="stat-content">

              <span>
                سالم
              </span>

              <strong>
                ${HEALTHY_EQUIPMENT}
              </strong>

              <small>
                وضعیت عادی
              </small>

            </div>

          </div>


          <div
            class="stat-card"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              🟠
            </div>

            <div class="stat-content">

              <span>
                نیازمند بررسی
              </span>

              <strong>
                ${ATTENTION_EQUIPMENT}
              </strong>

              <small>
                نیازمند اقدام
              </small>

            </div>

          </div>


          <div
            class="stat-card"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              🔴
            </div>

            <div class="stat-content">

              <span>
                بحرانی
              </span>

              <strong>
                ${CRITICAL_EQUIPMENT}
              </strong>

              <small>
                نیازمند اقدام فوری
              </small>

            </div>

          </div>

        </section>


        <!-- آمار فعالیت -->

        <section class="stats-grid">


          <div
            class="stat-card secondary"
            onClick=${() =>
              setPage("pm")}
          >

            <div class="stat-icon">
              🔧
            </div>

            <div class="stat-content">

              <span>
                PM ثبت‌شده
              </span>

              <strong>
                ${totalPM}
              </strong>

              <small>
                عملیات نگهداری پیشگیرانه
              </small>

            </div>

          </div>


          <div
            class="stat-card secondary"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              🛠️
            </div>

            <div class="stat-content">

              <span>
                تعمیرات
              </span>

              <strong>
                ${totalRepairs}
              </strong>

              <small>
                تعمیرات ثبت‌شده
              </small>

            </div>

          </div>


          <div
            class="stat-card secondary"
            onClick=${() =>
              setPage("equipment")}
          >

            <div class="stat-icon">
              🔍
            </div>

            <div class="stat-content">

              <span>
                بازرسی‌ها
              </span>

              <strong>
                ${totalInspections}
              </strong>

              <small>
                بازرسی ثبت‌شده
              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              🚨
            </div>

            <div class="stat-content">

              <span>
                هشدارها
              </span>

              <strong>
                ${smartAlerts.length}
              </strong>

              <small>

                ${
                  criticalSmartAlerts.length > 0
                    ? `${criticalSmartAlerts.length} هشدار بحرانی`
                    : attentionSmartAlerts.length > 0
                      ? `${attentionSmartAlerts.length} هشدار نیازمند بررسی`
                      : "بدون هشدار فعال"
                }

              </small>

            </div>

          </div>

        </section>


        <!-- KPI توقف و تولید -->

        <section class="stats-grid">


          <div class="stat-card secondary">

            <div class="stat-icon">
              ⏱️
            </div>

            <div class="stat-content">

              <span>
                مجموع زمان توقف
              </span>

              <strong>
                ${formatDuration(
                  totalDowntimeMinutes
                )}
              </strong>

              <small>
                مجموع توقف‌های ثبت‌شده
              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              📉
            </div>

            <div class="stat-content">

              <span>
                تولید ازدست‌رفته
              </span>

              <strong>
                ${formatNumber(
                  totalLostProduction
                )}
              </strong>

              <small>
                تن
              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              💰
            </div>

            <div class="stat-content">

              <span>
                ارزش تولید ازدست‌رفته
              </span>

              <strong>
                ${formatCurrency(
                  totalLostProductionValue
                )}
              </strong>

              <small>
                بر اساس قیمت ثبت‌شده محصولات
              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              📊
            </div>

            <div class="stat-content">

              <span>
                میانگین ارزش هر ساعت توقف
              </span>

              <strong>

                ${
                  totalDowntimeMinutes > 0
                    ? formatCurrency(
                        (
                          totalLostProductionValue /
                          (totalDowntimeMinutes / 60)
                        )
                      )
                    : "۰ تومان"
                }

              </strong>

              <small>
                بر اساس تعمیرات ثبت‌شده
              </small>

            </div>

          </div>


        </section>


        <!-- KPI نگهداری -->

        <section class="stats-grid">


          <div class="stat-card secondary">

            <div class="stat-icon">
              🕐
            </div>

            <div class="stat-content">

              <span>
                MTTR
              </span>

              <strong>
                ${formatDuration(
                  maintenanceKPIs.mttrMinutes
                )}
              </strong>

              <small>
                میانگین زمان تعمیر
              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              🚨
            </div>

            <div class="stat-content">

              <span>
                تعمیرات اضطراری
              </span>

              <strong>
                ${formatPercent(
                  maintenanceKPIs.emergencyRate
                )}
              </strong>

              <small>

                ${formatNumber(
                  maintenanceKPIs.emergencyRepairs
                )}

                مورد از

                ${formatNumber(
                  maintenanceKPIs.totalRepairs
                )}

                تعمیر

              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              🛡️
            </div>

            <div class="stat-content">

              <span>
                تعمیرات پیشگیرانه
              </span>

              <strong>
                ${formatPercent(
                  maintenanceKPIs.preventiveRate
                )}
              </strong>

              <small>

                ${formatNumber(
                  maintenanceKPIs.preventiveRepairs
                )}

                مورد از

                ${formatNumber(
                  maintenanceKPIs.totalRepairs
                )}

                تعمیر

              </small>

            </div>

          </div>


          <div class="stat-card secondary">

            <div class="stat-icon">
              📋
            </div>

            <div class="stat-content">

              <span>
                پوشش PM
              </span>

              <strong>
                ${formatPercent(
                  maintenanceKPIs.pmCoverage
                )}
              </strong>

              <small>

                ${formatNumber(
                  maintenanceKPIs.equipmentWithPM
                )}

                تجهیز از

                ${formatNumber(
                  TOTAL_EQUIPMENT
                )}

                تجهیز

              </small>

            </div>

          </div>


        </section>


        <!-- دسترسی سریع -->

        <section class="quick-actions-section">

          <div class="section-title">

            <h2>
              دسترسی سریع
            </h2>

            <span>
              عملیات اصلی سیستم
            </span>

          </div>


          <div class="quick-actions">


            <button
              class="quick-action"
              onClick=${() =>
                setPage("equipment")}
            >

              <span class="quick-icon">
                🔧
              </span>

              <span>
                تعمیرات
              </span>

            </button>


            <button
              class="quick-action"
              onClick=${() =>
                setPage("pm")}
            >

              <span class="quick-icon">
                📋
              </span>

              <span>
                PM
              </span>

            </button>


            <button
              class="quick-action"
              onClick=${() =>
                setPage("equipment")}
            >

              <span class="quick-icon">
                🔍
              </span>

              <span>
                بازرسی
              </span>

            </button>


            <button
              class="quick-action"
              onClick=${() =>
                setPage("reports")}
            >

              <span class="quick-icon">
                📊
              </span>

              <span>
                گزارش مدیریتی
              </span>

            </button>


            <button
              class="quick-action"
              onClick=${() =>
                alert(
                  "ماژول قطعات در مرحله نهایی پروژه فعال خواهد شد."
                )}
            >

              <span class="quick-icon">
                📦
              </span>

              <span>
                قطعات
              </span>

            </button>


          </div>

        </section>


        <!-- وضعیت تجهیزات و سیستم -->

        <section class="dashboard-grid">


          <div class="dashboard-card">

            <div class="card-header">

              <div>

                <h2>
                  وضعیت تجهیزات
                </h2>

                <span>
                  نمای کلی وضعیت تجهیزات
                </span>

              </div>


              <button
                class="text-button"
                onClick=${() =>
                  setPage("equipment")}
              >
                مشاهده همه
              </button>

            </div>


            <div class="equipment-status-list">


              <div class="status-row">

                <div class="status-label">

                  <span class="status-dot healthy"></span>

                  سالم

                </div>

                <strong>
                  ${HEALTHY_EQUIPMENT}
                </strong>

              </div>


              <div class="status-row">

                <div class="status-label">

                  <span class="status-dot attention"></span>

                  نیازمند بررسی

                </div>

                <strong>
                  ${ATTENTION_EQUIPMENT}
                </strong>

              </div>


              <div class="status-row">

                <div class="status-label">

                  <span class="status-dot critical"></span>

                  بحرانی

                </div>

                <strong>
                  ${CRITICAL_EQUIPMENT}
                </strong>

              </div>


            </div>

          </div>


          <div class="dashboard-card">

            <div class="card-header">

              <div>

                <h2>
                  وضعیت سیستم
                </h2>

                <span>
                  آخرین اطلاعات ثبت‌شده
                </span>

              </div>

            </div>


            <div class="system-alerts">


              <div class="system-alert">

                <span class="alert-icon">
                  🔴
                </span>

                <div>

                  <strong>
                    تجهیزات بحرانی
                  </strong>

                  <p>

                    ${
                      CRITICAL_EQUIPMENT > 0
                        ? `${CRITICAL_EQUIPMENT} تجهیز در وضعیت بحرانی قرار دارد.`
                        : "تجهیز بحرانی ثبت نشده است."
                    }

                  </p>

                </div>

              </div>


              <div class="system-alert">

                <span class="alert-icon">
                  🟠
                </span>

                <div>

                  <strong>
                    نیازمند بررسی
                  </strong>

                  <p>

                    ${
                      ATTENTION_EQUIPMENT > 0
                        ? `${ATTENTION_EQUIPMENT} تجهیز نیازمند بررسی است.`
                        : "تجهیزی نیازمند بررسی نیست."
                    }

                  </p>

                </div>

              </div>


              <div class="system-alert">

                <span class="alert-icon">
                  📋
                </span>

                <div>

                  <strong>
                    PM
                  </strong>

                  <p>

                    ${
                      totalPM > 0
                        ? `${totalPM} رکورد PM در سیستم ثبت شده است.`
                        : "هنوز رکورد PM ثبت نشده است."
                    }

                  </p>

                </div>

              </div>


              <div class="system-alert">

                <span class="alert-icon">
                  🔍
                </span>

                <div>

                  <strong>
                    بازرسی
                  </strong>

                  <p>

                    ${
                      totalInspections > 0
                        ? `${totalInspections} بازرسی ثبت شده است.`
                        : "هنوز بازرسی‌ای ثبت نشده است."
                    }

                  </p>

                </div>

              </div>


            </div>

          </div>

        </section>


        <!-- هشدارهای هوشمند -->

        <section class="dashboard-card recent-activity">

          <div class="card-header">

            <div>

              <h2>
                هشدارهای هوشمند
              </h2>

              <span>
                مواردی که نیاز به توجه و اقدام دارند
              </span>

            </div>

          </div>


          ${
            smartAlerts.length === 0

              ? html`

                  <div class="empty-state">

                    <div class="empty-icon">
                      🟢
                    </div>

                    <strong>
                      هشدار فعالی وجود ندارد
                    </strong>

                    <p>
                      در حال حاضر موردی برای پیگیری ثبت نشده است.
                    </p>

                  </div>

                `

              : html`

                  <div class="activity-list">

                    ${smartAlerts
                      .slice(0, 8)
                      .map(
                        alert => html`

                          <div class="activity-row">

                            <div class="activity-icon">
                              ${alert.icon}
                            </div>


                            <div class="activity-main">

                              <strong>
                                ${alert.title}
                              </strong>

                              <span>
                                ${alert.equipmentName}
                              </span>

                              <small>
                                ${alert.message}
                              </small>

                            </div>


                            <div class="activity-date">

                              <strong>
                                ${alert.action}
                              </strong>

                              <span>
                                ${alert.date || ""}
                              </span>

                            </div>

                          </div>

                        `
                      )}

                  </div>

                `
          }

        </section>


        <!-- آخرین فعالیت‌ها -->

        <section class="dashboard-card recent-activity">

          <div class="card-header">

            <div>

              <h2>
                آخرین فعالیت‌ها
              </h2>

              <span>
                آخرین تعمیرات، PM و بازرسی‌های ثبت‌شده
              </span>

            </div>

          </div>


          ${
            recentActivities.length === 0

              ? html`

                  <div class="empty-state">

                    <div class="empty-icon">
                      📋
                    </div>

                    <strong>
                      هنوز فعالیتی ثبت نشده است
                    </strong>

                    <p>
                      بعد از ثبت اولین تعمیر،
                      PM یا بازرسی، فعالیت اینجا نمایش داده می‌شود.
                    </p>

                  </div>

                `

              : html`

                  <div class="activity-list">

                    ${recentActivities.map(
                      activity => html`

                        <div class="activity-row">

                          <div class="activity-icon">

                            ${getActivityIcon(
                              activity.activityType
                            )}

                          </div>


                          <div class="activity-main">

                            <strong>

                              ${getActivityTitle(
                                activity.activityType
                              )}

                            </strong>

                            <span>

                              ${
                                activity.equipmentName ||
                                "تجهیز نامشخص"
                              }

                            </span>

                            <small>

                              ${getActivityResult(
                                activity,
                                activity.activityType
                              )}

                            </small>

                          </div>


                          <div class="activity-date">

                            <strong>
                              ${activity.date || "-"}
                            </strong>

                            <span>
                              ${activity.time || ""}
                            </span>

                          </div>

                        </div>

                      `
                    )}

                  </div>

                `
          }

        </section>


        <!-- خلاصه فعالیت -->

        <section class="dashboard-card recent-activity">

          <div class="card-header">

            <div>

              <h2>
                خلاصه فعالیت سیستم
              </h2>

              <span>
                آمار واقعی ثبت‌شده در سیستم
              </span>

            </div>

          </div>


          <div class="activity-summary">


            <div class="activity-item">

              <span class="activity-number">
                ${totalRepairs}
              </span>

              <span>
                تعمیر ثبت‌شده
              </span>

            </div>


            <div class="activity-item">

              <span class="activity-number">
                ${totalPM}
              </span>

              <span>
                PM ثبت‌شده
              </span>

            </div>


            <div class="activity-item">

              <span class="activity-number">
                ${totalInspections}
              </span>

              <span>
                بازرسی ثبت‌شده
              </span>

            </div>


            <div class="activity-item">

              <span class="activity-number">
                ${TOTAL_EQUIPMENT}
              </span>

              <span>
                تجهیز تحت مدیریت
              </span>

            </div>


          </div>

        </section>


      </main>


      <footer class="app-footer">

        <div>
          پرنیان صنعت
        </div>

        <span>
          همراه شما در حفظ بهره‌وری تجهیزات
        </span>

      </footer>

    </div>

  `;
}
