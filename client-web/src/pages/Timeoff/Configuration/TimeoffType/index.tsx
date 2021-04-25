import { __DEV__ } from '@/global';
import {
  allTimeOffTypes,
  createTimeOffType,
  deleteTimeOffType,
  updateTimeOffType,
} from '@/services/timeOff.timeOffType';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormDigit, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type RecordType = API.TimeOffType;

export const TimeOffType: React.FC = () => {
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
      title: 'Timeoff type',
      dataIndex: 'name',
    },
    {
      title: 'Paid',
      dataIndex: 'is_paid',
      align: 'center',
      renderText: (it) =>
        it ? (
          <Tooltip title="Paid">
            <CheckOutlined />
          </Tooltip>
        ) : (
          <Tooltip title="Unpaid">
            <CloseOutlined />
          </Tooltip>
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
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
            title="Edit this timeoff type"
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
            title={'Delete this timeoff type?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteTimeOffType(record.id),
                'Detete successfully!',
                'Cannot delete timeoff type!',
              );
            }}
          >
            <Button title="Delete this timeoff type" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create timeoff type',
      update: 'Create timeoff type',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle="Timeoff types"
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
          const data = await allTimeOffTypes();
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
              () => createTimeOffType(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateTimeOffType(record.id, record),
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
                      name: faker.name.jobTitle(),
                      description: faker.name.jobDescriptor(),
                      // is_active: true,
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
        <ProFormText rules={[{ required: true }]} name="name" label="Timeoff type" />
        <ProFormTextArea name="description" label="Description" />
        <ProFormSwitch
          rules={[{ required: true }]}
          name="is_paid"
          label="Paid"
          initialValue={true}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TimeOffType;
