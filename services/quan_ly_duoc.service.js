import {
  MOCK_DVT,
  MOCK_KHO,
  MOCK_LOAI_THUOC,
  MOCK_NHA_CUNG_CAP,
  MOCK_NUOC_SX,
  MOCK_PHIEU_DETAILS,
  MOCK_PHIEU_MASTER,
  MOCK_THUOC,
} from '@/mocks/phieunhapmua.fixtures';

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const ok = data => ({ success: true, data });

const paginated = items => ({
  success: true,
  data: {
    data: items,
    total: items.length,
  },
});

const filterByQuery = (items, q, fields) => {
  const keyword = String(q ?? '')
    .trim()
    .toLowerCase();
  if (!keyword) return items;
  return items.filter(item =>
    fields.some(f => String(item[f] ?? '').toLowerCase().includes(keyword))
  );
};

export const getDanhMucDoiTuongQuanLy = async () => {
  await delay();
  return paginated(MOCK_LOAI_THUOC);
};

export const getDanhMucDonViTinh = async () => {
  await delay();
  return paginated(MOCK_DVT);
};

export const getDanhMucNuocSanXuat = async () => {
  await delay();
  return paginated(MOCK_NUOC_SX);
};

export const getDanhMucNhaCungCap = async (params = {}) => {
  await delay();
  const q = params.tennhacungcap ?? params.q ?? '';
  const list = filterByQuery(MOCK_NHA_CUNG_CAP, q, ['tennhacungcap']);
  return ok({ data: list });
};

export const getIdKhoSearch = async (params = {}) => {
  await delay();
  const list = filterByQuery(MOCK_KHO, params.q, ['tenkho', 'idkho']);
  return ok(list);
};

export const searchThuocByTenOrMa = async (params = {}) => {
  await delay();
  let list = [...MOCK_THUOC];
  const q = String(params.tenThuoc ?? params.ma ?? params.q ?? '')
    .trim()
    .toLowerCase();
  if (q) {
    list = list.filter(
      t =>
        String(t.tenThuoc ?? '')
          .toLowerCase()
          .includes(q) ||
        String(t.tthoatchat ?? '')
          .toLowerCase()
          .includes(q)
    );
  }
  if (params.loaiThuocId != null && params.loaiThuocId !== '') {
    const loai = MOCK_LOAI_THUOC.find(
      l => l.LoaiThuocID === Number(params.loaiThuocId)
    );
    if (loai) {
      list = list.filter(t => t.tenloaiThuoc === loai.TenLoai);
    }
  }
  return ok(list);
};

export const getThongTinPhieuNhap = async idPhieuNhap => {
  await delay(200);
  const id = Number(idPhieuNhap);
  if (!id || id <= 0) {
    return { success: false, message: 'ID phiếu không hợp lệ' };
  }
  return ok({
    master: { ...MOCK_PHIEU_MASTER, idphieunhap: id },
    details: MOCK_PHIEU_DETAILS,
  });
};

export const savePhieuNhap = async () => {
  await delay(200);
  return ok({ idPhieuNhap: 1, maPhieuNhap: 'PN001' });
};

export const deletePhieuNhap = async () => {
  await delay(150);
  return ok(null);
};

export const deleteChiTietPhieuNhap = async () => {
  await delay(150);
  return ok(null);
};

export const getHeSoByDonGia = async (payload = []) => {
  await delay(200);
  const list = (Array.isArray(payload) ? payload : []).map((row, i) => ({
    idKhoaChinh: row.idKhoaChinh ?? row.idkhoachinh ?? row.lineId ?? i + 1,
    heSo: 1.15,
  }));
  return ok(list);
};
