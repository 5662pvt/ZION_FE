import Head from 'next/head';
import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { useRouter } from 'next/router';
import { Input, Select, Button, DatePicker, TimePicker } from 'antd';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { IoArrowBackOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { useBackOrClose } from '@/hooks/handleBackOrClose';
import CustomTable, {
  FIELD_TYPES,
} from '@/components/khoaduoc/TheTable/TheTable';
import { toast } from '@/utils/toast';
import {
  getDanhMucDoiTuongQuanLy,
  getDanhMucDonViTinh,
  getDanhMucNuocSanXuat,
  getDanhMucNhaCungCap,
  getIdKhoSearch,
  getHeSoByDonGia,
  searchThuocByTenOrMa,
  getThongTinPhieuNhap,
  savePhieuNhap,
  deletePhieuNhap,
  deleteChiTietPhieuNhap,
} from '@/services/quan_ly_duoc.service';
import {
  applyFieldTrigger,
  calcTinhGiaDVRow,
  mapRowsWithRecalc,
  NON_NEGATIVE_FIELDS,
  parseNum,
  recalcFooter,
  recalcRow,
} from '@/utils/phieunhapmuaCalculations';

const EMPTY_OPTIONS = [];
const getPayload = res => res?.data ?? res?.Data ?? null;

const extractList = res => {
  if (Array.isArray(res)) return res;
  if (res?.success === false) return [];
  const payload = getPayload(res);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  return [];
};

const pickField = (row, ...keys) => {
  if (!row || typeof row !== 'object') return '';
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') return row[key];
    const match = Object.keys(row).find(
      k => k.toLowerCase() === String(key).toLowerCase()
    );
    if (match != null && row[match] != null && row[match] !== '') {
      return row[match];
    }
  }
  return '';
};

const isApiSuccess = res =>
  res == null || (res.success !== false && res.success !== 0);

const toPositiveId = raw => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const resolveIdPhieuNhap = (header, routerQuery = {}) => {
  const raw =
    pickField(header, 'idkhoachinh', 'idphieunhap', 'IdPhieuNhap', 'IDPHIEUNHAP') ||
    routerQuery.idPhieuNhap ||
    routerQuery.idphieunhap;
  return toPositiveId(raw);
};

const resolveIdChiTiet = row => {
  const raw = pickField(
    row,
    'idchitietphieunhapkho',
    'IDCHITIETPHIEUNHAPKHO',
    'IdChiTietPhieuNhapKho',
    'idkhoachinh',
    'IDKHOACHINH'
  );
  return toPositiveId(raw);
};

const resolveIdThuoc = row => {
  const raw = pickField(row, 'id_thuoc', 'idthuoc', 'IdThuoc', 'IDTHUOC');
  return toPositiveId(raw);
};

const resolveIdThuocFromApi = async (row, idKho) => {
  const idDirect = resolveIdThuoc(row);
  if (idDirect) return idDirect;

  const ma = row?.ma_hoa_chat ? String(row.ma_hoa_chat).trim() : '';
  const ten = row?.tenthuoc ? String(row.tenthuoc).trim() : '';
  if (!ma && !ten) return null;

  const baseParams = {};
  if (idKho != null && idKho !== '') baseParams.idKho = idKho;
  if (row?.id_loai != null && row?.id_loai !== '') baseParams.loaiThuocId = row.id_loai;

  const attempts = [];
  if (ma) attempts.push({ ...baseParams, tthoatchat: ma });
  if (ten) attempts.push({ ...baseParams, tenThuoc: ten });
  if (ma || ten) attempts.push({ ...baseParams, tthoatchat: ma || undefined, tenThuoc: ten || undefined });

  try {
    for (const params of attempts) {
      const res = await searchThuocByTenOrMa(params);
      const list = extractList(res);
      if (!Array.isArray(list) || !list.length) continue;
      const first = list[0];
      const idRaw = pickField(first, 'idThuoc', 'IDTHUOC', 'id', 'idthuoc');
      const id = toPositiveId(idRaw);
      if (id) return id;
    }
    return null;
  } catch (_e) {
    return null;
  }
};

const formatThuocCell = val =>
  val === null || val === undefined || val === '' ? '' : val;

/** Map 1 dòng API /qlduoc/thuoc → object hiển thị dropdown bảng */
const mapThuocRow = (item, index) => {
  const tenThuoc = String(
    pickField(item, 'tenThuoc', 'TENTHUOC', 'tenthuoc') || ''
  );
  const tthoatchat = String(
    pickField(
      item,
      'tthoatchat',
      'TTHOATCHAT',
      'ma_hoa_chat',
      'maHoaChat',
      'Ma',
      'ma'
    ) || ''
  );
  return {
    key: pickField(item, 'idThuoc', 'IDTHUOC', 'id') || `row-${index}`,
    stt: index + 1,
    tenLoai: pickField(item, 'tenloaiThuoc', 'TENLOAITHUOC', 'ten_loai') || '',
    ma: tthoatchat,
    tenThuoc,
    tthoatchat,
    hoatChat: pickField(item, 'congThuc', 'CONGTHUC', 'hoatChat') || '',
    dvt: pickField(item, 'donViTinh', 'DONVITINH', 'dvt') || '',
    ton: formatThuocCell(pickField(item, 'slTon', 'SLTON')),
    tuNgay: pickField(item, 'ngayHieuLuc', 'NGAYHIEULUC') || '',
    bhyt:
      item?.isBh === true || item?.isBh === 1 || item?.ISBH === 1 ? 'BH' : '',
    giaThau: formatThuocCell(pickField(item, 'GiaThau', 'GIATHAU')),
    idThuoc: formatThuocCell(pickField(item, 'idThuoc', 'IDTHUOC', 'id')),
    raw: item,
  };
};

const parseNgayApDung = raw => {
  if (!raw) return null;
  const d = dayjs(raw);
  if (d.isValid()) return d;
  const d2 = dayjs(raw, 'DD/MM/YYYY');
  if (d2.isValid()) return d2;
  const d3 = dayjs(raw, 'DD/MM/YYYY HH:mm');
  return d3.isValid() ? d3 : null;
};

/** Ghi mã/tên + thông tin liên quan từ dropdown vào row grid */
const buildThuocPickPatch = picked => {
  if (!picked) {
    return {
      id_thuoc: null,
      ma_hoa_chat: '',
      tenthuoc: '',
      id_loai: null,
      ten_loai: '',
      id_dvt_chan: null,
      ten_dvt_chan: '',
      sl_quydoi: 1,
      id_dvt_le: null,
      ten_dvt_le: '',
      vat: '',
      dongia_st: '',
      dongia: '',
      dongia_thau: '',
      ngay_ap_dung: null,
    };
  }
  const raw = picked.raw ?? picked;
  const idThuocRaw =
    pickField(picked, 'idThuoc', 'IDTHUOC', 'id') ||
    pickField(raw, 'idThuoc', 'IDTHUOC', 'id');
  const idThuocNum = Number(idThuocRaw);
  const id_thuoc =
    idThuocRaw == null || idThuocRaw === ''
      ? null
      : Number.isFinite(idThuocNum)
        ? idThuocNum
        : idThuocRaw;
  const ma = String(
    pickField(picked, 'ma', 'tthoatchat') ||
      pickField(
        raw,
        'tthoatchat',
        'TTHOATCHAT',
        'ma_hoa_chat',
        'maHoaChat',
        'Ma',
        'ma'
      ) ||
      ''
  ).trim();
  const tenthuoc = String(
    pickField(picked, 'tenThuoc', 'tenthuoc') ||
      pickField(raw, 'tenThuoc', 'TENTHUOC', 'tenthuoc') ||
      ''
  ).trim();
  const idLoaiRaw = pickField(
    raw,
    'loaiThuocId',
    'LOAITHUOCID',
    'id_loai',
    'LoaiThuocID'
  );
  const idLoaiNum = Number(idLoaiRaw);
  const id_loai =
    idLoaiRaw == null || idLoaiRaw === ''
      ? null
      : Number.isFinite(idLoaiNum)
        ? idLoaiNum
        : idLoaiRaw;

  const ten_loai = String(
    pickField(
      picked,
      'tenLoai',
      'ten_loai'
    ) || pickField(raw, 'tenloaiThuoc', 'TENLOAITHUOC', 'ten_loai') || ''
  ).trim();

  const idDvtRaw = pickField(
    raw,
    'idDvt',
    'IDDVT',
    'idDVT',
    'id_dvt',
    'IdDVT'
  );
  const idDvtNum = Number(idDvtRaw);
  const id_dvt =
    idDvtRaw == null || idDvtRaw === ''
      ? null
      : Number.isFinite(idDvtNum)
        ? idDvtNum
        : idDvtRaw;
  const ten_dvt = String(
    pickField(picked, 'dvt') ||
      pickField(raw, 'donViTinh', 'DONVITINH', 'ten_dvt', 'TenDVT') ||
      ''
  ).trim();

  const dongia_thau = parseNum(
    pickField(picked, 'giaThau') || pickField(raw, 'GiaThau', 'GIATHAU')
  );
  const vat = parseNum(pickField(raw, 'vat', 'VAT', 'Vat')) ?? 0;
  const dongia_st = parseNum(
    pickField(raw, 'GiaMua', 'GIAMUA', 'giaMua', 'gia_mua')
  );
  const dongia =
    dongia_st == null ? '' : Number(((dongia_st * 100) / (100 + vat)).toFixed(2));
  const ngay_ap_dung = parseNgayApDung(
    pickField(picked, 'tuNgay') ||
      pickField(raw, 'ngayHieuLuc', 'NGAYHIEULUC', 'ngay_ap_dung')
  );

  return {
    id_thuoc,
    ma_hoa_chat: ma,
    tenthuoc,
    id_loai: id_loai ?? null,
    ten_loai,
    id_dvt_chan: id_dvt ?? null,
    ten_dvt_chan: ten_dvt,
    sl_quydoi: 1,
    id_dvt_le: id_dvt ?? null,
    ten_dvt_le: ten_dvt,
    vat,
    dongia_st: dongia_st ?? '',
    dongia,
    dongia_thau: dongia_thau ?? '',
    ngay_ap_dung: ngay_ap_dung ?? null,
  };
};

const filterThuocRowForTen = row => !!row.tenThuoc;
/** Browse theo loại: giống Tên (có tên). Gõ tìm mã: chỉ dòng có mã. */
const filterThuocRowForMa = (row, keyword = '') =>
  String(keyword ?? '').trim() ? !!row.ma : !!row.tenThuoc;

const fetchThuocRows = async ({ tenThuoc, tthoatchat, idKho, loaiThuocId }) => {
  const params = {};
  if (tenThuoc) params.tenThuoc = tenThuoc;
  if (tthoatchat) params.tthoatchat = tthoatchat;
  if (idKho != null) params.idKho = idKho;
  if (loaiThuocId != null && loaiThuocId !== '') {
    params.loaiThuocId = loaiThuocId;
  }

  const res = await searchThuocByTenOrMa(params);
  if (res?.success === false) {
    throw new Error(res?.message || 'Không tải được danh sách thuốc');
  }
  return extractList(res);
};

const THUOC_DROPDOWN_COLS_TEN = [
  { key: 'stt', title: 'Stt', width: 56 },
  { key: 'tenLoai', title: 'Loại', width: 104 },
  { key: 'tenThuoc', title: 'Tên', width: 216 },
  { key: 'hoatChat', title: 'Hoạt chất', width: 236 },
  { key: 'dvt', title: 'Đvt', width: 80 },
  { key: 'ton', title: 'Tồn', width: 84 },
  { key: 'tuNgay', title: 'Từ ngày', width: 136 },
  { key: 'bhyt', title: 'BHYT?', width: 76 },
  { key: 'giaThau', title: 'Giá thầu', width: 116 },
  { key: 'idThuoc', title: 'ID', width: 84 },
];

const THUOC_DROPDOWN_COLS_MA = [
  { key: 'stt', title: 'Stt', width: 56 },
  { key: 'tenLoai', title: 'Loại', width: 104 },
  { key: 'ma', title: 'Mã', width: 104 },
  { key: 'tenThuoc', title: 'Tên', width: 200 },
  { key: 'hoatChat', title: 'Hoạt chất', width: 216 },
  { key: 'dvt', title: 'Đvt', width: 80 },
  { key: 'ton', title: 'Tồn', width: 84 },
  { key: 'tuNgay', title: 'Từ ngày', width: 136 },
  { key: 'bhyt', title: 'BHYT?', width: 76 },
  { key: 'giaThau', title: 'Giá thầu', width: 116 },
  { key: 'idThuoc', title: 'ID', width: 84 },
];

const thuocDropdownTableWidth = cols =>
  cols.reduce((sum, c) => sum + c.width, 0);

const ThuocDropdownTable = memo(({ variant, rows, loading, onPick }) => {
  const cols =
    variant === 'ma' ? THUOC_DROPDOWN_COLS_MA : THUOC_DROPDOWN_COLS_TEN;
  const tableWidth = thuocDropdownTableWidth(cols);
  const colStyle = w => ({ width: w, maxWidth: w, minWidth: w });

  if (loading) {
    return (
      <div className='phieunhapmua-thuoc-dropdown__loading'>Đang tải...</div>
    );
  }
  if (!rows.length) {
    return (
      <div className='phieunhapmua-thuoc-dropdown__empty'>Không có dữ liệu</div>
    );
  }

  return (
    <div className='phieunhapmua-thuoc-dropdown__table-wrap'>
      <table
        className='phieunhapmua-thuoc-dropdown__table'
        style={{ width: tableWidth }}
      >
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={colStyle(c.width)}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr
              key={r.key}
              className='phieunhapmua-thuoc-dropdown__row'
              onMouseDown={e => {
                e.preventDefault();
                onPick(r);
              }}
            >
              {cols.map(c => (
                <td
                  key={c.key}
                  style={colStyle(c.width)}
                  title={String(r[c.key] ?? '')}
                >
                  {r[c.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
ThuocDropdownTable.displayName = 'ThuocDropdownTable';

/** Hook load danh sách thuốc từ GET /qlduoc/thuoc (SP trả TOP 10 khi không filter) */
const useThuocRows = ({ idKho, loaiThuocId, searchField, filterRow }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    setRows([]);
  }, [loaiThuocId]);

  const loadRows = useCallback(
    async (keyword = '') => {
      const q = String(keyword ?? '').trim();
      const reqId = ++reqIdRef.current;
      setLoading(true);
      try {
        const params = { idKho, loaiThuocId };
        if (q) params[searchField] = q;
        const list = await fetchThuocRows(params);
        if (reqId !== reqIdRef.current) return;
        const mapped = list.map(mapThuocRow);
        setRows(filterRow ? mapped.filter(r => filterRow(r, q)) : mapped);
      } catch (e) {
        if (reqId !== reqIdRef.current) return;
        console.error(e);
        toast.error(e?.message || 'Lỗi khi tải danh sách thuốc');
        setRows([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    },
    [idKho, loaiThuocId, searchField, filterRow]
  );

  const debouncedSearch = useCallback(
    keyword => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => loadRows(keyword), 300);
    },
    [loadRows]
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { rows, loading, loadRows, debouncedSearch };
};

/**
 * Select thuốc: click 1 lần = focus ô (không mở dropdown / không gọi API).
 * Double-click hoặc gõ ký tự = mở dropdown + load data.
 */
const ThuocSearchSelect = memo(
  ({
    value,
    row,
    idKho,
    placeholder,
    searchField,
    variant,
    filterRow,
    onPickRow,
  }) => {
    const [open, setOpen] = useState(false);
    const loaiThuocId = row.id_loai ?? null;
    const { rows, loading, loadRows, debouncedSearch } = useThuocRows({
      idKho,
      loaiThuocId,
      searchField,
      filterRow,
    });

    const openAndLoad = useCallback(() => {
      setOpen(true);
      loadRows(value ?? '');
    }, [loadRows, value]);

    const selectOptions = useMemo(
      () =>
        rows.map(r => {
          const optionValue = r.idThuoc ?? r.key;
          return {
            value: optionValue,
            label:
              variant === 'ma'
                ? r.ma || r.tenThuoc || String(optionValue ?? '')
                : r.tenThuoc,
            row: r,
          };
        }),
      [rows, variant]
    );

    const handlePick = useCallback(
      item => {
        setOpen(false);
        onPickRow(row, item);
      },
      [onPickRow, row]
    );

    return (
      <Select
        showSearch
        allowClear
        className='w-100 phieunhapmua-thuoc-select'
        placeholder={placeholder}
        loading={loading}
        open={open}
        value={value != null && value !== '' ? String(value) : undefined}
        options={selectOptions}
        filterOption={false}
        autoClearSearchValue={false}
        popupMatchSelectWidth={false}
        classNames={{ popup: 'phieunhapmua-thuoc-dropdown' }}
        styles={{
          popup: {
            root: {
              padding: 0,
              width: thuocDropdownTableWidth(
                variant === 'ma'
                  ? THUOC_DROPDOWN_COLS_MA
                  : THUOC_DROPDOWN_COLS_TEN
              ),
            },
          },
        }}
        popupRender={menu => (
          <>
            <ThuocDropdownTable
              variant={variant}
              rows={rows}
              loading={loading}
              onPick={handlePick}
            />
            <div className='d-none'>{menu}</div>
          </>
        )}
        onOpenChange={visible => {
          if (!visible) setOpen(false);
        }}
        onDoubleClick={e => {
          e.preventDefault();
          e.stopPropagation();
          openAndLoad();
        }}
        onSearch={q => {
          setOpen(true);
          debouncedSearch(q);
        }}
        onChange={(next, opt) => {
          if (next == null || next === '') {
            onPickRow(row, null);
            return;
          }
          if (opt?.row) {
            onPickRow(row, opt.row);
          }
        }}
      />
    );
  }
);
ThuocSearchSelect.displayName = 'ThuocSearchSelect';

/** Ô Mã (tthoatchat) — chọn mã thì tự điền tên */
const ThuocMaCell = memo(({ value, row, idKho, onRowPatch }) => (
  <ThuocSearchSelect
    value={value}
    row={row}
    idKho={idKho}
    variant='ma'
    filterRow={filterThuocRowForMa}
    placeholder='Chọn mã...'
    searchField='tthoatchat'
    onPickRow={(r, picked) => onRowPatch(r, buildThuocPickPatch(picked))}
  />
));
ThuocMaCell.displayName = 'ThuocMaCell';

/** Ô Tên (tenThuoc) — chọn tên thì điền mã nếu có, không có thì để trống mã */
const ThuocTenCell = memo(({ value, row, idKho, onRowPatch }) => (
  <ThuocSearchSelect
    value={value}
    row={row}
    idKho={idKho}
    variant='ten'
    filterRow={filterThuocRowForTen}
    placeholder='Chọn tên...'
    searchField='tenThuoc'
    onPickRow={(r, picked) => onRowPatch(r, buildThuocPickPatch(picked))}
  />
));
ThuocTenCell.displayName = 'ThuocTenCell';

const isAllowed = flag => Number(flag) === 1;

const ANT_PORTAL_SELECTOR =
  '.ant-select-dropdown, .ant-picker-dropdown, .ant-picker-panel, .ant-dropdown';

const nowDefault = () => dayjs();

const DEFAULT_HEADER = {
  idkhoachinh: null,
  maphieunhap: '',
  ngay_nhap: nowDefault().format('DD/MM/YYYY'),
  gio_nhap: nowDefault().format('HH'),
  phut_nhap: nowDefault().format('mm'),
  idnhacungcap: null,
  tennhacungcap: '',
  idkho: null,
  tenkho: '',
  isSoHD: false,
  sohoadon: '',
  ngayhoadon: null,
  vat: 5.0,
  id_nguoinhap: null,
  ten_nguoinhap: '',
  tong_tien_truoc_thue: 0,
  tong_tien_thue: 0,
  tong_tien_sau_thue: 0,
  ghichu: '',
  edit: 1,
  del: 1,
};

const getNgayNhapDayjs = header => {
  if (!header?.ngay_nhap) return null;
  const d = dayjs(header.ngay_nhap, 'DD/MM/YYYY');
  if (!d.isValid()) return null;
  const gio = parseInt(header.gio_nhap ?? '0', 10) || 0;
  const phut = parseInt(header.phut_nhap ?? '0', 10) || 0;
  return d.hour(gio).minute(phut).second(0);
};

const setNgayNhapFromDayjs = val => {
  if (!val) return { ngay_nhap: null, gio_nhap: '', phut_nhap: '' };
  return {
    ngay_nhap: val.format('DD/MM/YYYY'),
    gio_nhap: String(val.hour()).padStart(2, '0'),
    phut_nhap: String(val.minute()).padStart(2, '0'),
  };
};

const mapMasterToHeader = master => {
  const ngayhoadon = master.ngayhoadon
    ? dayjs(master.ngayhoadon, 'DD/MM/YYYY')
    : null;
  const idPhieu =
    pickField(
      master,
      'idphieunhap',
      'IDPHIEUNHAP',
      'idkhoachinh',
      'IDKHOACHINH',
      'IdPhieuNhap'
    ) || null;
  return {
    idkhoachinh: idPhieu,
    maphieunhap: master.maphieunhap ?? '',
    ngay_nhap: master.ngay_nhap ?? '',
    gio_nhap:
      master.gio_nhap != null ? String(master.gio_nhap).padStart(2, '0') : '',
    phut_nhap:
      master.phut_nhap != null ? String(master.phut_nhap).padStart(2, '0') : '',
    idnhacungcap: master.idnhacungcap ?? null,
    tennhacungcap: master.tennhacungcap ?? '',
    idkho: master.idkho ?? null,
    tenkho: master.tenkho ?? '',
    isSoHD: !!master.sohoadon,
    sohoadon: master.sohoadon ?? '',
    ngayhoadon: ngayhoadon?.isValid() ? ngayhoadon : null,
    vat: master.vat ?? 0,
    id_nguoinhap: master.id_nguoinhap ?? null,
    ten_nguoinhap: master.ten_nguoinhap ?? '',
    tong_tien_truoc_thue: master.tong_tien_truoc_thue ?? 0,
    tong_tien_thue: master.tong_tien_thue ?? 0,
    tong_tien_sau_thue: master.tong_tien_sau_thue ?? 0,
    ghichu: master.ghichu ?? '',
    edit: master.edit ?? 0,
    del: master.del ?? 0,
  };
};

const mapDetailToRow = (d, index) => {
  const idChiTiet =
    pickField(
      d,
      'idchitietphieunhapkho',
      'IDCHITIETPHIEUNHAPKHO',
      'IdChiTietPhieuNhapKho',
      'idkhoachinh',
      'IDKHOACHINH'
    ) || null;
  return recalcRow({
    lineId:
      idChiTiet != null
        ? String(idChiTiet)
        : `NEW_RECORD_${Date.now()}_${index}`,
    stt: index + 1,
    idkhoachinh: idChiTiet,
    id_thuoc: pickField(d, 'idthuoc', 'IDTHUOC', 'id_thuoc', 'IdThuoc') || null,
    id_loai: d.id_loai ?? null,
    ten_loai: d.ten_loai ?? '',
    ma_hoa_chat: d.ma_hoa_chat ?? '',
    tenthuoc: d.tenthuoc ?? '',
    id_dvt_chan: d.id_dvt_chan ?? null,
    ten_dvt_chan: d.ten_dvt_chan ?? '',
    sl_chan: d.sl_chan ?? '',
    sl_quydoi: d.sl_quydoi ?? '',
    id_dvt_le: d.id_dvt_le ?? null,
    ten_dvt_le: d.ten_dvt_le ?? '',
    soluong: d.soluong ?? '',
    dongia_chan: d.dongia_chan ?? '',
    dongia: d.dongia ?? '',
    tienTruocThue: '',
    vat: d.vat ?? '',
    dongia_st: d.dongia_st ?? '',
    dongia_thau: d.dongia_thau ?? '',
    tienSauThue: '',
    he_so_ap_gia_dich_vu: d.he_so_ap_gia_dich_vu ?? '',
    dongia_dv: d.dongia_dv ?? '',
    id_nuoc_san_xuat: d.id_nuoc_san_xuat ?? null,
    ten_nuoc_san_xuat: d.ten_nuoc_san_xuat ?? '',
    losanxuat: d.losanxuat ?? '',
    han_su_dung: d.han_su_dung ? dayjs(d.han_su_dung) : null,
    ngay_ap_dung: d.ngay_ap_dung ? dayjs(d.ngay_ap_dung, 'DD/MM/YYYY') : null,
    rowEdit: d.edit ?? 0,
    rowDel: d.del ?? 0,
  });
};

const HeaderField = ({ label, className = '', children }) => (
  <div className={`phieunhapmua-item ${className}`}>
    {label ? <span className='phieunhapmua-label'>{label}</span> : null}
    <div className='phieunhapmua-control'>{children}</div>
  </div>
);

const makeNewRecord = (stt = 1) => ({
  lineId: `NEW_RECORD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  stt,
  idkhoachinh: null,
  id_thuoc: null,
  id_loai: null,
  ten_loai: '',
  ma_hoa_chat: null,
  tenthuoc: '',
  id_dvt_chan: null,
  ten_dvt_chan: '',
  sl_chan: '',
  sl_quydoi: '',
  id_dvt_le: null,
  ten_dvt_le: '',
  soluong: '',
  dongia_chan: '',
  dongia: '',
  tienTruocThue: '',
  vat: '',
  dongia_st: '',
  dongia_thau: '',
  tienSauThue: '',
  he_so_ap_gia_dich_vu: 0,
  dongia_dv: '',
  id_nuoc_san_xuat: null,
  ten_nuoc_san_xuat: '',
  losanxuat: '',
  han_su_dung: null,
  ngay_ap_dung: null,
  rowEdit: 1,
  rowDel: 1,
});

const ROW_INPUT_FIELDS = [
  'id_thuoc',
  'id_loai',
  'ma_hoa_chat',
  'tenthuoc',
  'id_dvt_chan',
  'sl_chan',
  'sl_quydoi',
  'id_dvt_le',
  'soluong',
  'dongia_chan',
  'dongia',
  'vat',
  'dongia_thau',
  'id_nuoc_san_xuat',
  'losanxuat',
  'han_su_dung',
  'ngay_ap_dung',
];

const isEmptyValue = value =>
  value == null || value === '' || (typeof value === 'number' && Number.isNaN(value));

const rowHasInputData = row =>
  ROW_INPUT_FIELDS.some(field => !isEmptyValue(row?.[field]));

const ensureTrailingBlankRow = rows => {
  const lastRow = rows[rows.length - 1];
  const hasBlankAtBottom =
    !!lastRow && !lastRow?.idkhoachinh && !rowHasInputData(lastRow);
  const next = hasBlankAtBottom
    ? rows
    : [...rows, recalcRow(makeNewRecord(rows.length + 1))];
  return next.map((r, i) => ({ ...r, stt: i + 1 }));
};

/** Select danh mục: click 1 lần = focus; double-click = load + mở dropdown */
const DoubleClickSelectCell = memo(
  ({
    value,
    row,
    displayIndex,
    dataIndex,
    placeholder,
    options,
    loading,
    onEnsureOptions,
    onRowChange,
    onChangeExtra,
  }) => {
    const [open, setOpen] = useState(false);
    const selectedLabel = row?.[displayIndex];
    const effectiveOptions = useMemo(() => {
      if (value == null || value === '') return options;
      const baseOptions = options ?? [];
      const hasSelected = baseOptions.some(
        o => String(o?.value) === String(value)
      );
      if (hasSelected || !selectedLabel) return baseOptions;
      return [{ value, label: selectedLabel }, ...baseOptions];
    }, [options, selectedLabel, value]);

    const openAndLoad = useCallback(async () => {
      await onEnsureOptions?.();
      setOpen(true);
    }, [onEnsureOptions]);

    if (row.edit === 0) {
      return <span>{row[displayIndex] ?? ''}</span>;
    }

    return (
      <Select
        showSearch
        allowClear
        className='w-100'
        placeholder={placeholder}
        loading={loading}
        open={open}
        value={value ?? undefined}
        options={effectiveOptions}
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onOpenChange={visible => {
          if (!visible) setOpen(false);
        }}
        onDoubleClick={e => {
          e.preventDefault();
          e.stopPropagation();
          openAndLoad();
        }}
        onChange={(next, opt) => {
          onRowChange(row, dataIndex, next ?? null);
          if (onChangeExtra) {
            const resolvedOpt =
              opt ??
              effectiveOptions.find(
                o => String(o?.value) === String(next)
              );
            onChangeExtra(row, next, resolvedOpt);
          }
        }}
      />
    );
  }
);
DoubleClickSelectCell.displayName = 'DoubleClickSelectCell';

const buildDoubleClickSelectColumn = ({
  title,
  dataIndex,
  displayIndex,
  width,
  align = 'left',
  onRowChange,
  options = EMPTY_OPTIONS,
  loading = false,
  onEnsureOptions,
  onChangeExtra,
  placeholder = '',
}) => ({
  title,
  dataIndex,
  width,
  align,
  type: FIELD_TYPES.CUSTOM,
  render: (value, row) => (
    <DoubleClickSelectCell
      value={value}
      row={row}
      dataIndex={dataIndex}
      displayIndex={displayIndex}
      placeholder={placeholder}
      options={options}
      loading={loading}
      onEnsureOptions={onEnsureOptions}
      onRowChange={onRowChange}
      onChangeExtra={onChangeExtra}
    />
  ),
});

const formatCellNumber = value =>
  value === null || value === undefined || value === '' ? '' : value;

const buildCalcNumberColumn = ({
  title,
  dataIndex,
  width,
  align = 'left',
  onRowFieldBlur,
}) => ({
  title,
  dataIndex,
  width,
  align,
  type: FIELD_TYPES.CUSTOM,
  render: (value, row) =>
    row.edit === 0 ? (
      <span
        className={
          align === 'right' || align === 'center' ? `d-block text-${align}` : ''
        }
      >
        {formatCellNumber(value)}
      </span>
    ) : (
      <input
        type='number'
        min={0}
        step='any'
        className='form-control form-control-sm'
        key={`${row.lineId}-${dataIndex}-${value}`}
        defaultValue={value ?? ''}
        onBlur={e => onRowFieldBlur(row, dataIndex, e.target.value)}
      />
    ),
});

const buildReadonlyMoneyColumn = ({ title, dataIndex, width }) => ({
  title,
  dataIndex,
  width,
  align: 'right',
  type: FIELD_TYPES.CUSTOM,
  render: value => (
    <span className='d-block text-end'>{formatCellNumber(value)}</span>
  ),
});

const buildBodyFieldColumns = (
  onRowChange,
  onRowFieldBlur,
  {
    loaiOptions = EMPTY_OPTIONS,
    loaiLoading = false,
    onEnsureLoaiOptions,
    dvtOptions = EMPTY_OPTIONS,
    dvtLoading = false,
    onEnsureDvtOptions,
    nuocSxOptions = EMPTY_OPTIONS,
    nuocSxLoading = false,
    onEnsureNuocSxOptions,
    idKho = null,
    onRowPatch,
  } = {}
) => [
  buildDoubleClickSelectColumn({
    title: 'Loại',
    dataIndex: 'id_loai',
    displayIndex: 'ten_loai',
    width: 100,
    onRowChange,
    options: loaiOptions,
    loading: loaiLoading,
    onEnsureOptions: onEnsureLoaiOptions,
    placeholder: 'Chọn loại...',
    onChangeExtra: (row, val, opt) => {
      onRowChange(row, 'ten_loai', opt?.label ?? '');
      if (onRowPatch) {
        onRowPatch(row, { id_thuoc: null, ma_hoa_chat: '', tenthuoc: '' });
      }
    },
  }),
  {
    title: 'Mã',
    dataIndex: 'ma_hoa_chat',
    width: 110,
    type: FIELD_TYPES.CUSTOM,
    render: (value, row) =>
      row.edit === 0 ? (
        <span>{value ?? ''}</span>
      ) : (
        <ThuocMaCell
          value={value}
          row={row}
          idKho={idKho}
          onRowPatch={onRowPatch}
        />
      ),
  },
  {
    title: 'Tên',
    dataIndex: 'tenthuoc',
    width: 250,
    type: FIELD_TYPES.CUSTOM,
    render: (value, row) =>
      row.edit === 0 ? (
        <span>{value ?? ''}</span>
      ) : (
        <ThuocTenCell
          value={value}
          row={row}
          idKho={idKho}
          onRowPatch={onRowPatch}
        />
      ),
  },
  buildDoubleClickSelectColumn({
    title: 'Đvt chẵn',
    dataIndex: 'id_dvt_chan',
    displayIndex: 'ten_dvt_chan',
    width: 100,
    align: 'center',
    onRowChange,
    options: dvtOptions,
    loading: dvtLoading,
    onEnsureOptions: onEnsureDvtOptions,
    placeholder: 'Chọn Đvt...',
    onChangeExtra: (row, val, opt) => {
      onRowChange(row, 'ten_dvt_chan', opt?.label ?? '');
    },
  }),
  buildCalcNumberColumn({
    title: 'Sl chẵn',
    dataIndex: 'sl_chan',
    width: 70,
    align: 'center',
    onRowFieldBlur,
  }),
  buildCalcNumberColumn({
    title: 'Q.đổi',
    dataIndex: 'sl_quydoi',
    width: 60,
    align: 'center',
    onRowFieldBlur,
  }),
  buildDoubleClickSelectColumn({
    title: 'Đvt lẻ',
    dataIndex: 'id_dvt_le',
    displayIndex: 'ten_dvt_le',
    width: 100,
    align: 'center',
    onRowChange,
    options: dvtOptions,
    loading: dvtLoading,
    onEnsureOptions: onEnsureDvtOptions,
    placeholder: 'Chọn Đvt...',
    onChangeExtra: (row, val, opt) => {
      onRowChange(row, 'ten_dvt_le', opt?.label ?? '');
    },
  }),
  buildCalcNumberColumn({
    title: 'Sl lẻ',
    dataIndex: 'soluong',
    width: 70,
    align: 'center',
    onRowFieldBlur,
  }),
  buildCalcNumberColumn({
    title: 'Đ.giá chẵn',
    dataIndex: 'dongia_chan',
    width: 95,
    align: 'right',
    onRowFieldBlur,
  }),
  buildCalcNumberColumn({
    title: 'Đ.giá lẻ',
    dataIndex: 'dongia',
    width: 85,
    align: 'right',
    onRowFieldBlur,
  }),
  buildReadonlyMoneyColumn({
    title: 'Tiền trước thuế',
    dataIndex: 'tienTruocThue',
    width: 110,
  }),
  buildCalcNumberColumn({
    title: 'Vat (%)',
    dataIndex: 'vat',
    width: 65,
    align: 'center',
    onRowFieldBlur,
  }),
  buildReadonlyMoneyColumn({
    title: 'Đ.giá có vat',
    dataIndex: 'dongia_st',
    width: 100,
  }),
  {
    title: 'Giá thầu',
    dataIndex: 'dongia_thau',
    width: 85,
    align: 'right',
    type: FIELD_TYPES.NUMBER,
  },
  buildReadonlyMoneyColumn({
    title: 'Tiền sau thuế',
    dataIndex: 'tienSauThue',
    width: 110,
  }),
  {
    title: 'Hệ số đđ dv',
    dataIndex: 'he_so_ap_gia_dich_vu',
    width: 90,
    align: 'center',
    type: FIELD_TYPES.NUMBER,
  },
  {
    title: 'Đ.giá dv',
    dataIndex: 'dongia_dv',
    width: 85,
    align: 'right',
    type: FIELD_TYPES.NUMBER,
  },
  buildDoubleClickSelectColumn({
    title: 'Nước sx',
    dataIndex: 'id_nuoc_san_xuat',
    displayIndex: 'ten_nuoc_san_xuat',
    width: 110,
    onRowChange,
    options: nuocSxOptions,
    loading: nuocSxLoading,
    onEnsureOptions: onEnsureNuocSxOptions,
    placeholder: 'Chọn nước...',
    onChangeExtra: (row, val, opt) => {
      onRowChange(row, 'ten_nuoc_san_xuat', opt?.label ?? '');
    },
  }),
  {
    title: 'Lô sx',
    dataIndex: 'losanxuat',
    width: 80,
    type: FIELD_TYPES.TEXT,
  },
  {
    title: 'Hạn sd',
    dataIndex: 'han_su_dung',
    width: 90,
    type: FIELD_TYPES.CUSTOM,
    render: (value, row) =>
      row.edit === 0 ? (
        <span>{value ? dayjs(value).format('DD/MM/YYYY') : ''}</span>
      ) : (
        <DatePicker
          className='w-100'
          size='small'
          format='DD/MM/YYYY'
          value={value ? dayjs(value) : null}
          onChange={val => onRowChange(row, 'han_su_dung', val)}
        />
      ),
  },
  {
    title: 'Ngày áp dụng',
    dataIndex: 'ngay_ap_dung',
    width: 90,
    type: FIELD_TYPES.CUSTOM,
    render: (value, row) =>
      row.edit === 0 ? (
        <span>{value ? dayjs(value).format('DD/MM/YYYY') : ''}</span>
      ) : (
        <DatePicker
          className='w-100'
          size='small'
          format='DD/MM/YYYY'
          value={value ? dayjs(value) : null}
          onChange={val => onRowChange(row, 'ngay_ap_dung', val)}
        />
      ),
  },
];

const PhieuNhapMua = () => {
  const router = useRouter();
  const [headerData, setHeaderData] = useState(DEFAULT_HEADER);
  const [tableData, setTableData] = useState([makeNewRecord(1)]);
  const [editingLineId, setEditingLineId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tinhGiaDvLoading, setTinhGiaDvLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletePhieuLoading, setDeletePhieuLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const handleBackOrClose = useBackOrClose();

  // ---- Dropdown options ----
  const [khoOptions, setKhoOptions] = useState(EMPTY_OPTIONS);
  const [khoLoading, setKhoLoading] = useState(false);
  const [nhaCungCapOptions, setNhaCungCapOptions] = useState(EMPTY_OPTIONS);
  const [nhaCungCapLoading, setNhaCungCapLoading] = useState(false);
  const [loaiOptions, setLoaiOptions] = useState(EMPTY_OPTIONS);
  const [loaiLoading, setLoaiLoading] = useState(false);
  const loaiLoadedRef = useRef(false);
  const [dvtOptions, setDvtOptions] = useState(EMPTY_OPTIONS);
  const [dvtLoading, setDvtLoading] = useState(false);
  const dvtLoadedRef = useRef(false);
  const [nuocSxOptions, setNuocSxOptions] = useState(EMPTY_OPTIONS);
  const [nuocSxLoading, setNuocSxLoading] = useState(false);
  const nuocSxLoadedRef = useRef(false);

  const ensureLoaiOptions = useCallback(async () => {
    if (loaiLoadedRef.current) return;
    setLoaiLoading(true);
    try {
      const res = await getDanhMucDoiTuongQuanLy({
        currentPage: 1,
        pageSize: 200,
      });
      const loaiPayload = getPayload(res);
      if (Array.isArray(loaiPayload?.data)) {
        setLoaiOptions(
          loaiPayload.data.map(i => ({
            label: i.TenLoai ?? i.ten_loai ?? '',
            value: i.LoaiThuocID ?? i.id_loai ?? null,
          }))
        );
        loaiLoadedRef.current = true;
      }
    } catch (e) {
      console.error('Lỗi load loại:', e);
    } finally {
      setLoaiLoading(false);
    }
  }, []);

  const ensureDvtOptions = useCallback(async () => {
    if (dvtLoadedRef.current) return;
    setDvtLoading(true);
    try {
      const res = await getDanhMucDonViTinh({ currentPage: 1, pageSize: 500 });
      const dvtPayload = getPayload(res);
      if (Array.isArray(dvtPayload?.data)) {
        setDvtOptions(
          dvtPayload.data.map(i => ({
            label: i.TenDVT ?? i.ten_dvt ?? '',
            value: i.Id ?? i.id ?? null,
          }))
        );
        dvtLoadedRef.current = true;
      }
    } catch (e) {
      console.error('Lỗi load Đvt:', e);
    } finally {
      setDvtLoading(false);
    }
  }, []);

  const ensureNuocSxOptions = useCallback(async () => {
    if (nuocSxLoadedRef.current) return;
    setNuocSxLoading(true);
    try {
      const res = await getDanhMucNuocSanXuat({
        currentPage: 1,
        pageSize: 500,
      });
      const nuocPayload = getPayload(res);
      if (Array.isArray(nuocPayload?.data)) {
        setNuocSxOptions(
          nuocPayload.data
            .map(i => {
              const valueRaw = pickField(
                i,
                'id_nuoc',
                'IdNuocSX',
                'ID_NUOC',
                'IDNUOCSX',
                'id'
              );
              const valueNum = Number(valueRaw);
              const value =
                valueRaw == null || valueRaw === ''
                  ? null
                  : Number.isFinite(valueNum)
                    ? valueNum
                    : valueRaw;
              return {
                label: pickField(i, 'ten_nuoc', 'tenNuocSX', 'TEN_NUOC') || '',
                value,
              };
            })
            .filter(o => o.label && o.value != null && o.value !== '')
        );
        nuocSxLoadedRef.current = true;
      }
    } catch (e) {
      console.error('Lỗi load nước sx:', e);
    } finally {
      setNuocSxLoading(false);
    }
  }, []);

  const searchKho = useCallback(async (q = '') => {
    setKhoLoading(true);
    try {
      const res = await getIdKhoSearch({ q, isKhoNhap: '1' });
      const list = extractList(res);
      setKhoOptions(
        list
          .map(i => {
            const idRaw = pickField(i, 'idkho', 'IDKHO');
            const idNum = Number(idRaw);
            return {
              label: pickField(i, 'tenkho', 'TENKHO'),
              value: Number.isFinite(idNum) ? idNum : idRaw,
            };
          })
          .filter(o => o.label && o.value != null && o.value !== '')
      );
    } catch (e) {
      console.error(e);
    } finally {
      setKhoLoading(false);
    }
  }, []);

  useEffect(() => {
    searchKho('');
  }, [searchKho]);

  const searchNhaCungCap = useCallback(async (q = '') => {
    setNhaCungCapLoading(true);
    try {
      const res = await getDanhMucNhaCungCap({
        currentPage: 1,
        pageSize: 500,
        tennhacungcap: q || undefined,
      });
      const payload = getPayload(res);
      const list = payload?.data ?? payload?.Data ?? [];
      if (Array.isArray(list)) {
        setNhaCungCapOptions(
          list
            .map(i => {
              const idRaw = pickField(
                i,
                'nhacungcapid',
                'NhaCungCapID',
                'idnhacungcap',
                'id'
              );
              const idNum = Number(idRaw);
              return {
                label: pickField(i, 'tennhacungcap', 'TenNhaCungCap', 'ten'),
                value: Number.isFinite(idNum) ? idNum : idRaw,
              };
            })
            .filter(o => o.label && o.value != null && o.value !== '')
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNhaCungCapLoading(false);
    }
  }, []);

  useEffect(() => {
    searchNhaCungCap('');
  }, [searchNhaCungCap]);

  const updateHeader = payload =>
    setHeaderData(prev => ({ ...prev, ...payload }));

  const updateNgayThangDate = val => {
    const base = getNgayNhapDayjs(headerData) || dayjs();
    setHeaderData(prev => ({
      ...prev,
      ...setNgayNhapFromDayjs(
        val ? val.hour(base.hour()).minute(base.minute()).second(0) : null
      ),
    }));
  };

  const updateNgayThangTime = val => {
    const base = getNgayNhapDayjs(headerData) || dayjs();
    setHeaderData(prev => ({
      ...prev,
      ...setNgayNhapFromDayjs(
        val
          ? base.hour(val.hour()).minute(val.minute()).second(0)
          : getNgayNhapDayjs(prev)
      ),
    }));
  };

  useEffect(() => {
    if (!router.isReady) return;

    const idPhieuNhap = Number(router.query.idPhieuNhap);
    if (!idPhieuNhap || idPhieuNhap <= 0) return;

    // Khi load phiếu đã có idkhoachinh, mặc định khoá lưới (edit = 0),
    // chỉ cho sửa qua nút "sửa" từng dòng.

    const fetchPhieu = async () => {
      setLoading(true);
      try {
        const res = await getThongTinPhieuNhap(idPhieuNhap);
        // Interceptor axios trả về response.data (ApiResponse), không phải axios response gốc
        if (res?.success === false) {
          toast.error(res?.message || 'Không lấy được thông tin phiếu nhập');
          return;
        }

        const payload = res?.data ?? res?.Data;
        const master = payload?.master ?? payload?.Master;
        const details = payload?.details ?? payload?.Details;

        if (!master) {
          toast.error(res?.message || 'Không lấy được thông tin phiếu nhập');
          return;
        }

        const hasMasterId = !!pickField(
          master,
          'idphieunhap',
          'IDPHIEUNHAP',
          'idkhoachinh',
          'IDKHOACHINH'
        );

        const baseRows =
          Array.isArray(details) && details.length > 0
            ? details.map((d, i) => mapDetailToRow(d, i))
            : [recalcRow(makeNewRecord(1))];

        const rows = hasMasterId
          ? baseRows.map(r => ({ ...r, edit: 0 }))
          : baseRows;

        setHeaderData(prev => ({
          ...mapMasterToHeader(master),
          ...recalcFooter(rows),
        }));
        setTableData(rows);
        setEditingLineId(null);
        setIsEditMode(!hasMasterId);
      } catch (e) {
        toast.error(
          e?.message || e?.data?.message || 'Lỗi khi tải thông tin phiếu nhập'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPhieu();
  }, [router.isReady, router.query.idPhieuNhap]);

  const syncTableAndFooter = useCallback(rows => {
    setTableData(rows);
    setHeaderData(prev => ({ ...prev, ...recalcFooter(rows) }));
  }, []);

  const applyRowUpdate = useCallback((lineId, updater) => {
    setTableData(prev => {
      const updatedRows = prev.map(r => {
        if (r.lineId !== lineId) return r;
        const updated =
          typeof updater === 'function' ? updater(r) : { ...r, ...updater };
        return recalcRow(updated);
      });
      const next = ensureTrailingBlankRow(updatedRows);
      setHeaderData(h => ({ ...h, ...recalcFooter(next) }));
      return next;
    });
  }, []);

  const rejectNegative = useCallback(() => {
    toast.warning('Số lượng và tiền không được nhập giá trị âm');
  }, []);

  const handleRowChange = useCallback(
    (row, field, value) => {
      if (NON_NEGATIVE_FIELDS.has(field)) {
        const num = parseNum(value);
        if (num !== null && num < 0) {
          rejectNegative();
          return;
        }
        if (num !== null) {
          applyRowUpdate(row.lineId, { [field]: num });
          return;
        }
      }
      applyRowUpdate(row.lineId, { [field]: value });
    },
    [applyRowUpdate, rejectNegative]
  );

  const handleRowPatch = useCallback(
    (row, patch) => {
      applyRowUpdate(row.lineId, r => {
        const merged = { ...r, ...patch };
        // Khi chọn thuốc từ cột Mã/Tên, patch có `dongia` (đơn giá lẻ),
        // cần chạy trigger để suy ra luôn `dongia_chan` theo Q.đổi hiện tại.
        if (patch?.dongia != null && patch?.dongia !== '') {
          return recalcRow(applyFieldTrigger(merged, 'dongia'));
        }
        return recalcRow(merged);
      });
    },
    [applyRowUpdate]
  );

  const handleRowFieldBlur = useCallback(
    (row, field, rawValue) => {
      const parsed = parseNum(rawValue);
      if (parsed === null) return;
      if (parsed < 0) {
        rejectNegative();
        return;
      }

      applyRowUpdate(row.lineId, r => {
        const withField = { ...r, [field]: parsed };
        return recalcRow(applyFieldTrigger(withField, field));
      });
    },
    [applyRowUpdate, rejectNegative]
  );

  const handleDataChange = useCallback(
    newData => {
      syncTableAndFooter(ensureTrailingBlankRow(mapRowsWithRecalc(newData)));
    },
    [syncTableAndFooter]
  );

  const canEditPermission = isAllowed(headerData.edit);
  const canEditMaster =
    canEditPermission && (!headerData.idkhoachinh || isEditMode);
  const canDelMaster = isAllowed(headerData.del);

  const displayTableData = useMemo(
    () =>
      tableData.map(r => ({
        ...r,
        edit: headerData.idkhoachinh
          ? editingLineId === r.lineId && canEditPermission && isAllowed(r.rowEdit)
            ? 1
            : 0
          : canEditMaster && isAllowed(r.rowEdit)
            ? 1
            : 0,
      })),
    [tableData, editingLineId, canEditMaster, canEditPermission, headerData.idkhoachinh]
  );

  const startInlineEdit = useCallback(
    lineId => {
      const row = tableData.find(r => r.lineId === lineId);
      // Chỉ cho sửa inline khi:
      // - Có idkhoachinh (phiếu đã lưu)
      // - Header được phép edit
      // - Dòng chi tiết có quyền edit
      if (
        !headerData.idkhoachinh ||
        !canEditPermission ||
        !row ||
        !isAllowed(row.rowEdit)
      )
        return;

      // Khoá các dòng khác (edit = 0), mở dòng được chọn (edit = 1)
      setTableData(prev =>
        prev.map(r => ({
          ...r,
          edit: r.lineId === lineId ? 1 : 0,
        }))
      );
      setEditingLineId(lineId);
    },
    [tableData, canEditPermission, headerData.idkhoachinh]
  );

  const getRowProps = useCallback(
    row =>
      editingLineId === row.lineId
        ? { 'data-editing-line': 'true', className: 'phieunhapmua-row-editing' }
        : {},
    [editingLineId]
  );

  useEffect(() => {
    if (!editingLineId) return;

    const onPointerDown = e => {
      if (e.target.closest('[data-editing-line="true"]')) return;
      if (e.target.closest(ANT_PORTAL_SELECTOR)) return;
      setEditingLineId(null);
      // Nếu là phiếu đã có id, sau khi thoát sửa thì đưa tất cả dòng về read-only
      if (headerData.idkhoachinh) {
        setTableData(prev => prev.map(r => ({ ...r, edit: 0 })));
      }
    };

    document.addEventListener('click', onPointerDown);
    return () => document.removeEventListener('click', onPointerDown);
  }, [editingLineId, headerData.idkhoachinh]);

  useEffect(() => {
    if (!canEditPermission) setEditingLineId(null);
  }, [canEditPermission]);

  const renumberRows = rows => rows.map((r, i) => ({ ...r, stt: i + 1 }));

  const handleAddRow = () => {
    if (!canEditMaster) {
      toast.warning('Không có quyền thêm dòng');
      return;
    }
    const newRow = recalcRow(makeNewRecord(tableData.length + 1));
    const next = renumberRows([...tableData, newRow]);
    syncTableAndFooter(next);
    setEditingLineId(newRow.lineId);
  };

  const removeRowFromTable = useCallback(lineId => {
    setTableData(prev => {
      const next = prev.filter(r => r.lineId !== lineId);
      const rows = next.length ? renumberRows(next) : [recalcRow(makeNewRecord(1))];
      setHeaderData(h => ({ ...h, ...recalcFooter(rows) }));
      return rows;
    });
    setEditingLineId(prev => (prev === lineId ? null : prev));
  }, []);

  const handleDeleteRow = lineId => {
    const row = tableData.find(r => r.lineId === lineId);
    if (!canDelMaster || !row || !isAllowed(row.rowDel)) {
      toast.warning('Không có quyền xóa dòng này');
      return;
    }

    const idChiTiet = resolveIdChiTiet(row);
    if (!idChiTiet) {
      removeRowFromTable(lineId);
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa dòng này?')) return;

    const doDelete = async () => {
      try {
        const res = await deleteChiTietPhieuNhap(idChiTiet);
        if (!isApiSuccess(res)) {
          const msg = res?.message || 'Xóa dòng thất bại';
          toast.error(msg);
          return;
        }
        toast.success('Đã xóa dòng');
        removeRowFromTable(lineId);
      } catch (e) {
        console.error(e);
        toast.error(e?.data?.message || e?.message || 'Lỗi khi xóa dòng');
      }
    };
    doDelete();
  };

  const handleTinhGiaDV = async () => {
    if (!canEditMaster) {
      toast.warning('Không có quyền tính giá DV');
      return;
    }
    if (tinhGiaDvLoading) return;

    const rows = tableData;
    const candidates = rows.filter(
      r =>
        r?.dongia_st != null &&
        (r?.idkhoachinh != null || (r?.lineId != null && r?.lineId !== ''))
    );
    if (!candidates.length) {
      toast.info('Không có dòng hợp lệ để tính hệ số DV');
      return;
    }

    setTinhGiaDvLoading(true);
    try {
      const requestBody = candidates.map(r => ({
        IdKhoaChinh: String(r.idkhoachinh ?? r.lineId ?? ''),
        DonGia: parseNum(r.dongia_st) ?? 0,
      }));

      const res = await getHeSoByDonGia(requestBody);
      const payload = getPayload(res);
      const list = extractList(payload);

      const byIdKhoaChinh = new Map(
        (Array.isArray(list) ? list : []).map(x => [
          String(
            pickField(x, 'idKhoaChinh', 'IDKHOACHINH', 'IdKhoaChinh') ?? ''
          ),
          parseNum(pickField(x, 'heSo', 'HESO', 'heso', 'HeSo')) ?? 0,
        ])
      );

      const byLineId = new Map(
        candidates.map(r => {
          const idKey = String(r.idkhoachinh ?? r.lineId ?? '');
          return [r.lineId, byIdKhoaChinh.get(idKey) ?? 0];
        })
      );
      setTableData(prev =>
        prev.map(r => {
          if (!byLineId.has(r.lineId)) return r;
          const next = {
            ...r,
            he_so_ap_gia_dich_vu: byLineId.get(r.lineId),
          };
          return calcTinhGiaDVRow(next);
        })
      );
      toast.success('Đã tính hệ số DV');
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Lỗi tính hệ số DV');
    } finally {
      setTinhGiaDvLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEditMaster) {
      toast.warning('Không có quyền lưu');
      return;
    }
    if (saveLoading) return;

    if (!headerData.idkho) {
      toast.warning('Vui lòng chọn kho nhập');
      return;
    }

    const ngayNhap = getNgayNhapDayjs(headerData);
    if (!ngayNhap?.isValid()) {
      toast.warning('Ngày nhập không hợp lệ');
      return;
    }

    const soHoaDonValue = String(headerData.sohoadon ?? '').trim();
    const hasNgayHoaDon =
      !!headerData.ngayhoadon && dayjs(headerData.ngayhoadon).isValid();
    if (headerData.isSoHD) {
      if (!soHoaDonValue) {
        toast.warning('Vui lòng nhập số hóa đơn');
        return;
      }
      if (!hasNgayHoaDon) {
        toast.warning('Vui lòng nhập ngày hóa đơn');
        return;
      }
    }

    setSaveLoading(true);
    try {
      const currentPhieuId = resolveIdPhieuNhap(headerData, router.query);
      const candidateRows = tableData.filter(r => {
        if (!r) return false;
        const idChiTiet = resolveIdChiTiet(r);
        const hasRowData =
          !!r?.tenthuoc || !!r?.ma_hoa_chat || parseNum(r?.soluong) != null;
        return idChiTiet != null || hasRowData;
      });

      const detailsRaw = await Promise.all(
        candidateRows.map(async r => {
          const idThuoc = await resolveIdThuocFromApi(r, headerData.idkho);
          return {
            IdChiTietPhieuNhapKho: resolveIdChiTiet(r) ?? 0,
            IdThuoc: idThuoc,
            SoLuong: parseNum(r.soluong) ?? 0,
            IdDvtN: r.id_dvt_chan ?? null,
            SoLuongN: parseNum(r.sl_chan) ?? 0,
            DonGia: parseNum(r.dongia) ?? 0,
            DonGiaN: parseNum(r.dongia_chan) ?? 0,
            Vat: parseNum(r.vat) ?? 0,
            HeSo: parseNum(r.he_so_ap_gia_dich_vu) ?? 1,
            GiaBanDv: parseNum(r.dongia_dv) ?? 0,
            LoSanXuat: r.losanxuat ?? null,
            NgayHetHan: r.han_su_dung ? dayjs(r.han_su_dung).toDate() : null,
          };
        })
      );

      const details = detailsRaw.filter(d => d.IdThuoc != null);

      const isExistingPhieu = !!currentPhieuId;
      if (!details.length && !isExistingPhieu) {
        toast.warning('Chưa chọn thuốc để lưu');
        return;
      }

      const payload = {
        IdPhieuNhap: currentPhieuId ?? 0,
        MaPhieuNhap: headerData.maphieunhap || null,
        NgayNhap: ngayNhap.toDate(),
        IdNhaCungCap: headerData.idnhacungcap ?? null,
        TenNhaCungCap: headerData.tennhacungcap ?? null,
        IdKhoNhap: headerData.idkho ?? null,
        SoHoaDon: soHoaDonValue || null,
        NgayHoaDon: hasNgayHoaDon ? dayjs(headerData.ngayhoadon).toDate() : null,
        Vat: parseNum(headerData.vat) ?? 0,
        IdNguoiNhap: headerData.id_nguoinhap ?? null,
        GhiChu: headerData.ghichu ?? null,
        IdNguoiDung: null,
        ChiTiet: details,
      };

      const res = await savePhieuNhap(payload);
      if (res?.success === false) {
        toast.error(res?.message || 'Lưu phiếu nhập thất bại');
        return;
      }
      const saved = res?.data ?? res?.Data ?? null;
      const idPhieuNhap = saved?.idPhieuNhap ?? saved?.IdPhieuNhap ?? currentPhieuId;
      const maPhieuNhap = saved?.maPhieuNhap ?? saved?.MaPhieuNhap;

      toast.success('Đã lưu phiếu nhập');

      if (idPhieuNhap) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, idPhieuNhap: String(idPhieuNhap) },
          },
          undefined,
          { shallow: false }
        );
      }
      if (maPhieuNhap || idPhieuNhap) {
        setHeaderData(prev => ({
          ...prev,
          idkhoachinh: idPhieuNhap ?? prev.idkhoachinh,
          maphieunhap: maPhieuNhap ?? prev.maphieunhap,
        }));
      }
      if (idPhieuNhap) setIsEditMode(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Lỗi khi lưu phiếu nhập');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNew = () => {
    const now = dayjs();
    const rows = [recalcRow(makeNewRecord(1))];
    setHeaderData({
      ...DEFAULT_HEADER,
      ngay_nhap: now.format('DD/MM/YYYY'),
      gio_nhap: now.format('HH'),
      phut_nhap: now.format('mm'),
      ...recalcFooter(rows),
    });
    setTableData(rows);
    setEditingLineId(null);
    setIsEditMode(true);
    toast.info('Đã tạo phiếu mới');
  };

  const handleDeletePhieu = () => {
    if (!canDelMaster) {
      toast.warning('Không có quyền xóa phiếu');
      return;
    }
    const idPhieuNhap = resolveIdPhieuNhap(headerData, router.query);
    if (!idPhieuNhap) {
      handleNew();
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) return;

    const doDelete = async () => {
      setDeletePhieuLoading(true);
      try {
        const res = await deletePhieuNhap(idPhieuNhap);
        if (!isApiSuccess(res)) {
          const msg = res?.message || 'Xóa phiếu nhập thất bại';
          toast.error(msg);
          return;
        }
        toast.success('Đã xóa phiếu nhập');
        await router.replace(router.pathname, undefined, { shallow: true });
        handleNew();
      } catch (e) {
        console.error(e);
        toast.error(e?.data?.message || e?.message || 'Lỗi khi xóa phiếu nhập');
      } finally {
        setDeletePhieuLoading(false);
      }
    };
    doDelete();
  };

  const handleEnableEdit = () => {
    if (!canEditPermission) {
      toast.warning('Không có quyền sửa phiếu');
      return;
    }
    setIsEditMode(true);
    setEditingLineId(null);
  };

  const savedPhieuId = resolveIdPhieuNhap(headerData, router.query);

  const bodyFieldColumns = useMemo(
    () =>
      buildBodyFieldColumns(handleRowChange, handleRowFieldBlur, {
        loaiOptions,
        loaiLoading,
        onEnsureLoaiOptions: ensureLoaiOptions,
        dvtOptions,
        dvtLoading,
        onEnsureDvtOptions: ensureDvtOptions,
        nuocSxOptions,
        nuocSxLoading,
        onEnsureNuocSxOptions: ensureNuocSxOptions,
        idKho: headerData.idkho,
        onRowPatch: handleRowPatch,
      }),
    [
      handleRowChange,
      handleRowFieldBlur,
      handleRowPatch,
      loaiOptions,
      loaiLoading,
      ensureLoaiOptions,
      dvtOptions,
      dvtLoading,
      ensureDvtOptions,
      nuocSxOptions,
      nuocSxLoading,
      ensureNuocSxOptions,
      headerData.idkho,
    ]
  );

  const ngayNhapDayjs = getNgayNhapDayjs(headerData);

  // khoOptions kết hợp option hiện tại (khi load phiếu) và options từ search
  const mergedKhoOptions = useMemo(() => {
    const base =
      headerData.idkho != null && headerData.tenkho
        ? [{ label: headerData.tenkho, value: headerData.idkho }]
        : [];
    const fromSearch = khoOptions.filter(o => o.value !== headerData.idkho);
    return [...base, ...fromSearch];
  }, [khoOptions, headerData.idkho, headerData.tenkho]);

  const mergedNhaCungCapOptions = useMemo(() => {
    const base =
      headerData.idnhacungcap != null && headerData.tennhacungcap
        ? [{ label: headerData.tennhacungcap, value: headerData.idnhacungcap }]
        : [];
    const fromSearch = nhaCungCapOptions.filter(
      o => o.value !== headerData.idnhacungcap
    );
    return [...base, ...fromSearch];
  }, [nhaCungCapOptions, headerData.idnhacungcap, headerData.tennhacungcap]);

  const columns = useMemo(
    () => [
      {
        title: 'Stt',
        dataIndex: 'stt',
        width: 45,
        align: 'center',
        type: FIELD_TYPES.CUSTOM,
        render: (_, row) => <span className='small'>{row.stt}</span>,
      },
      {
        title: '',
        width: 40,
        align: 'center',
        type: FIELD_TYPES.CUSTOM,
        render: (_, row) =>
          !canDelMaster || !isAllowed(row.rowDel) ? null : (
            <button
              type='button'
              title='Xóa dòng'
              className='btn btn-link text-danger p-0 m-0 border-0'
              onClick={e => {
                e.stopPropagation();
                handleDeleteRow(row.lineId);
              }}
            >
              <FaTrash size={16} />
            </button>
          ),
      },
      ...bodyFieldColumns,
      {
        title: '',
        width: 70,
        align: 'center',
        type: FIELD_TYPES.CUSTOM,
        render: (_, row) => {
          if (
            !headerData.idkhoachinh || // Phiếu mới: cho edit trực tiếp, ẩn nút sửa
            !canEditPermission ||
            !isAllowed(row.rowEdit) ||
            editingLineId === row.lineId
          ) {
            return null;
          }
          return (
            <button
              type='button'
              className='btn btn-link text-success p-0 border-0 text-decoration-underline'
              onClick={e => {
                e.stopPropagation();
                startInlineEdit(row.lineId);
              }}
            >
              sửa
            </button>
          );
        },
      },
    ],
    [
      bodyFieldColumns,
      editingLineId,
      startInlineEdit,
      canEditPermission,
      canDelMaster,
      headerData.idkhoachinh,
    ]
  );

  return (
    <div className='phieunhapmua-page'>
      <Head>
        <title>PHIẾU NHẬP MUA</title>
      </Head>

      <div className='fw-bold fs-4 py-3 text-center text-white bg-header-kd'>
        PHIẾU NHẬP MUA
      </div>

      <div className='phieunhapmua-body'>
        <div className='phieunhapmua-header'>
          <div className='phieunhapmua-header-cols'>
            <div className='phieunhapmua-header-col phieunhapmua-header-col--1'>
              <HeaderField label='Số chứng từ'>
                <Input
                  size='small'
                  className='bg-warning bg-opacity-25'
                  readOnly={!canEditMaster}
                  value={headerData.maphieunhap}
                  onChange={e => updateHeader({ maphieunhap: e.target.value })}
                />
              </HeaderField>
              <HeaderField label='Kho nhập'>
                <Select
                  size='small'
                  allowClear
                  showSearch
                  disabled={!canEditMaster}
                  loading={khoLoading}
                  placeholder='Tìm kho nhập...'
                  value={headerData.idkho ?? undefined}
                  options={mergedKhoOptions}
                  filterOption={false}
                  onSearch={q => searchKho(q)}
                  onFocus={() => {
                    if (mergedKhoOptions.length <= 1) searchKho('');
                  }}
                  onChange={val => {
                    const selected = mergedKhoOptions.find(
                      o => o.value === val
                    );
                    updateHeader({
                      idkho: val ?? null,
                      tenkho: selected?.label ?? '',
                    });
                  }}
                />
              </HeaderField>
              <HeaderField label='Người nhập'>
                <Input size='small' readOnly value={headerData.ten_nguoinhap} />
              </HeaderField>
            </div>

            <div className='phieunhapmua-header-col phieunhapmua-header-col--2'>
              <HeaderField label='Ngày tháng'>
                <div className='phieunhapmua-datetime'>
                  <DatePicker
                    size='small'
                    format='DD/MM/YYYY'
                    disabled={!canEditMaster}
                    value={ngayNhapDayjs}
                    onChange={updateNgayThangDate}
                  />
                  <TimePicker
                    size='small'
                    format='HH:mm'
                    needConfirm={false}
                    disabled={!canEditMaster}
                    value={ngayNhapDayjs}
                    onChange={updateNgayThangTime}
                  />
                </div>
              </HeaderField>
              <div className='phieunhapmua-item phieunhapmua-item--sohd'>
                <div className='phieunhapmua-label phieunhapmua-label--sohd'>
                  <span>Số hóa đơn</span>
                  <input
                    type='checkbox'
                    className='form-check-input flex-shrink-0 m-0'
                    checked={headerData.isSoHD}
                    disabled={!canEditMaster}
                    onChange={e => updateHeader({ isSoHD: e.target.checked })}
                    aria-label='Số hóa đơn'
                  />
                </div>
                <div className='phieunhapmua-control'>
                  <Input
                    size='small'
                    readOnly={!canEditMaster}
                    value={headerData.sohoadon}
                    onChange={e => updateHeader({ sohoadon: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className='phieunhapmua-header-col phieunhapmua-header-col--3'>
              <HeaderField label='Nhà cung cấp'>
                <Select
                  size='small'
                  showSearch
                  allowClear
                  disabled={!canEditMaster}
                  loading={nhaCungCapLoading}
                  value={headerData.idnhacungcap ?? undefined}
                  options={mergedNhaCungCapOptions}
                  filterOption={(input, option) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(String(input).toLowerCase())
                  }
                  onSearch={searchNhaCungCap}
                  onChange={(val, opt) =>
                    updateHeader({
                      idnhacungcap: val ?? null,
                      tennhacungcap: opt?.label ?? '',
                    })
                  }
                />
              </HeaderField>
              <div className='phieunhapmua-item phieunhapmua-row-ngayhd-thue'>
                <span className='phieunhapmua-label'>Ngày hợp đồng</span>
                <div className='phieunhapmua-control phieunhapmua-control--ngayhd-thue'>
                  <DatePicker
                    size='small'
                    className='phieunhapmua-ngayhd-picker'
                    format='DD/MM/YYYY'
                    disabled={!canEditMaster}
                    value={headerData.ngayhoadon}
                    onChange={val => updateHeader({ ngayhoadon: val })}
                  />
                  <span className='phieunhapmua-thue-label'>Thuế suất(%)</span>
                  <Input
                    size='small'
                    className='phieunhapmua-thue-input'
                    type='number'
                    min={0}
                    max={100}
                    step={0.1}
                    readOnly={!canEditMaster}
                    value={headerData.vat}
                    onChange={e =>
                      updateHeader({
                        vat: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <HeaderField label='Ghi chú'>
                <Input
                  size='small'
                  readOnly={!canEditMaster}
                  value={headerData.ghichu}
                  onChange={e => updateHeader({ ghichu: e.target.value })}
                />
              </HeaderField>
            </div>

            <div
              className='phieunhapmua-header-col phieunhapmua-header-col--4'
              aria-hidden='true'
            />
          </div>
        </div>

        <div className='phieunhapmua-table-wrap'>
          <CustomTable
            columns={columns}
            data={displayTableData}
            loading={loading}
            rowKey='lineId'
            pagination={null}
            onRowChange={handleRowChange}
            onDataChange={handleDataChange}
            rowFactory={() => recalcRow(makeNewRecord(tableData.length + 1))}
            getRowProps={getRowProps}
          />
        </div>

        <div className='phieunhapmua-table-totals'>
          <div className='phieunhapmua-table-totals__stack'>
            <div className='phieunhapmua-table-totals__row'>
              <span className='phieunhapmua-table-totals__label'>
                Tổng tiền trước thuế
              </span>
              <Input
                size='small'
                readOnly
                value={headerData.tong_tien_truoc_thue ?? 0}
              />
            </div>
            <div className='phieunhapmua-table-totals__row'>
              <span className='phieunhapmua-table-totals__label'>Tổng tiền thuế</span>
              <Input size='small' readOnly value={headerData.tong_tien_thue ?? 0} />
            </div>
            <div className='phieunhapmua-table-totals__row'>
              <span className='phieunhapmua-table-totals__label'>
                Tổng tiền sau thuế
              </span>
              <Input
                size='small'
                readOnly
                value={headerData.tong_tien_sau_thue ?? 0}
              />
            </div>
          </div>
        </div>

        <div className='phieunhapmua-footer'>
          <div className='phieunhapmua-footer-actions d-flex gap-2 flex-wrap justify-content-center align-items-center w-100'>
            <Button
              type='primary'
              disabled={!canEditMaster || tinhGiaDvLoading}
              loading={tinhGiaDvLoading}
              onClick={handleTinhGiaDV}
            >
              Tính giá DV
            </Button>
            {!savedPhieuId || isEditMode ? (
              <Button
                type='primary'
                disabled={!canEditMaster || saveLoading}
                loading={saveLoading}
                onClick={handleSave}
              >
                Lưu
              </Button>
            ) : (
              <Button
                type='primary'
                disabled={!canEditPermission}
                onClick={handleEnableEdit}
              >
                Sửa
              </Button>
            )}
            <Button
              type='primary'
              icon={<FaPlus />}
              disabled={!canEditMaster}
              onClick={handleAddRow}
            >
              Thêm hàng
            </Button>
            <Button
              type='primary'
              onClick={() => toast.info('Chức năng đang phát triển')}
            >
              In
            </Button>
            <Button type='primary' onClick={handleNew}>
              Mới
            </Button>
            {savedPhieuId && canDelMaster ? (
              <Button
                type='primary'
                loading={deletePhieuLoading}
                disabled={deletePhieuLoading}
                onClick={handleDeletePhieu}
              >
                Xóa
              </Button>
            ) : null}
            <Button
              type='primary'
              icon={<IoArrowBackOutline />}
              onClick={handleBackOrClose}
            >
              Thoát
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhieuNhapMua;
