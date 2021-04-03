import { allEmployees, deleteEmployee } from '@/services/employee';
import {
  DeleteOutlined,
  EditOutlined,
  ManOutlined,
  PlusOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, Space } from 'antd';
import moment from 'moment';
import React from 'react';
import { FormattedMessage, Link, useIntl, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';

type RecordType = API.Employee;

const EmployeeList: React.FC = () => {
  const intl = useIntl();
  const { actionRef, setCrudModalVisible, setSelectedRecord, onCrudOperation } = useModel(
    'employee',
  );

  const columns: ProColumns<RecordType>[] = [
    {
      key: 'id',
      dataIndex: 'id',
      hideInTable: true,
    },
    {
      title: 'Full name',
      key: 'full_name',
      dataIndex: 'avatar',
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/${record.id}`}>
            {record.first_name} {record.last_name}
          </Link>
        </Space>
      ),
      fixed: 'left',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'gender',
      renderText: (val) => {
        let icon = 'Other' as any;
        if (val === 'Male') icon = <ManOutlined style={{ color: '#3C79CF' }} />;
        if (val === 'Female') icon = <WomanOutlined style={{ color: '#F23A87' }} />;
        return <div style={{}}>{icon}</div>;
      },
    },
    {
      title: 'Email address',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: 'Marital status',
      key: 'marital_status',
      dataIndex: 'marital_status',
    },
    {
      title: 'DoB (DD-MM-YYYY)',
      key: 'date_of_birth',
      dataIndex: 'date_of_birth',
      renderText: (date) => date && moment(date).format('DD-MM-YYYY'),
    },
    { title: 'Personal tax id', key: 'personal_tax_id', dataIndex: 'personal_tax_id' },
    { title: 'Nationality', key: 'nationality', dataIndex: 'nationality' },
    { title: 'Phone', key: 'phone', dataIndex: 'phone' },
    { title: 'Social insurance', key: 'social_insurance', dataIndex: 'social_insurance' },
    { title: 'Health insurance', key: 'health_insurance', dataIndex: 'health_insurance' },
    // {
    //   title: 'Supervisor',
    //   key: 'supervisor',
    //   dataIndex: ['supervisor', 'avatar'],
    //   valueType: 'avatar',
    //   render: (avatar, record) => (
    //     <Space>
    //       <span>{avatar}</span>
    //       <Link to={`/employee/${record.id}`}>
    //         {record.supervisor?.first_name} {record.supervisor?.last_name}
    //       </Link>
    //     </Space>
    //   ),
    // },
    // {
    //   title: 'Status',
    //   key: 'is_active',
    //   dataIndex: ['user', 'is_active'],
    //   // valueType: 'checkbox',
    //   renderText: (val) => (val ? <CheckOutlined /> : <MinusOutlined />),
    // },
    {
      title: 'Status',
      dataIndex: ['user', 'is_active'],
      hideInForm: true,
      valueEnum: {
        true: {
          text: 'Active',
          status: 'Success',
        },
        false: {
          text: 'Inactive',
          status: 'Error',
        },
      },
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      // width: '20%',
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit this employee"
            size="small"
            onClick={() => {
              setCrudModalVisible('update');
              setSelectedRecord(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            placement="right"
            title={'Delete this employee?'}
            onConfirm={async () => {
              await onCrudOperation(() => deleteEmployee(record.id), 'Cannot delete employee!');
            }}
          >
            <Button title="Delete this employee" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<RecordType, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.employee.list.table.title',
          defaultMessage: 'Employees',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCrudModalVisible('create');
              setSelectedRecord(undefined);
            }}
          >
            <PlusOutlined />{' '}
            <FormattedMessage id="pages.employee.list.table.new" defaultMessage="New" />
          </Button>,
        ]}
        request={async () => {
          const fetchData = await allEmployees();
          return {
            success: true,
            data: fetchData,
            total: fetchData.length,
          };
        }}
        columns={columns}
      />
      <CrudModal />
    </div>
  );
};

export default EmployeeList;
