import { allEmployees } from '@/services/employee';
import { removeRule, updateRule } from '@/services/__rule';
import { addEmployee } from '@/services/employee';
import {
  CheckOutlined,
  ManOutlined,
  MinusOutlined,
  PlusOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { FooterToolbar } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { FormattedMessage, Link, useIntl, useModel } from 'umi';
import type { FormValueType } from './components/UpdateForm';
import { useForm } from 'antd/es/form/Form';

/**
 *
 * @param fields
 */
const handleAdd = async (fields: API.EmployeeOnCreate) => {
  const hide = message.loading('正在添加');
  try {
    await addEmployee({ ...fields });
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
const handleRemove = async (selectedRows: API.EmployeeOnCreate[]) => {
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

const EmployeeList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.EmployeeOnList>();
  const [selectedRowsState, setSelectedRows] = useState<API.EmployeeOnList[]>([]);

  const intl = useIntl();

  const columns: ProColumns<API.EmployeeOnList>[] = [
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
        let icon = null;
        if (val === 'Male') icon = <ManOutlined />;
        if (val === 'Male') icon = <WomanOutlined />;
        return <div style={{}}>{icon}</div>;
      },
    },
    {
      title: 'Email address',
      key: 'email',
      dataIndex: 'email',
    },

    { title: 'Job title', key: 'jobTitle', dataIndex: 'job_title' },
    { title: 'Department', key: 'department', dataIndex: 'department' },
    { title: 'Location', key: 'location', dataIndex: 'location' },
    {
      title: 'Supervisor',
      key: 'supervisor',
      dataIndex: ['supervisor', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/${record.id}`}>
            {record.supervisor?.first_name} {record.supervisor?.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Active',
      key: 'is_active',
      dataIndex: 'is_active',
      renderText: (val) => (val ? <CheckOutlined /> : <MinusOutlined />),
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

  const [formCreate] = useForm();

  return (
    <div>
      <ProTable<API.EmployeeOnList, API.PageParams>
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
        loading={employeesPending}
        // request={allEmployees}
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
        // width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.EmployeeOnCreate);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              <Button
                key="autoFill"
                onClick={() => {
                  formCreate.setFieldsValue({
                    user: {
                      username: 'loia5tqd001',
                      password: '123456',
                      confirm_password: '123456',
                      email: 'loia5tqd001@gmail.com',
                      first_name: 'Nguyen',
                      last_name: 'Huynh Loi',
                    },
                  });
                }}
              >
                Auto fill
              </Button>,
              ...defaultDoms,
            ];
          },
        }}
        form={formCreate}
      >
        <ProForm.Group>
          <ProFormText
            width="sm"
            rules={[{ required: true }]}
            name={['user', 'username']}
            label="Username"
          />
          <ProFormText.Password
            width="sm"
            rules={[{ required: true }]}
            name={['user', 'password']}
            label="Password"
          />
          <ProFormText.Password
            width="sm"
            rules={[{ required: true }]}
            name={['user', 'confirm_password']}
            label="Confirm Password"
          />
          <ProFormText
            width="sm"
            rules={[{ required: true, type: 'email' }]}
            name={['user', 'email']}
            label="Email"
          />
          <ProFormText
            width="sm"
            rules={[{ required: true }]}
            name={['user', 'first_name']}
            label="First name"
          />
          <ProFormText
            width="sm"
            rules={[{ required: true }]}
            name={['user', 'last_name']}
            label="Last name"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="supervisor"
            label="Supervisor"
            options={[
              { value: 1, label: 'Loi' },
              { value: 2, label: 'Dung' },
              { value: 3, label: 'Cuong' },
            ]}
          />
          <ProFormDatePicker width="sm" name="date_of_birth" label="Date of birth" />
          <ProFormSelect
            width="sm"
            name="gender"
            label="Gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <ProFormSelect
            width="sm"
            name="marital_status"
            label="Marital status"
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <ProFormText width="sm" name="street" label="Street" />
          <ProFormText width="sm" name="city" label="City" />
          <ProFormText width="sm" name="province" label="Province" />
          <ProFormText width="sm" name="home_telephone" label="Home telephone" />
          <ProFormText width="sm" name="mobile" label="Mobile" />
          <ProFormText width="sm" name="work_telephone" label="Work telephone" />
          <ProFormText width="sm" name="work_email" label="Work email" />
        </ProForm.Group>
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
          <ProDescriptions<API.EmployeeCompact>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.EmployeeCompact>[]}
          />
        )}
      </Drawer> */}
    </div>
  );
};

export default EmployeeList;
