import { __DEV__ } from '@/global';
import {
  allInsurancePlans,
  createInsurancePlan,
  deleteInsurancePlan,
  updateInsurancePlan,
} from '@/services/admin.payroll.insurancePlan';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type RecordType = API.InsurancePlan;

export const InsurancePlan: React.FC = () => {
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
      title: 'Based on',
      dataIndex: 'base_on',
    },
    {
      title: 'Company percent',
      dataIndex: 'percent_company',
      valueType: 'percent',
    },
    {
      title: 'Employee percent',
      dataIndex: 'percent_employee',
      valueType: 'percent',
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit this insurance plan"
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
            title={'Delete this insurance plan?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteInsurancePlan(record.id),
                'Detete successfully!',
                'Cannot delete insurance plan!',
              );
            }}
          >
            <Button title="Delete this insurance plan" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create insurance plan',
      update: 'Update insurance plan',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        headerTitle={'Insurance Plans'}
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
          const data = await allInsurancePlans();
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
              () => createInsurancePlan(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateInsurancePlan(record.id, record),
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
                      base_on: 'Basic Salary',
                      percent_company: 21.5,
                      percent_employee: 10.5,
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
          name="base_on"
          label="Based on"
          options={[{ value: 'Basic Salary', label: 'Basic Salary' }]}
        />
        <ProFormDigit
          rules={[{ required: true }]}
          name="percent_company"
          label="Company percennt"
          min={0}
          max={100}
          fieldProps={{
            step: 0.5,
            formatter: (value) => `${value}%`,
            parser: (value) => value?.replace('%', '') || '',
          }}
        />
        <ProFormDigit
          rules={[{ required: true }]}
          name="percent_employee"
          label="Employee percent"
          min={0}
          max={100}
          fieldProps={{
            step: 0.5,
            formatter: (value) => `${value}%`,
            parser: (value) => value?.replace('%', '') || '',
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default InsurancePlan;
