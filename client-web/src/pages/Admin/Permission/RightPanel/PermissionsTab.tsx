import { EditOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Popconfirm, Radio, Select, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { useModel } from 'umi';

type Props = {};

export const PermissionsTab: React.FC<Props> = (props) => {
  // const [access, setAccess] = useState<API.RoleItem['permissions']['access']>('all_employees');
  const [temporaryAccess, setTemporaryAccess] = useState<API.RoleItem['permissions']['access']>(
    'all_employees',
  );
  const {
    roles,
    selectedRole,
    setAccessForSelectedRole,
    popconfirmVisible,
    setPopconfirmVisible,
    isLoading,
  } = useModel('admin.permissions');

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
            defaultValue="no_acsess"
            style={{ width: 160 }}
            onChange={(values) => console.log(values)}
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
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const handleOk = async () => {
    setConfirmLoading(true);
    await setAccessForSelectedRole(temporaryAccess);
    setPopconfirmVisible(false);
    setConfirmLoading(false);
    // setAccess(temporaryAccess);
  };

  const onChange = (e) => {
    setTemporaryAccess(e.target.value);
    setPopconfirmVisible(true);
  };

  const handleCancel = () => {
    setPopconfirmVisible(false);
  };

  return (
    <ProCard split="vertical">
      <Space direction="horizontal" style={{ marginBottom: 10 }}>
        <Typography.Text style={{ marginRight: 10 }}>
          Users of this role can access information of:
        </Typography.Text>
        <Radio.Group onChange={onChange} value={selectedRole?.permissions.access}>
          <Popconfirm
            title={`Change access for ${selectedRole?.roleName} ?`}
            visible={popconfirmVisible && temporaryAccess === 'all_employees'}
            onConfirm={handleOk}
            okButtonProps={{ loading: confirmLoading }}
            cancelButtonProps={{ disabled: confirmLoading }}
            onCancel={handleCancel}
          >
            <Radio value={'all_employees'}>All employees</Radio>
          </Popconfirm>
          <Popconfirm
            title={`Change access for ${selectedRole?.roleName} ?`}
            visible={popconfirmVisible && temporaryAccess === 'direct_and_indirect'}
            onConfirm={handleOk}
            okButtonProps={{ loading: confirmLoading }}
            cancelButtonProps={{ disabled: confirmLoading }}
            onCancel={handleCancel}
          >
            <Radio value={'direct_and_indirect'}>Direct & Indirect reports</Radio>
          </Popconfirm>
          <Popconfirm
            title={`Change access for ${selectedRole?.roleName} ?`}
            visible={popconfirmVisible && temporaryAccess === 'direct_reports'}
            onConfirm={handleOk}
            okButtonProps={{ loading: confirmLoading }}
            cancelButtonProps={{ disabled: confirmLoading }}
            onCancel={handleCancel}
          >
            <Radio value={'direct_reports'}>Direct reports</Radio>
          </Popconfirm>
        </Radio.Group>
      </Space>
      <ProTable<API.PermissionItem>
        columns={columns}
        request={() => {
          return Promise.resolve({
            data: selectedRole?.permissions.permission_items,
            success: true,
          });
        }}
        rowKey="id"
        // rowClassName={(record) => {
        //   return record.id === vallue ? styles['split-row-select-active'] : '';
        // }}
        toolBarRender={false}
        options={false}
        pagination={false}
        search={false}
        // onRow={(record) => {
        //   return {
        //     onClick: () => {
        //       if (record.roleName) {
        //         onChange(record.roleName);
        //       }
        //     },
        //   };
        // }}
      />
    </ProCard>
  );
};
