import {
  allCustomFields,
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from '@/services/admin.customField';
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

type RecordType = API.CustomField;

export const CustomField: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [valueType, setValueType] = useState<API.CustomField['type']>();

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
      title: (
        <FormattedMessage id="pages.admin.customField.column.name" defaultMessage="Job title" />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.customField.column.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      valueType: 'textarea',
      hideInForm: true,
    },
    // {
    //   title: (
    //     <FormattedMessage id="pages.admin.customField.column.is_active" defaultMessage="Status" />
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
            title="Edit this custom field"
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
            title={'Delete this custom field?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteCustomField(record.id),
                'Detete successfully!',
                'Cannot delete custom field!',
              );
            }}
          >
            <Button title="Delete this custom field" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create custom field',
      update: 'Create custom field',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.customField.list.title',
          defaultMessage: 'Job Titles',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
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
          const data = await allCustomFields();
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
              () => createCustomField(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateCustomField(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        onValuesChange={(changedValue) => {
          if (changedValue.type) {
            setValueType(changedValue.type);
          }
        }}
        // submitter={{
        //   render: (props, defaultDoms) => {
        //     return [
        //       __DEV__ && (
        //         <Button
        //           key="autoFill"
        //           onClick={() => {
        //             props.form?.setFieldsValue({
        //               name: faker.name.customField(),
        //               description: faker.name.jobDescriptor(),
        //               // is_active: true,
        //             });
        //           }}
        //         >
        //           Auto fill
        //         </Button>
        //       ),
        //       ...defaultDoms,
        //     ];
        //   },
        // }}
      >
        <ProFormText
          rules={[{ required: true }]}
          name="name"
          label={intl.formatMessage({
            id: 'pages.admin.customField.column.name',
            defaultMessage: 'Name',
          })}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'pages.admin.customField.column.description',
            defaultMessage: 'Description',
          })}
        />
        <ProFormText
          name="variable_name"
          tooltip="Variable name used in payroll"
          label={intl.formatMessage({
            id: 'pages.admin.customField.column.variable_name',
            defaultMessage: 'Variable name',
          })}
        />

        <ProFormSelect
          rules={[{ required: true }]}
          name="screen"
          label="Screen"
          options={[
            { value: 'general', label: 'General' },
            { value: 'job', label: 'Job' },
            { value: 'payroll', label: 'Payroll' },
            { value: 'dependent', label: 'Dependent' },
          ]}
        />
        <ProFormSelect
          rules={[{ required: true }]}
          name="type"
          label="Type"
          options={[
            { value: 'text', label: 'Text' },
            { value: 'dropdown', label: 'Dropdown' },
            { value: 'number', label: 'Number' },
            { value: 'email', label: 'Email' },
            { value: 'textarea', label: 'Textarea' },
            { value: 'checkbox', label: 'Checkbox' },
            { value: 'radio', label: 'Radio' },
          ]}
        />
        {valueType && ['dropdown', 'checkbox', 'radio'].includes(valueType) ? (
          <ProFormText
            name="options"
            rules={[{ required: true }]}
            label={intl.formatMessage({
              id: 'pages.admin.customField.column.options',
              defaultMessage: 'Options (seperated by comma)',
            })}
          />
        ) : null}
      </ModalForm>
    </PageContainer>
  );
};

export default CustomField;
