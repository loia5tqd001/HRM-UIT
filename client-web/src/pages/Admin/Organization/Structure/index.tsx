import { allDepartments } from '@/services/admin.organization.structure';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Avatar, Button, message, Popconfirm, Space } from 'antd';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Access, useAccess, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';
import { calculateAllExpandedRowKeys } from './utils';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';

export const OrganziationStructure: React.FC = () => {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<number[]>([]);
  const {
    setCrudModalVisible,
    selectDepartment,
    departments: data,
    setDepartments,
    departmentsPending,
    setDepartmentsPending,
    onDeleteDepartment,
  } = useModel('admin.organization');
  const access = useAccess();

  useEffect(() => {
    setDepartmentsPending(true);
    allDepartments()
      .then((fetchData) => {
        if (fetchData?.length > 0) {
          setDepartments(fetchData);
        }
      })
      .finally(() => {
        setDepartmentsPending(false);
      });
  }, [setDepartments, setDepartmentsPending]);

  const columns: ProColumns<API.DepartmentUnit>[] = [
    {
      title: 'Department name',
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <Button
            type="link"
            children={text}
            onClick={() => {
              if (!access['core.change_department']) return;
              setCrudModalVisible('update');
              selectDepartment(record.id);
            }}
          />
        );
      },
    },
    {
      title: 'Manager',
      dataIndex: 'manager_avatar',
      align: 'left',
      width: '20%',
      renderText: (avatar, record) => {
        return (
          <Space align="center">
            <Avatar src={avatar} />
            <span>{record.manager_full_name}</span>
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
    (access['core.add_department'] ||
      access['core.change_department'] ||
      access['core.delete_department']) && {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: '20%',
      render: (text, record) => (
        <Space size="small">
          <Access accessible={access['core.add_department']}>
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
          </Access>
          <Access accessible={access['core.change_department']}>
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
          </Access>
          <Access accessible={access['core.delete_department']}>
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
          </Access>
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
        if (dataItem.parent) {
          const parentExist = hashTable[dataItem.parent];
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
      setExpandedRowKeys((old) => old.concat(record.id));
    } else {
      setExpandedRowKeys((old) => old.filter((it) => it !== record.id));
    }
  }, []);

  // whenever datasource is changed, we recalculate the row keys,
  // and it's expanded by default
  React.useEffect(() => {
    setExpandedRowKeys(
      calculateAllExpandedRowKeys(dataSource, { level: -1, key: 'id' }).map((it: string) =>
        Number(it),
      ),
    );
  }, [dataSource]);

  return (
    <PageContainer title={false}>
      <div className={styles['padding-card']}>
        <ProTable<API.DepartmentUnit>
          headerTitle="Organization structure"
          className="card-shadow"
          columns={columns}
          dataSource={dataSource}
          loading={departmentsPending}
          onExpand={onTableTreeExpand}
          rowKey="id"
          expandedRowKeys={expandedRowKeys}
          pagination={false}
          locale={{ emptyText: 'There is no department to show' }}
          search={false}
          // defaultExpandAllRows={true} // doesn't work for async data
        />
      </div>
      <CrudModal />
    </PageContainer>
  );
};

export default OrganziationStructure;
