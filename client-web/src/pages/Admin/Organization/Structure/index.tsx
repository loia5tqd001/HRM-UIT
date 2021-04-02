import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, message, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import React, { useCallback, useMemo } from 'react';
import { useModel } from 'umi';
import { CrudModal } from './components/CrudModal';
import { calculateAllExpandedRowKeys } from './utils';

export const OrganziationStructure: React.FC = () => {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<string[]>([]);
  const {
    setCrudModalVisible,
    selectDepartment,
    departments: data,
    departmentsPending,
    onDeleteDepartment,
  } = useModel('admin.organization');

  const columns: ColumnsType<API.DepartmentUnit> = [
    {
      title: 'Department name',
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <Button
            type="link"
            children={text}
            onClick={() => {
              setCrudModalVisible('update');
              selectDepartment(record.id);
            }}
          />
        );
      },
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      align: 'left',
      width: '20%',
      render: (text) => {
        return (
          <Space align="center">
            <Avatar src={text?.avatar} />
            <span>
              {text?.first_name} {text?.last_name}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Number of members',
      dataIndex: 'employee_no',
      align: 'center',
      width: '20%',
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: '20%',
      render: (text, record) => (
        <Space size="small">
          <Button
            title="Add a child department"
            size="small"
            onClick={() => {
              setCrudModalVisible('create');
              selectDepartment(record.id);
            }}
          >
            <PlusOutlined />
          </Button>
          <Button
            title="Edit this department"
            size="small"
            onClick={() => {
              setCrudModalVisible('update');
              selectDepartment(record.id);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            placement="right"
            title={
              record.employee_no > 1
                ? 'Must remove members from this department first!'
                : 'Delete this?'
            }
            onConfirm={async () => {
              if (record.employee_no > 1) return;
              try {
                await onDeleteDepartment(record.id);
                message.success('Delete successfully!');
              } catch (err) {
                message.error('Cannot delete!');
              }
            }}
            // okText="Đồng ý"
            // cancelText="Không"
          >
            <Button
              title="Delete this department"
              size="small"
              danger
              disabled={record.employee_no > 1}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // tree-like dataSource derived from flat-array data from backend
  const dataSource = useMemo<API.DepartmentUnit[] | undefined>(() => {
    // How to convert flat array to tree array: https://stackoverflow.com/a/40732240/9787887
    // No need to worry about the algorithm detail
    const createDataTree = (dataset: API.DepartmentUnit[]) => {
      const hashTable = {};
      dataset.forEach((dataItem) => {
        hashTable[String(dataItem.id)] = { ...dataItem };
      });
      const dataTree: API.DepartmentUnit[] = [];
      dataset.forEach((dataItem) => {
        if (dataItem.parent_id) {
          const parentExist = hashTable[dataItem.parent_id];
          if (parentExist) {
            if (parentExist?.children) {
              parentExist.children.push(hashTable[String(dataItem.id)]);
            } else {
              parentExist.children = [hashTable[String(dataItem.id)]];
            }
          }
        } else {
          dataTree.push(hashTable[String(dataItem.id)]);
        }
      });
      return dataTree;
    };

    return data && createDataTree(data);
  }, [data]);

  // recalculate expandedRowKeys
  const onTableTreeExpand = useCallback((expanded: boolean, record: API.DepartmentUnit) => {
    if (expanded) {
      setExpandedRowKeys((old) => old.concat(String(record.id)));
    } else {
      setExpandedRowKeys((old) => old.filter((it) => it !== String(record.id)));
    }
  }, []);

  // whenever datasource is changed, we recalculate the row keys,
  // and it's expanded by default
  React.useEffect(() => {
    setExpandedRowKeys(
      calculateAllExpandedRowKeys(dataSource, { level: -1, key: 'id' }).map((it) => String(it)),
    );
  }, [dataSource]);

  return (
    <>
      <Table<API.DepartmentUnit>
        columns={columns}
        dataSource={dataSource}
        loading={departmentsPending}
        onExpand={onTableTreeExpand}
        rowKey={(record) => String(record.id)}
        expandedRowKeys={expandedRowKeys}
        pagination={false}
        locale={{ emptyText: 'Không tìm thấy bộ phận nào' }}
        // defaultExpandAllRows={true} // doesn't work for async data
      />
      <CrudModal />
    </>
  );
};

export default OrganziationStructure;
