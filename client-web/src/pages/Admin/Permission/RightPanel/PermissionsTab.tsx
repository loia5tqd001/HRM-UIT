import { EditOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Radio, Select, Space, Typography } from 'antd';
import React from 'react';
import { useModel } from 'umi';

type Props = {};

export const PermissionsTab: React.FC<Props> = (props) => {
  const { selectedRole, setAccess, setPermission } = useModel('admin.permissions');

  const columns: ProColumns<API.PermissionItem>[] = [
    {
      title: 'Section',
      key: 'name',
      dataIndex: 'name',
      // render: (_, item) => {
      //   return <Badge status={item.status} text={item.roleName} />;
      // },
    },
    {
      title: 'Permission',
      key: 'access',
      dataIndex: 'access',
      render: (_, item) => {
        return (
          <Select
            defaultValue="no_access"
            style={{ width: 160 }}
            onChange={(values) => setPermission(item.id, values)}
            value={item.access}
          >
            <Select.Option value="no_access">
              <LockOutlined style={{ marginRight: 10 }} />
              No access
            </Select.Option>
            <Select.Option value="view_only">
              <EyeOutlined style={{ marginRight: 10 }} />
              View only
            </Select.Option>
            <Select.Option value="view_and_edit">
              <EditOutlined style={{ marginRight: 10 }} />
              View and edit
            </Select.Option>
          </Select>
        );
      },
    },
  ];

  return (
    <ProCard split="vertical">
      <Space direction="horizontal" style={{ marginBottom: 10 }}>
        <Typography.Text style={{ marginRight: 10 }}>
          Users of this role can access information of:
        </Typography.Text>
        <Radio.Group
          onChange={(e) => setAccess(e.target.value)}
          value={selectedRole?.permissions.access}
        >
          <Radio value={'all_employees'}>All employees</Radio>
          <Radio value={'direct_and_indirect'}>Direct & Indirect reports</Radio>
          <Radio value={'direct_reports'}>Direct reports</Radio>
        </Radio.Group>
      </Space>
      <ProTable<API.PermissionItem>
        columns={columns}
        // request={() => {
        //   return Promise.resolve({
        //     data: selectedRole?.permissions.permission_items,
        //     success: true,
        //   });
        // }}
        dataSource={selectedRole?.permissions.permission_items}
        rowKey="id"
        toolBarRender={false}
        options={false}
        pagination={false}
        search={false}
      />
    </ProCard>
  );
};
