var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
/* eslint-disable compat/compat */
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    width: '20%',
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    filters: [
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
    ],
    width: '20%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
];
const toURLSearchParams = record => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    params.append(key, value);
  }
  return params;
};
const getRandomuserParams = params => {
  const { pagination, filters, sortField, sortOrder } = params,
    restParams = __rest(params, ['pagination', 'filters', 'sortField', 'sortOrder']);
  const result = {};
  // https://github.com/mockapi-io/docs/wiki/Code-examples#pagination
  result.limit = pagination === null || pagination === void 0 ? void 0 : pagination.pageSize;
  result.page = pagination === null || pagination === void 0 ? void 0 : pagination.current;
  // https://github.com/mockapi-io/docs/wiki/Code-examples#filtering
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    });
  }
  // https://github.com/mockapi-io/docs/wiki/Code-examples#sorting
  if (sortField) {
    result.orderby = sortField;
    result.order = sortOrder === 'ascend' ? 'asc' : 'desc';
  }
  // 处理其他参数
  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  });
  return result;
};
const App = () => {
  var _a, _b;
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const params = toURLSearchParams(getRandomuserParams(tableParams));
  const fetchData = () => {
    setLoading(true);
    fetch(`https://660d2bd96ddfa2943b33731c.mockapi.io/api/users?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        setData(Array.isArray(res) ? res : []);
        setLoading(false);
        setTableParams(
          Object.assign(Object.assign({}, tableParams), {
            pagination: Object.assign(Object.assign({}, tableParams.pagination), { total: 100 }),
          }),
        );
      });
  };
  useEffect(fetchData, [
    (_a = tableParams.pagination) === null || _a === void 0 ? void 0 : _a.current,
    (_b = tableParams.pagination) === null || _b === void 0 ? void 0 : _b.pageSize,
    tableParams === null || tableParams === void 0 ? void 0 : tableParams.sortOrder,
    tableParams === null || tableParams === void 0 ? void 0 : tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);
  const handleTableChange = (pagination, filters, sorter) => {
    var _a;
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
    // `dataSource` is useless since `pageSize` changed
    if (
      pagination.pageSize !==
      ((_a = tableParams.pagination) === null || _a === void 0 ? void 0 : _a.pageSize)
    ) {
      setData([]);
    }
  };
  return (
    <Table
      columns={columns}
      rowKey={record => record.id}
      dataSource={data}
      pagination={tableParams.pagination}
      loading={loading}
      onChange={handleTableChange}
    />
  );
};
export default App;