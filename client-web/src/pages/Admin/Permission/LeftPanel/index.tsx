import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button } from 'antd';
import React from 'react';
import { FormattedMessage, useModel } from 'umi';
import styles from './index.less';

type Props = {};

export type RoleItem = {
  id: string;
  roleName: string;
  members: number;
};

export const LeftPanel: React.FC<Props> = () => {
  const { roles, selectedRole, setSelectedRoleById, setPopconfirmVisible, isLoading } = useModel(
    'admin.permissions',
  );

  const columns: ProColumns<RoleItem>[] = [
    {
      title: 'Role name',
      key: 'roleName',
      dataIndex: 'roleName',
    },
    {
      title: 'Members',
      key: 'members',
      dataIndex: 'members',
    },
  ];

  return (
    <ProTable<RoleItem>
      loading={isLoading}
      columns={columns}
      request={() => {
        return Promise.resolve({
          data: roles.map((it) => ({
            id: it.id,
            roleName: it.roleName,
            members: it.members.length,
          })),
          success: true,
        });
      }}
      rowKey="id"
      rowClassName={(record) => {
        return record.id === selectedRole?.id ? styles['split-row-select-active'] : '';
      }}
      toolbar={{
        title: 'Roles',
        actions: [
          <Button type="primary" key="primary" onClick={() => {}}>
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ],
      }}
      options={false}
      pagination={false}
      search={false}
      onRow={(record) => {
        return {
          onClick: () => {
            if (record.id !== undefined) {
              setSelectedRoleById(record.id);
            }
          },
        };
      }}
    />
  );
};

export default LeftPanel;
