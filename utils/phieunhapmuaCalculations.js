/** Pure calculation helpers for Phiếu nhập mua grid (spec NGHIEP_VU_TINH_LUOI.md) */

export const CALC_BLUR_FIELDS = new Set([
  'sl_chan',
  'sl_quydoi',
  'soluong',
  'dongia_chan',
  'dongia',
  'vat',
]);

/** Số lượng, tiền, VAT, hệ số — không cho âm */
export const NON_NEGATIVE_FIELDS = new Set([
  ...CALC_BLUR_FIELDS,
  'dongia_thau',
  'he_so_ap_gia_dich_vu',
  'dongia_dv',
]);

const toNonNegative = n => (n == null || Number.isNaN(n) || n < 0 ? 0 : n);

export const roundMoney = (n, decimals = 2) => {
  if (n == null || Number.isNaN(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round(Number(n) * factor) / factor;
};

export const parseNum = val => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isNaN(val) ? null : val;
  const s = String(val).replace(/\$|\,/g, '');
  if (s.trim() === '') return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

export const getQuyDoi = row => {
  const qd = parseNum(row?.sl_quydoi);
  if (qd === null || qd <= 0) return 1;
  return qd;
};

/** Đơn giá trước thuế từ giá mua (sau thuế) và % VAT — dongia = dongia_st * 100 / (100 + vat) */
export const calcDongiaTuGiaMua = (giaMua, vatPct) => {
  const dongiaSt = parseNum(giaMua);
  if (dongiaSt === null) return null;
  const vat = toNonNegative(parseNum(vatPct) ?? 0);
  return roundMoney((dongiaSt * 100) / (100 + vat), 2);
};

/** Map GiaMua + vat từ GET /qlduoc/thuoc → cột giá lưới phiếu nhập */
export const buildThuocPriceFieldsFromApi = item => {
  if (!item || typeof item !== 'object') {
    return { vat: '', dongia_st: '', dongia: '' };
  }
  const giaMua = parseNum(
    item.GiaMua ?? item.giaMua ?? item.GIAMUA ?? item.gia_mua
  );
  const vatRaw = parseNum(item.vat ?? item.VAT ?? item.Vat);
  if (giaMua === null) {
    return {
      vat: vatRaw ?? '',
      dongia_st: '',
      dongia: '',
    };
  }
  const vat = vatRaw ?? 0;
  const dongia = calcDongiaTuGiaMua(giaMua, vat);
  return {
    vat,
    dongia_st: giaMua,
    dongia: dongia ?? '',
  };
};

/** Apply cross-field conversion before full row recalc (legacy hs_Tinh*) */
export const applyFieldTrigger = (row, field) => {
  const next = { ...row };
  const qd = getQuyDoi(next);

  switch (field) {
    case 'sl_chan': {
      const slChan = toNonNegative(parseNum(next.sl_chan));
      if (parseNum(next.sl_chan) !== null) next.soluong = slChan * qd;
      break;
    }
    case 'soluong': {
      const slLe = toNonNegative(parseNum(next.soluong));
      if (parseNum(next.soluong) !== null && qd > 0) next.sl_chan = slLe / qd;
      break;
    }
    case 'dongia_chan': {
      const dgChan = toNonNegative(parseNum(next.dongia_chan));
      if (parseNum(next.dongia_chan) !== null && qd > 0) {
        next.dongia = dgChan / qd;
      }
      break;
    }
    case 'dongia': {
      const dgLe = toNonNegative(parseNum(next.dongia));
      if (parseNum(next.dongia) !== null) next.dongia_chan = dgLe * qd;
      break;
    }
    case 'sl_quydoi': {
      const slChan = parseNum(next.sl_chan);
      const dgChan = parseNum(next.dongia_chan);
      const qdNew = getQuyDoi(next);
      if (slChan !== null) next.soluong = toNonNegative(slChan * qdNew);
      if (dgChan !== null && qdNew > 0) {
        next.dongia = toNonNegative(dgChan / qdNew);
      }
      break;
    }
    default:
      break;
  }

  return next;
};

/** Recalculate derived money columns for one row (API rounding rules) */
export const recalcRow = row => {
  const slLe = toNonNegative(parseNum(row.soluong));
  const dgLe = toNonNegative(parseNum(row.dongia));
  const vat = toNonNegative(parseNum(row.vat));

  const tienTruocThue = slLe * dgLe;
  const dongiaSt = roundMoney(dgLe * (1 + vat / 100), 2);
  const tienSauThue = slLe * dgLe * (1 + vat / 100);

  return {
    ...row,
    tienTruocThue: roundMoney(tienTruocThue, 2),
    dongia_st: dongiaSt,
    tienSauThue: roundMoney(tienSauThue, 2),
  };
};

/** Footer totals — matches QLDUOC_GET_INFOR_PHIEUNHAPKHO SQL aggregation */
export const recalcFooter = rows => {
  let tongTruoc = 0;
  let tongThue = 0;
  let tongSau = 0;

  for (const row of rows) {
    const sl = parseNum(row.soluong) ?? 0;
    const dg = parseNum(row.dongia) ?? 0;
    const vat = parseNum(row.vat) ?? 0;
    const tienTruoc = sl * dg;
    tongTruoc += tienTruoc;
    tongThue += (tienTruoc * vat) / 100;
    tongSau += sl * dg * (1 + vat / 100);
  }

  return {
    tong_tien_truoc_thue: roundMoney(tongTruoc, 2),
    tong_tien_thue: roundMoney(tongThue, 2),
    tong_tien_sau_thue: roundMoney(tongSau, 2),
  };
};

/** TinhGiaDV — does not change SL / quy đổi / đơn giá chẵn-lẻ */
export const calcTinhGiaDVRow = row => {
  const dongiaSt = parseNum(row.dongia_st) ?? 0;
  const heSo = parseNum(row.he_so_ap_gia_dich_vu) ?? 0;
  const dongiaDv = Math.round((dongiaSt * (100 + heSo)) / 100);
  return { ...row, dongia_dv: dongiaDv };
};

export const mapRowsWithRecalc = rows => rows.map(r => recalcRow(r));
