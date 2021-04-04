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
      valueEnum: {
        Male: {
          text: <ManOutlined style={{ color: '#3C79CF' }} />,
        },
        Female: {
          text: <WomanOutlined style={{ color: '#F23A87' }} />,
        },
        Other: {
          text: 'Other',
        },
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
      title: 'DoB (YYYY-MM-DD)',
      key: 'date_of_birth',
      dataIndex: 'date_of_birth',
      valueType: 'date',
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
    // NOTE: might need in the future
    // {
    //   title: 'Actions',
    //   key: 'action',
    //   fixed: 'right',
    //   align: 'center',
    //   search: false,
    //   render: (dom, record) => (
    //     <Space size="small">
    //       <Button
    //         title="Edit this employee"
    //         size="small"
    //         onClick={() => {
    //           setCrudModalVisible('update');
    //           setSelectedRecord(record);
    //         }}
    //       >
    //         <EditOutlined />
    //       </Button>
    //       {/* Delete button: might need in the future */}
    //       {/* <Popconfirm
    //         placement="right"
    //         title={'Delete this employee?'}
    //         onConfirm={async () => {
    //           await onCrudOperation(() => deleteEmployee(record.id), 'Cannot delete employee!');
    //         }}
    //       >
    //         <Button title="Delete this employee" size="small" danger>
    //           <DeleteOutlined />
    //         </Button>
    //       </Popconfirm> */}
    //     </Space>
    //   ),
    // },
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
        request={async (query) => {
          let fetchData = await allEmployees();

          // Handle query data:
          delete query.current;
          delete query.pageSize;
          Object.entries(query).forEach(([k, v]) => {
            const keyword = String(v).toLowerCase();

            // Section 1: Some special keys, for example nested filter: user.is_active = "true"
            const specialKeys = ['user', 'full_name'];
            if (specialKeys.includes(k)) {
              switch (k) {
                case 'user': {
                  fetchData = fetchData.filter(
                    (item) => String(item.user.is_active) === (v as any)?.is_active,
                  );
                  return;
                }

                case 'full_name': {
                  fetchData = fetchData.filter((it) =>
                    `${it.first_name} ${it.last_name}`.toLowerCase().includes(keyword),
                  );
                  return;
                }

                default:
                  return;
              }
            }

            // Section 2: key doesn't exist in object nor specialKeys
            const keyExists = fetchData.some((item) => item[k]);
            if (!keyExists) {
              return;
            }

            // Section 3: Normal strict filter keys, compare by "==="
            const strictFilterKeys = ['gender', 'date_of_birth'];
            if (strictFilterKeys.includes(k)) {
              fetchData = fetchData.filter((item) => item[k] === v);
            } else {
              // Section 4: Loose strict filter keys, compare by "includes"
              fetchData = fetchData.filter((item) =>
                String(item[k]).toLowerCase().includes(keyword),
              );
            }
          });

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
