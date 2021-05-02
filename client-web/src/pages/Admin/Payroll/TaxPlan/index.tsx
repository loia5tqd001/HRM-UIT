import { __DEV__ } from '@/global';
import {
  allTaxPlans,
  createTaxPlan,
  deleteTaxPlan,
  updateTaxPlan,
} from '@/services/admin.payroll.taxPlan';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type RecordType = API.TaxPlan;

export const TaxPlan: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [],
  );

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
    },
    {
      title: 'Tax type',
      dataIndex: 'tax_type',
    },
    // {
    //   title: (
    //     <FormattedMessage id="pages.admin.job.jobTitle.column.is_active" defaultMessage="Status" />
    //   ),
    //   dataIndex: 'is_active',
    //   hideInForm: true,
    //   valueEnum: {
    //     true: {
    //       text: (
    //         <FormattedMessage
    //           id="pages.employee.list.column.status.active"
    //           defaultMessage="Status"
    //         />
    //       ),
    //       status: 'Success',
    //     },
    //     false: {
    //       text: (
    //         <FormattedMessage
    //           id="pages.employee.list.column.status.inactive"
    //           defaultMessage="Status"
    //         />
    //       ),
    //       status: 'Error',
    //     },
    //   },
    // },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit this tax plan"
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
            title={'Delete this tax plan?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteTaxPlan(record.id),
                'Detete successfully!',
                'Cannot delete tax plan!',
              );
            }}
          >
            <Button title="Delete this tax plan" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create tax plan',
      update: 'Create tax plan',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.jobTitle.list.title',
          defaultMessage: 'Tax Plans',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCrudModalVisible('create');
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async () => {
          const data = await allTaxPlans();
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
        width="400px"
        visible={crudModalVisible !== 'hidden'}
        form={form}
        onVisibleChange={(visible) => {
          if (!visible) {
            setCrudModalVisible('hidden');
            form.resetFields();
            return;
          }
          if (!selectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...selectedRecord,
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...selectedRecord,
            ...value,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createTaxPlan(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateTaxPlan(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    props.form?.setFieldsValue({
                      name: 'VN Standard',
                      code: 'vn_standard',
                      tax_type: 'Progressive',
                    });
                  }}
                >
                  Auto fill
                </Button>
              ),
              ...defaultDoms,
            ];
          },
        }}
      >
        <ProFormText rules={[{ required: true }]} name="name" label="Name" />
        <ProFormText rules={[{ required: true }]} name="code" label="code" />
        <ProFormSelect
          rules={[{ required: true }]}
          name="tax_type"
          label="Tax type"
          options={[{ value: 'Progressive', label: 'Progressive' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TaxPlan;
