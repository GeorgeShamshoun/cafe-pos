import { supabase } from "../supabase";
import { tafqeetArabic } from "./tafqeetArabic";
import { tafqeetEnglish } from "./tafqeetEnglish";

const T = {
  ar: {
    table:"طاولة",captain:"الكابتن",date:"التاريخ",item:"صنف",price:"السعر",
    qty:"عدد",total:"إجمالي",subtotal:"المجموع",discount:"الخصم",
    grandTotal:"الإجمالي",takeaway:"تيك أواي",cashier:"الكاشير",
    from:"من",to:"الى",footer:"شكراً لزيارتكم",order:"فاتورة",
  },
  en: {
    table:"Table",captain:"Captain",date:"Date",item:"Item",price:"Price",
    qty:"Qty",total:"Total",subtotal:"Subtotal",discount:"Discount",
    grandTotal:"Grand Total",takeaway:"Take Away",cashier:"Cashier",
    from:"From",to:"To",footer:"Thank you for visiting us",order:"Order",
  },
};

export async function printOrder({ selectedOrder, orderItems, cafeInfo, cashierName, lang="ar", onDone }) {
  if (!selectedOrder) return;

  if (lang === "en") {
    return printOrderEN({ selectedOrder, orderItems, cafeInfo, cashierName, onDone });
  }

  const t   = T.ar;
  const now = new Date().toISOString();

  const { error: closeError } = await supabase
    .from("orders").update({ is_closed: true, end_time: now }).eq("id", selectedOrder.id);
  if (closeError) { console.error(closeError); return; }

  if (selectedOrder.table_id) {
    await supabase.from("tables").update({ is_used: false }).eq("id", selectedOrder.table_id);
  }

  let captainName = "";
  if (selectedOrder.captain_id) {
    const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.captain_id).single();
    captainName = data?.name || "";
  }
  const formatMoney = (val) => Number(val || 0).toFixed(2);

  const dateOpts = { year:"numeric", month:"long", day:"numeric" };
  const timeOpts = { hour:"2-digit", minute:"2-digit", hour12:true };

  const orderDate = selectedOrder.start_time
    ? new Date(selectedOrder.start_time).toLocaleDateString("ar-EG", dateOpts) : "";

  const fmt = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("ar-EG", timeOpts).replace("AM","ص").replace("PM","م");
  };

  const openTime  = fmt(selectedOrder.start_time);
  const closeTime = fmt(now);

  const svcPct       = Number(selectedOrder.order_service_percentage || 0);
  const svcName      = cafeInfo?.service_name_ar || "خدمة";
  const serviceLabel = selectedOrder.is_take_away ? t.takeaway : `${svcName} %${svcPct}`;


  const grandTotalRounded = Math.ceil(Number(selectedOrder.total_amount || 0));
  const grandTotalBigFmt  = grandTotalRounded.toFixed(2); // الرقم الكبير
  const grandTotalFmt = Number(selectedOrder.total_amount || 0).toFixed(2); // الإجمالى الحقيقى
  const tafqeetLineArabic = tafqeetArabic(Number(grandTotalFmt));
 

  const cafeName  = cafeInfo?.name_ar || cafeInfo?.name || "GO CAFE";
  const footerMsg = cafeInfo?.receipt_footer_ar || t.footer;

  const itemsRows = orderItems.map((row) => `
    <tr>
      <td class="td-name">${row.item?.name_ar || row.item_name_snapshot || ""}</td>
      <td class="td-c">${formatMoney(row.unit_price)}</td>
      <td class="td-c">${row.quantity}</td>
      <td class="td-c">${formatMoney(row.total)}</td>
    </tr>
  `).join("");

  const html = `
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:Arial, sans-serif;
          font-size:12px; color:#000; background:#fff;
          width:80mm; padding:3mm 4mm; direction:ltr;
        }
        .divider       { border:none; border-top:1px dashed #000; margin:5px 0; }
        .divider-solid { border:none; border-top:1px solid #000; margin:5px 0;}
        .cafe-name { font-size:18px; font-weight:900; text-align:center; margin-bottom:2px; }
        .header-row   { display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start; margin:5px 0; }
        .header-left  { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; }
        .shift-big    { font-size:24px; font-weight:900; line-height:1; text-align:center; }
        .sn-label     { font-size:11px; font-weight:700; color:#333; text-align:center; }
        .header-right { text-align:right; line-height:1.9; direction:rtl; font-size:12px; }
        .header-right .bold { font-weight:700; font-size:13px; }
        table { width:100%; border-collapse:collapse; margin:4px 0; font-size:11px; direction:rtl; }
        thead tr { background:#c8cacd !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        th { padding:3px 4px; border:0.5px solid #000; text-align:center; font-weight:700; color:#000; background:#c8cacd !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .td-name { text-align:right; padding:2px 4px; border:0.5px solid #000; direction:rtl; }
        .td-c    { text-align:center; padding:2px 4px; border:0.5px solid #000; }
        .totals-section { display:flex; flex-direction:row; align-items:center; margin:5px 0; gap:6px; }
        .totals-list    { flex:1; font-size:11px; order:1; }
        .totals-row     { display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; gap:2px; padding:1px 4px; }
        .t-label        { text-align:right; direction:rtl; font-size:11px; flex:1; }
        .t-value        { text-align:left; font-size:11px; font-weight:600; min-width:55px; }
        .totals-row.final {
          background:#c8cacd; border:1px solid #888; border-radius:3px;
          padding:1px 4px; margin-top:3px; font-size:12px; font-weight:900;
          -webkit-print-color-adjust:exact; print-color-adjust:exact;
        }
        .total-big-wrap { order:2; display:flex; align-items:center; justify-content:flex-end; padding:0 6px; min-width:80px; }
        .total-big-num  { font-size:26px; font-weight:900; text-align:center; white-space:nowrap; }
        .tafqeet { font-size:11px; font-weight:700; text-align:right; direction:rtl; color:#333; margin-top:3px; }
        .footer      { margin-top:6px; text-align:center; }
        .footer-msg  { font-size:13px; font-weight:700; margin-bottom:4px; direction:rtl; }
        .cashier-row { display:flex; flex-direction:row; justify-content:space-between; font-size:11px; margin-top:3px; }
        .cashier-name { text-align:left; }
        .time-range   { text-align:right; direction:rtl; }
        @page { size:80mm auto; margin:0; }
        @media print { body { width:80mm; padding:2mm 3mm; } }
      </style>
    </head>
    <body>
      <div class="cafe-name">${cafeName}</div>
      <hr class="divider-solid" />
      <div class="header-row">
        <div class="header-left">
          <div class="shift-big">${selectedOrder.order_shift_type || ""}</div>
          <div class="sn-label">${selectedOrder.order_no || ""}</div>
        </div>
        <div class="header-right">
          <div class="bold">${t.table} : ${selectedOrder.tables?.table_name || ""}</div>
          <div>${t.captain} : ${captainName}</div>
          <div>${t.date} : ${orderDate}</div>
        </div>
      </div>

      <table>
        <thead><tr>
          <th>${t.item}</th><th>${t.price}</th><th>${t.qty}</th><th>${t.total}</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div class="totals-section">
        <div class="totals-list">
          <div class="totals-row">
            <span class="t-value">${formatMoney(selectedOrder.subtotal)}</span>
            <span class="t-label">${t.subtotal}</span>
          </div>
          <div class="totals-row">
            <span class="t-value">${formatMoney(selectedOrder.service_amount)}</span>
            <span class="t-label">${serviceLabel}</span>
          </div>
          <div class="totals-row">
            <span class="t-value">${formatMoney(selectedOrder.discount)}</span>
            <span class="t-label">${t.discount}</span>
          </div>
          <div class="totals-row final">
            <span class="t-value">${grandTotalFmt}</span>
            <span class="t-label">${t.grandTotal}</span>
          </div>
        </div>
            <div class="total-big-wrap">
              <div class="total-big-num">${grandTotalBigFmt}</div>
            </div>
      </div>

      <div class="tafqeet">${tafqeetLineArabic}</div>
      <hr class="divider-solid" />
      <div class="footer">
        <div class="footer-msg">${footerMsg}</div>
        <div class="cashier-row">
          <div class="cashier-name">${cashierName || ""}</div>
          <div class="time-range">${t.from} : ${openTime} _ ${t.to} : ${closeTime}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  _printHTML(html, onDone);
}

// =============================================
// EN — نفس تنسيق AR بس معكوس (شمال لـ يمين)
// =============================================
async function printOrderEN({ selectedOrder, orderItems, cafeInfo, cashierName, onDone }) {
  const t   = T.en;
  const now = new Date().toISOString();

  const { error: closeError } = await supabase
    .from("orders").update({ is_closed: true, end_time: now }).eq("id", selectedOrder.id);
  if (closeError) { console.error(closeError); return; }

  if (selectedOrder.table_id) {
    await supabase.from("tables").update({ is_used: false }).eq("id", selectedOrder.table_id);
  }

  let captainName = "";
  if (selectedOrder.captain_id) {
    const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.captain_id).single();
    captainName = data?.name || "";
  }

  const formatMoney = (val) => Number(val || 0).toFixed(2);
  const dateOpts = { year:"numeric", month:"long", day:"numeric" };
  const timeOpts = { hour:"2-digit", minute:"2-digit", hour12:true };

  const orderDate = selectedOrder.start_time
    ? new Date(selectedOrder.start_time).toLocaleDateString("en-US", dateOpts) : "";

  const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString("en-US", timeOpts) : "";

  const openTime  = fmt(selectedOrder.start_time);
  const closeTime = fmt(now);

  const svcPct       = Number(selectedOrder.order_service_percentage || 0);
  const svcName      = cafeInfo?.service_name_en || "Service";
  const serviceLabel = selectedOrder.is_take_away ? t.takeaway : `${svcName} %${svcPct}`;


const grandTotalRounded = Math.ceil(Number(selectedOrder.total_amount || 0));
const grandTotalBigFmt  = grandTotalRounded.toFixed(2); // الرقم الكبير
const grandTotalFmt = Number(selectedOrder.total_amount || 0).toFixed(2); // الإجمالى الحقيقى
 const tafqeetLineEnglish = tafqeetEnglish(Number(grandTotalFmt));

  const cafeName  = cafeInfo?.name_en || cafeInfo?.name || "GO CAFE";
  const footerMsg = cafeInfo?.receipt_footer_en || t.footer;

  // ✅ اسم الصنف من name_en من جدول items عبر item_id — fallback لـ name_ar
  const itemsRows = orderItems.map((row) => {
    const nameEn = (row.item?.name_en && row.item.name_en.trim())
      ? row.item.name_en
      : (row.item?.name_ar || row.item_name_snapshot || "");
    return `
      <tr>
        <td class="td-name">${nameEn}</td>
        <td class="td-c">${formatMoney(row.unit_price)}</td>
        <td class="td-c">${row.quantity}</td>
        <td class="td-c">${formatMoney(row.total)}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:Arial, sans-serif;
          font-size:12px; color:#000; background:#fff;
          width:80mm; padding:3mm 4mm; direction:ltr;
        }
        .divider       { border:none; border-top:1px dashed #000; margin:5px 0; }
 .divider-solid {
  border:none;
  border-top:1px solid #000;
  margin:5px 0;
}
        .cafe-name { font-size:18px; font-weight:900; text-align:center; margin-bottom:2px; }

        /* هيدر: معلومات شمال | شيفت+SN يمين */
        .header-row  { display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start; margin:5px 0; }
        .header-left { text-align:left; line-height:1.9; direction:ltr; font-size:12px; }
        .header-left .bold { font-weight:700; font-size:13px; }
        .header-right { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; }
        .shift-big   { font-size:24px; font-weight:900; line-height:1; text-align:center; }
        .sn-label    { font-size:11px; font-weight:700; color:#333; text-align:center; }

        /* جدول: LTR — Item شمال */
        table { width:100%; border-collapse:collapse; margin:4px 0; font-size:11px; direction:ltr; }
        thead tr { background:#c8cacd !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        th { padding:3px 4px; border:0.5px solid #000; text-align:center; font-weight:700; color:#000; background:#c8cacd !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .td-name { text-align:left;   padding:2px 4px; border:0.5px solid #000; }
        .td-c    { text-align:center; padding:2px 4px; border:0.5px solid #000; }

        /* الإجماليات: رقم كبير شمال | تفاصيل يمين
           عكس AR تماماً */
        .totals-section { display:flex; flex-direction:row; align-items:center; margin:5px 0; gap:6px; }
        .total-big-wrap { display:flex; align-items:center; justify-content:flex-start; padding:0 6px; min-width:80px; }
        .total-big-num  { font-size:26px; font-weight:900; text-align:center; white-space:nowrap; }
        .totals-list    { flex:1; font-size:11px; }
        .totals-row     { display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; gap:2px; padding:1px 4px; }
        .t-label        { text-align:left;  direction:ltr; font-size:11px; flex:1; }
        .t-value        { text-align:right; font-size:11px; font-weight:600; min-width:55px; }
        .totals-row.final {
          background:#c8cacd; border:1px solid #888; border-radius:3px;
          padding:1px 4px; margin-top:3px; font-size:12px; font-weight:900;
          -webkit-print-color-adjust:exact; print-color-adjust:exact;
        }

        /* فوتر: وقت شمال | كاشير يمين */
        .footer      { margin-top:6px; text-align:center; }
        .footer-msg  { font-size:13px; font-weight:700; margin-bottom:4px; direction:ltr; }
        .cashier-row { display:flex; flex-direction:row; justify-content:space-between; font-size:11px; margin-top:3px; }
        .time-range  { text-align:left; }
        .cashier-name { text-align:right; }

        @page { size:80mm auto; margin:0; }
        @media print { body { width:80mm; padding:2mm 3mm; } }
      </style>
    </head>
    <body>
      <div class="cafe-name">${cafeName}</div>
      <hr class="divider-solid" />

      <!-- معلومات شمال | شيفت+SN يمين — عكس AR -->
      <div class="header-row">
        <div class="header-left">
          <div class="bold">${t.table} : ${selectedOrder.tables?.table_name || ""}</div>
          <div>${t.captain} : ${captainName}</div>
          <div>${t.date} : ${orderDate}</div>
        </div>
        <div class="header-right">
          <div class="shift-big">${selectedOrder.order_shift_type || ""}</div>
          <div class="sn-label">${selectedOrder.order_no || ""}</div>
        </div>
      </div>

      <!-- جدول: Item شمال -->
      <table>
        <thead><tr>
          <th>${t.item}</th><th>${t.price}</th><th>${t.qty}</th><th>${t.total}</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <!-- رقم كبير شمال | تفاصيل يمين -->
      <div class="totals-section">
        <div class="total-big-wrap">
            <div class="total-big-num">${grandTotalBigFmt}</div>
        </div>
        <div class="totals-list">
          <div class="totals-row">
            <span class="t-label">${t.subtotal}</span>
            <span class="t-value">${formatMoney(selectedOrder.subtotal)}</span>
          </div>
          <div class="totals-row">
            <span class="t-label">${serviceLabel}</span>
            <span class="t-value">${formatMoney(selectedOrder.service_amount)}</span>
          </div>
          <div class="totals-row">
            <span class="t-label">${t.discount}</span>
            <span class="t-value">${formatMoney(selectedOrder.discount)}</span>
          </div>
          <div class="totals-row final">
            <span class="t-label">${t.grandTotal}</span>
            <span class="t-value">${Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div class="tafqeet">${tafqeetLineEnglish}</div>
      <hr class="divider-solid" />

      <!-- فوتر: وقت شمال | كاشير يمين -->
      <div class="footer">
        <div class="footer-msg">${footerMsg}</div>
        <div class="cashier-row">
          <div class="time-range">${t.from} : ${openTime} _ ${t.to} : ${closeTime}</div>
          <div class="cashier-name">${cashierName || ""}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  _printHTML(html, onDone);
}

// =============================================
// helper
// =============================================
function _printHTML(html, onDone) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:80mm;height:0;border:none;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); onDone?.(); }, 500);
  }, 300);
}