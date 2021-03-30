import { ManOutlined, PlusOutlined, TeamOutlined, WomanOutlined } from '@ant-design/icons';
import { Button, message, Input, Drawer, Space } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage, Link } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { rule, addRule, updateRule, removeRule } from '@/services/__rule';
import { useModel } from 'umi';
import { allEmployees } from '@/services/employee';
import moment from 'moment';

/**
 *
 * @param fields
 */
const handleAdd = async (fields: API.Employee) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.Employee[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Employee>();
  const [selectedRowsState, setSelectedRows] = useState<API.Employee[]>([]);

  const intl = useIntl();

  const columns: ProColumns<API.Employee>[] = [
    {
      title: 'Full name',
      key: 'fullName',
      dataIndex: ['general', 'personalInfo', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/${record.id}`}>
            {record.general.personalInfo.firstName} {record.general.personalInfo.lastName}
          </Link>
        </Space>
      ),
      fixed: 'left',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: ['general', 'personalInfo', 'gender'],
      renderText: (val) => {
        let icon = <TeamOutlined />;
        if (val === 'Male') icon = <ManOutlined />;
        if (val === 'Male') icon = <WomanOutlined />;
        return <div style={{ display: 'grid', placeContent: 'center' }}>{icon}</div>;
      },
    },
    {
      title: 'Date of birth',
      key: 'dateOfBirth',
      dataIndex: ['general', 'personalInfo', 'dateOfBirth'],
      renderText: (val) => moment(val).format('DD-MM-YYYY'),
    },
    // {
    //   title: 'Marital status',
    //   key: 'maritalStatus',
    //   dataIndex: ['general', 'personalInfo', 'maritalStatus'],
    // },
    {
      title: 'Phone number',
      key: 'phoneNumber',
      dataIndex: ['general', 'personalInfo', 'phoneNumber'],
    },
    {
      title: 'Email address',
      key: 'emailAddress',
      dataIndex: ['general', 'personalInfo', 'emailAddress'],
    },
    {
      title: 'Personal tax id',
      key: 'personalTaxId',
      dataIndex: ['general', 'personalInfo', 'personalTaxId'],
    },
    {
      title: 'Social insurrance',
      key: 'socialInsurrance',
      dataIndex: ['general', 'personalInfo', 'socialInsurrance'],
    },
    {
      title: 'Health insurrance',
      key: 'healthInsurrance',
      dataIndex: ['general', 'personalInfo', 'healthInsurrance'],
    },
    {
      title: 'Country',
      key: 'country',
      dataIndex: ['general', 'homeAddress', 'country'],
    },
    {
      title: 'Province',
      key: 'province',
      dataIndex: ['general', 'homeAddress', 'province'],
    },
    {
      title: 'City',
      key: 'city',
      dataIndex: ['general', 'homeAddress', 'city'],
    },
    {
      title: 'Postal code',
      key: 'postalCode',
      dataIndex: ['general', 'homeAddress', 'postalCode'],
    },
    {
      title: 'Full address',
      key: 'fullAddress',
      dataIndex: ['general', 'homeAddress', 'fullAddress'],
    },
    {
      title: 'Emergency contact name',
      key: 'fullName',
      dataIndex: ['general', 'emergencyContact', 'fullName'],
    },
    {
      title: 'Emergency contact relationship',
      key: 'relationship',
      dataIndex: ['general', 'emergencyContact', 'relationship'],
    },
    {
      title: 'Emergency contact phoneNumber',
      key: 'phoneNumber',
      dataIndex: ['general', 'emergencyContact', 'phoneNumber'],
    },
    {
      title: 'Bank name',
      key: 'bankName',
      dataIndex: ['general', 'bankInfo', 'bankName'],
    },
    {
      title: 'Bank branch',
      key: 'branch',
      dataIndex: ['general', 'bankInfo', 'branch'],
    },
    {
      title: 'Bank account name',
      key: 'accountName',
      dataIndex: ['general', 'bankInfo', 'accountName'],
    },
    {
      title: 'Bank account number',
      key: 'accountNumber',
      dataIndex: ['general', 'bankInfo', 'accountNumber'],
    },
    { title: 'Join data', key: 'joinDate', dataIndex: ['job', 'jobInfo', 'joinDate'] },
    { title: 'jobTitle', key: 'jobTitle', dataIndex: ['job', 'jobInfo', 'jobTitle', 'name'] },
    {
      title: 'Employment type',
      key: 'employmentType',
      dataIndex: ['job', 'jobInfo', 'employmentType', 'name'],
    },
    { title: 'Department', key: 'department', dataIndex: ['job', 'jobInfo', 'department', 'name'] },
    { title: 'Location', key: 'location', dataIndex: ['job', 'jobInfo', 'location', 'name'] },
    // { title: 'Skills', key: 'skills', dataIndex: ['job', 'jobInfo', 'skills'] },
    // { title: 'Education', key: 'education', dataIndex: ['job', 'jobInfo', 'education'] },
    // { title: 'License', key: 'license', dataIndex: ['job', 'jobInfo', 'license'] },
    // { title: 'Languages', key: 'languages', dataIndex: ['job', 'jobInfo', 'languages'] },
    { title: 'Supervisor', key: 'supervisor', dataIndex: ['job', 'jobInfo', 'supervisor'] },
    {
      title: 'Supervisor',
      key: 'supervisor',
      dataIndex: ['job', 'jobInfo', 'supervisor', 'general', 'personalInfo', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/${record.id}`}>
            {record.job.jobInfo.supervisor?.general.personalInfo.firstName}{' '}
            {record.job.jobInfo.supervisor?.general.personalInfo.lastName}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Probation start date',
      key: 'probationStartDate',
      dataIndex: ['job', 'jobInfo', 'probationStartDate'],
    },
    {
      title: 'Probation end date',
      key: 'probationEndDate',
      dataIndex: ['job', 'jobInfo', 'probationEndDate'],
    },
    {
      title: 'Contract start date',
      key: 'contractStartDate',
      dataIndex: ['job', 'jobInfo', 'contractStartDate'],
    },
    {
      title: 'Contract end date',
      key: 'contractEndDate',
      dataIndex: ['job', 'jobInfo', 'contractEndDate'],
    },
    {
      title: 'Salary',
      key: 'salary',
      dataIndex: ['payroll', 'salary'],
    },
    // {
    //   title: 'Job title',
    //   key: 'jobTitle',
    //   dataIndex: 'general.personal.jobTitle',
    // },
    // {
    //   title: 'Employment status',
    //   key: 'employmentStatus',
    //   dataIndex: 'employmentStatus',
    // },
    // {
    //   title: 'Department',
    //   key: 'department',
    //   dataIndex: 'department',
    // },
    // {
    //   title: 'Location',
    //   key: 'location',
    //   dataIndex: 'location',
    // },
    // {
    //   title: 'Supervisor',
    //   key: 'supervisor',
    //   dataIndex: 'supervisor',
    // },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="pages.searchTable.updateForm.ruleName.nameLabel"
    //       defaultMessage="Rule Name"
    //     />
    //   ),
    //   hideInTable: true,
    //   hideInSetting: false,
    //   dataIndex: 'name',
    //   tip: 'The rule name is the unique key',
    //   render: (dom, entity) => {
    //     return (
    //       <a
    //         onClick={() => {
    //           setCurrentRow(entity);
    //           setShowDetail(true);
    //         }}
    //       >
    //         {dom}
    //       </a>
    //     );
    //   },
    // },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="描述" />,
    //   dataIndex: 'desc',
    //   valueType: 'textarea',
    // },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleCallNo" defaultMessage="服务调用次数" />,
    //   dataIndex: 'callNo',
    //   sorter: true,
    //   hideInForm: true,
    //   renderText: (val: string) =>
    //     `${val}${intl.formatMessage({
    //       id: 'pages.searchTable.tenThousand',
    //       defaultMessage: ' 万 ',
    //     })}`,
    // },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="状态" />,
    //   dataIndex: 'status',
    //   hideInForm: true,
    //   valueEnum: {
    //     0: {
    //       text: (
    //         <FormattedMessage id="pages.searchTable.nameStatus.default" defaultMessage="关闭" />
    //       ),
    //       status: 'Default',
    //     },
    //     1: {
    //       text: (
    //         <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="运行中" />
    //       ),
    //       status: 'Processing',
    //     },
    //     2: {
    //       text: (
    //         <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="已上线" />
    //       ),
    //       status: 'Success',
    //     },
    //     3: {
    //       text: (
    //         <FormattedMessage id="pages.searchTable.nameStatus.abnormal" defaultMessage="异常" />
    //       ),
    //       status: 'Error',
    //     },
    //   },
    // },
    // {
    //   title: (
    //     <FormattedMessage id="pages.searchTable.titleUpdatedAt" defaultMessage="上次调度时间" />
    //   ),
    //   sorter: true,
    //   dataIndex: 'updatedAt',
    //   valueType: 'dateTime',
    //   renderFormItem: (item, { defaultRender, ...rest }, form) => {
    //     const status = form.getFieldValue('status');
    //     if (`${status}` === '0') {
    //       return false;
    //     }
    //     if (`${status}` === '3') {
    //       return (
    //         <Input
    //           {...rest}
    //           placeholder={intl.formatMessage({
    //             id: 'pages.searchTable.exception',
    //             defaultMessage: '请输入异常原因！',
    //           })}
    //         />
    //       );
    //     }
    //     return defaultRender(item);
    //   },
    // },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   render: (_, record) => [
    //     <a
    //       key="config"
    //       onClick={() => {
    //         handleUpdateModalVisible(true);
    //         setCurrentRow(record);
    //       }}
    //     >
    //       <FormattedMessage id="pages.searchTable.config" defaultMessage="配置" />
    //     </a>,
    //     <a key="subscribeAlert" href="https://procomponents.ant.design/">
    //       <FormattedMessage id="pages.searchTable.subscribeAlert" defaultMessage="订阅警报" />
    //     </a>,
    //   ],
    // },
  ];

  const { employees, employeesPending } = useModel('employee');

  return (
    <div>
      <ProTable<API.Employee, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.user.listForm.title',
          defaultMessage: '查询表格',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={allEmployees}
        dataSource={employees}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="服务调用次数总计"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.batchApproval" defaultMessage="批量审批" />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="Create Employee"
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.Employee);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText rules={[{ required: true }]} name="firstName" label="First name" />
        <ProFormText rules={[{ required: true }]} name="lastName" label="Last name" />
        <ProFormText rules={[{ required: true, type: 'email' }]} name="email" label="Email" />
        <ProFormText rules={[{ required: true }]} name="username" label="Username" />
        <ProFormText.Password rules={[{ required: true }]} name="password" label="Password" />
        <ProFormText.Password
          rules={[{ required: true }]}
          name="confirmPassword"
          label="Confirm Password"
        />
      </ModalForm>
      {/* <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.Employee>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.Employee>[]}
          />
        )}
      </Drawer> */}
    </div>
  );
};

export default TableList;
