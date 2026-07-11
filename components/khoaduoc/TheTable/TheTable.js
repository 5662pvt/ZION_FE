import React, { memo, useCallback, useRef, useEffect } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";

export const FIELD_TYPES = Object.freeze({
  CUSTOM: 0,
  TEXT: 1,
  NUMBER: 2,
  CHECKBOX: 3,
  SELECT: 4,
  SEARCH_SELECT: 5,
  DATE: 6,
  DATETIME: 7,
});

const handlePasteEvent = (e, rowIndex, colIndex, onPasteCell) => {
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedText = clipboardData?.getData("Text");

  if (pastedText && (pastedText.includes("\t") || pastedText.includes("\n"))) {
    e.preventDefault();
    e.stopPropagation();
    onPasteCell?.(pastedText, rowIndex, colIndex);
  }
};

const FIELD_RENDERERS = {
  [FIELD_TYPES.TEXT]: (value, row, col, onChange) => (
    <input
      type="text"
      className="form-control form-control-sm px-1"
      value={value ?? ""}
      onChange={(e) => onChange(col.dataIndex, e.target.value)}
    />
  ),
  [FIELD_TYPES.DATE]: (value, row, col, onChange) => (
    <DatePicker
      format="DD/MM/YYYY"
      className="w-100 fs-14 px-1"
      value={value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null}
      onChange={(val) => onChange(col.dataIndex, val)}
    />
  ),
  [FIELD_TYPES.DATETIME]: (value, row, col, onChange) => (
    <DatePicker
      showTime
      format="DD/MM/YYYY HH:mm"
      className="w-100 fs-14 px-1"
      value={value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null}
      onChange={(val) => onChange(col.dataIndex, val)}
    />
  ),
  [FIELD_TYPES.NUMBER]: (value, row, col, onChange) => (
    <input
      type="number"
      className="form-control form-control-sm px-1"
      value={value ?? ""}
      onChange={(e) => onChange(col.dataIndex, e.target.value)}
    />
  ),
  [FIELD_TYPES.CHECKBOX]: (value, row, col, onChange) => (
    <input
      type="checkbox"
      className="form-check-input checkbox-large"
      checked={value !== false && !!value}
      onChange={(e) => onChange(col.dataIndex, e.target.checked)}
    />
  ),
  [FIELD_TYPES.SELECT]: (value, row, col, onChange) => {
    const options =
      typeof col.options === "function"
        ? col.options(row)
        : (col.options ?? []);
    return (
      <select
        className="form-select form-select-sm px-1"
        value={value ?? ""}
        onChange={(e) => {
          const next = e.target.value;
          onChange(col.dataIndex, next);
          col.onChangeSideEffect?.(next, row, onChange);
        }}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
  [FIELD_TYPES.SEARCH_SELECT]: (value, row, col, onChange) => {
    const options =
      typeof col.options === "function"
        ? col.options(row)
        : (col.options ?? []);
    return (
      <Select
        showSearch
        allowClear
        className="w-100"
        placeholder=""
        value={value ?? undefined}
        options={options}
        filterOption={(input, option) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onChange={(next) => {
          onChange(col.dataIndex, next);
          col.onChangeSideEffect?.(next, row, onChange);
        }}
      />
    );
  },
};

const renderReadOnly = (value, type, col, row) => {
  if (type === FIELD_TYPES.CHECKBOX) {
    return (
      <input
        type="checkbox"
        className="form-check-input"
        checked={value !== false && !!value}
        disabled
      />
    );
  }
  if (type === FIELD_TYPES.SELECT || type === FIELD_TYPES.SEARCH_SELECT) {
    const options =
      typeof col.options === "function"
        ? col.options(row)
        : (col.options ?? []);
    const opt = options.find((o) => o.value === value);
    return <span>{opt ? opt.label : value}</span>;
  }
  if (type === FIELD_TYPES.NUMBER && col?.decimals != null) {
    const num = Number(value);
    if (!Number.isNaN(num) && value !== '' && value !== null && value !== undefined) {
      return <span>{num.toFixed(col.decimals)}</span>;
    }
    return <span>{value ?? ""}</span>;
  }
  return <span>{value ?? ""}</span>;
};

const renderField = (value, row, col, onChange, rowIndex) => {
  if (col.type === FIELD_TYPES.CUSTOM)
    return col.render?.(value, row, rowIndex) ?? value;
  if (row.edit === 0) return renderReadOnly(value, col.type, col, row);
  const renderer = FIELD_RENDERERS[col.type];
  return renderer ? renderer(value, row, col, onChange) : value;
};

const clsx = (...args) => args.filter(Boolean).join(" ");

const FieldCell = memo(
  ({ value, row, col, rowOnChange, rowIndex, colIndex, onPasteCell }) => {
    const onChange = useCallback(
      (field, next) => rowOnChange(row, field, next),
      [row, rowOnChange],
    );
    return (
      <td
        className="border-dark-subtle"
        style={{ textAlign: col.align || "left" }}
        onPaste={(e) => handlePasteEvent(e, rowIndex, colIndex, onPasteCell)}
      >
        {renderField(value, row, col, onChange, rowIndex)}
      </td>
    );
  },
);
FieldCell.displayName = "FieldCell";

const TableBody = memo(
  ({ columns, data, rowKey, loading, rowOnChange, onPasteCell, getRowProps }) => {
    if (data.length === 0 && !loading) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length}
              className="text-center py-4 text-muted bg-white border-dark-subtle"
            >
              Không có dữ liệu
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        {data.map((row, rowIndex) => {
          const rowProps = getRowProps?.(row, rowIndex) ?? {};
          const { className: rowClassName, ...restRowProps } = rowProps;
          return (
          <tr
            key={row[rowKey] ?? rowIndex}
            className={"bg-white"}
            {...restRowProps}
          >
            {columns.map((col, colIndex) => (
              <FieldCell
                key={colIndex}
                value={row[col.dataIndex]}
                row={row}
                col={col}
                rowOnChange={rowOnChange}
                rowIndex={rowIndex}
                colIndex={colIndex}
                onPasteCell={onPasteCell}
              />
            ))}
          </tr>
        );
        })}
      </tbody>
    );
  },
);
TableBody.displayName = "TableBody";

const Pagination = memo(({ pagination, onPageChange }) => {
  if (!pagination) return null;
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  if (totalPages <= 1) return null;
  const { current, pageSize, total } = pagination;
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  return (
    <div className="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded border border-dark-subtle shadow-sm">
      <span className="text-secondary fw-semibold fs-13 ms-1">
        Hiển thị {from} – {to} của{" "}
        <span className="text-dark fw-bold">{total}</span> dòng
      </span>
      <nav aria-label="Table navigation">
        <ul className="pagination pagination-sm mb-0 shadow-sm">
          <li className={clsx("page-item", current === 1 && "disabled")}>
            <button
              className="page-link border-dark-subtle text-dark fw-semibold"
              disabled={current === 1}
              onClick={() => onPageChange(current - 1, pageSize)}
            >
              Trước
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link border-dark-subtle bg-white text-dark fw-bold px-3">
              {current} / {totalPages}
            </span>
          </li>
          <li
            className={clsx("page-item", current === totalPages && "disabled")}
          >
            <button
              className="page-link border-dark-subtle text-dark fw-semibold"
              disabled={current === totalPages}
              onClick={() => onPageChange(current + 1, pageSize)}
            >
              Sau
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
});
Pagination.displayName = "Pagination";

const CustomTable = ({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onRowChange,
  onDataChange,
  rowFactory,
  rowKey = 'id',
  getRowProps,
}) => {
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleTablePaste = useCallback(
    (pastedText, startRowIndex, startColIndex) => {
      if (!onDataChange) return;
      const pasteRows = pastedText.split(/\r?\n/).map((r) => r.split("\t"));
      if (
        pasteRows.length > 0 &&
        pasteRows[pasteRows.length - 1].length === 1 &&
        pasteRows[pasteRows.length - 1][0] === ""
      )
        pasteRows.pop();
      let newData = [...dataRef.current];
      for (let i = 0; i < pasteRows.length; i++) {
        const targetRowIndex = startRowIndex + i;
        if (targetRowIndex >= newData.length) {
          if (rowFactory) newData.push(rowFactory());
          else break;
        }
        let newRow = { ...newData[targetRowIndex] };
        for (let j = 0; j < pasteRows[i].length; j++) {
          const targetColIndex = startColIndex + j;
          if (targetColIndex < columns.length) {
            const colDef = columns[targetColIndex];
            if (
              colDef.dataIndex &&
              colDef.type !== FIELD_TYPES.CUSTOM &&
              newRow.edit !== 0
            ) {
              let val =
                pasteRows[i][j] !== undefined ? pasteRows[i][j].trim() : "";
              if (colDef.type === FIELD_TYPES.NUMBER && val !== "")
                val = Number(val);
              if (colDef.type === FIELD_TYPES.CHECKBOX) {
                const trueValues = ["1", "true", "có", "yes", "x", "v"];
                val = trueValues.includes(String(val).toLowerCase());
              }
              if (
                colDef.type === FIELD_TYPES.SELECT ||
                colDef.type === FIELD_TYPES.SEARCH_SELECT
              ) {
                const options =
                  typeof colDef.options === "function"
                    ? colDef.options(newRow)
                    : (colDef.options ?? []);
                const matchedOption = options.find(
                  (o) =>
                    String(o.label).trim().toLowerCase() ===
                      val.toLowerCase() ||
                    String(o.value).trim().toLowerCase() === val.toLowerCase(),
                );
                val = matchedOption ? matchedOption.value : null;
              }
              newRow[colDef.dataIndex] = val;
              if (colDef.onChangeSideEffect)
                colDef.onChangeSideEffect(val, newRow, (field, nextVal) => {
                  newRow[field] = nextVal;
                });
            }
          }
        }
        newData[targetRowIndex] = newRow;
      }
      onDataChange([...newData]);
    },
    [columns, onDataChange, rowFactory],
  );

  return (
    <div className="table-responsive w-100">
      {loading && (
        <div className="text-center my-2 text-primary fw-semibold">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          Đang tải dữ liệu...
        </div>
      )}
      <table className="table table-bordered table-hover border-dark-subtle align-middle mb-0 fs-14 shadow-sm">
        <thead>
          <tr className="text-dark border-dark-subtle">
            {columns.map((col, i) => (
              <th
                key={i}
                className="py-2 table-primary border-dark-subtle fw-bold text-center align-middle"
                style={{ width: col.width, textAlign: col.align || "left" }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <TableBody
          columns={columns}
          data={data}
          rowKey={rowKey}
          loading={loading}
          rowOnChange={onRowChange}
          onPasteCell={handleTablePaste}
          getRowProps={getRowProps}
        />
      </table>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
};

export default CustomTable;
