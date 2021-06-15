import { allEmployees } from '@/services/employee';
import { ManOutlined, PlusOutlined, WomanOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Space } from 'antd';
import React from 'react';
import { Access, FormattedMessage, history, Link, useAccess, useIntl, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';
import { PageContainer } from '@ant-design/pro-layout';
import { useTableSettings } from '@/utils/hooks/useTableSettings';

type RecordType = API.Employee;

const EmployeeList: React.FC = () => {
  const intl = useIntl();
  const { actionRef, setCrudModalVisible, setSelectedRecord } = useModel('employee');
  const access = useAccess();
  if (history.location.pathname.includes('add')) {
    setCrudModalVisible('create');
    history.replace('/employee/list');
  }
  const tableSettings = useTableSettings();

  const columns: ProColumns<RecordType>[] = [
    {
      title: <FormattedMessage id="property.full_name" defaultMessage="Full name" />,
      key: 'full_name',
      dataIndex: 'avatar',
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/list/${record.id}`}>
            {record.first_name} {record.last_name}
          </Link>
        </Space>
      ),
      fixed: 'left',
    },
    {
      title: <FormattedMessage id="property.role" defaultMessage="Role" />,

      key: 'role',
      dataIndex: 'role',
    },
    {
      title: <FormattedMessage id="property.gender" defaultMessage="Gender" />,
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
          text: <FormattedMessage id="property.gender.other" defaultMessage="Other" />,
        },
      },
    },
    {
      title: <FormattedMessage id="property.email" defaultMessage="Email address" />,

      key: 'email',
      dataIndex: 'email',
    },
    {
      title: <FormattedMessage id="property.marital_status" defaultMessage="Marital status" />,
      key: 'marital_status',
      dataIndex: 'marital_status',
      valueEnum: {
        Single: {
          text: <FormattedMessage id="property.marital_status.single" defaultMessage="Single" />,
        },
        Married: {
          text: <FormattedMessage id="property.marital_status.married" defaultMessage="Married" />,
        },
        Divorced: {
          text: (
            <FormattedMessage id="property.marital_status.divorced" defaultMessage="Divorced" />
          ),
        },
        Seperated: {
          text: (
            <FormattedMessage id="property.marital_status.seperated" defaultMessage="Seperated" />
          ),
        },
        Widowed: {
          text: <FormattedMessage id="property.marital_status.widowed" defaultMessage="Widowed" />,
        },
        Other: {
          text: <FormattedMessage id="property.marital_status.other" defaultMessage="Other" />,
        },
      },
    },
    {
      title: <FormattedMessage id="property.date_of_birth" defaultMessage="DoB (YYYY-MM-DD)" />,
      key: 'date_of_birth',
      dataIndex: 'date_of_birth',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="property.personal_tax_id" defaultMessage="Personal tax id" />,
      key: 'personal_tax_id',
      dataIndex: 'personal_tax_id',
    },
    {
      title: <FormattedMessage id="property.nationality" defaultMessage="Nationality" />,
      key: 'nationality',
      dataIndex: 'nationality',
    },
    {
      title: <FormattedMessage id="property.phone" defaultMessage="Phone" />,
      key: 'phone',
      dataIndex: 'phone',
    },
    {
      title: <FormattedMessage id="property.social_insurance" defaultMessage="Social insurance" />,
      key: 'social_insurance',
      dataIndex: 'social_insurance',
    },
    {
      title: <FormattedMessage id="property.health_insurance" defaultMessage="Health insurance" />,
      key: 'health_insurance',
      dataIndex: 'health_insurance',
    },
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
      title: <FormattedMessage id="property.status" defaultMessage="Status" />,
      fixed: 'right',
      width: 150,
      dataIndex: 'status',
      hideInForm: true,
      sorter: (a, b) => {
        const mapStatusToImportance = {
          Working: 0,
          Terminated: 1,
          NewHired: 2,
        } as const;
        return mapStatusToImportance[a.status] - mapStatusToImportance[b.status];
      },
      valueEnum: {
        NewHired: {
          text: <FormattedMessage id="property.status.newHire" defaultMessage="New Hire" />,
          status: 'warning',
        },
        Working: {
          text: <FormattedMessage id="property.status.working" defaultMessage="'Working'" />,
          status: 'success',
        },
        Terminated: {
          text: <FormattedMessage id="property.status.terminated" defaultMessage="'Terminated'" />,
          status: 'error',
        },
      },
    },
    // NOTE: might need in the future
    // {
    //   title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
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
    //                       title={`${intl.formatMessage({
    //   id: 'property.actions.delete',
    //   defaultMessage: 'Delete',
    // })} ${localeFeature}?`}
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
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        {...tableSettings}
        className="card-shadow"
        headerTitle={intl.formatMessage({
          id: 'pages.employee.list.table.title',
          defaultMessage: 'Employees',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 150,
        }}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Access accessible={access['add_employee']}>
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
            </Button>
          </Access>,
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
    </PageContainer>
  );
};

export default EmployeeList;
