import { __DEV__ } from '@/global';
import {
  allWorkShifts,
  createWorkShift,
  deleteWorkShift,
  updateWorkShift
} from '@/services/admin.job.workShift';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTimePicker } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type RecordType = API.WorkShift;

export const WorkShift: React.FC = () => {
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

  const calcDuration = (record: RecordType) => {
    const hours = moment
      .duration(moment(record.end_time, 'hh:mm:ss').diff(moment(record.start_time, 'hh:mm:ss')))
      .asHours();
    return `${hours.toFixed(1)} hrs`;
  };

  const addDuration = useCallback((record: RecordType) => {
    return {
      ...record,
      duration: calcDuration(record),
    } as RecordType;
  }, []);

  const midifiedSelectedRecord = useMemo(() => {
    if (!selectedRecord) return selectedRecord;
    return addDuration(selectedRecord);
  }, [addDuration, selectedRecord]);

  const columns: ProColumns<RecordType>[] = [
    {
      title: <FormattedMessage id="pages.admin.job.workShift.column.name" defaultMessage="Shift" />,
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.start_time"
          defaultMessage="Start time"
        />
      ),
      dataIndex: 'start_time',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.end_time"
          defaultMessage="End time"
        />
      ),
      dataIndex: 'end_time',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.duration"
          defaultMessage="Duration"
        />
      ),
      dataIndex: 'duration',
    },
    // {
    //   title: (
    //     <FormattedMessage id="pages.admin.job.workShift.column.is_active" defaultMessage="Status" />
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
            title="Edit this work shift"
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
            title={'Delete this work shift?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteWorkShift(record.id),
                'Detete successfully!',
                'Cannot delete work shift!',
              );
            }}
          >
            <Button title="Delete this work shift" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create work shift',
      update: 'Create work shift',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.workShift.list.title',
          defaultMessage: 'Work shifts',
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
          const data = await allWorkShifts();
          return {
            data: data.map((it) => addDuration(it)),
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
          if (!midifiedSelectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...midifiedSelectedRecord,
              start_time: moment(midifiedSelectedRecord.start_time, 'hh:mm:ss'),
              end_time: moment(midifiedSelectedRecord.end_time, 'hh:mm:ss'),
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...midifiedSelectedRecord,
            ...value,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createWorkShift(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateWorkShift(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        onValuesChange={(changedValues) => {
          console.log('>  ~ file: index.tsx ~ line 245 ~ changedValues', changedValues);
          if (changedValues.start_time || changedValues.end_time) {
            form.setFieldsValue({
              ...form.getFieldsValue(),
              duration: calcDuration(form.getFieldsValue()),
            });
          }
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    const newValue = {
                      name: faker.name.title(),
                      start_time: faker.helpers.randomize([
                        moment('08:00:00', 'hh:mm:ss'),
                        moment('08:30:00', 'hh:mm:ss'),
                        moment('09:00:00', 'hh:mm:ss'),
                      ]),
                      end_time: faker.helpers.randomize([
                        moment('18:00:00', 'hh:mm:ss'),
                        moment('17:30:00', 'hh:mm:ss'),
                        moment('17:00:00', 'hh:mm:ss'),
                      ]),
                      duration: '',
                      // is_active: true,
                    } as RecordType;
                    props.form?.setFieldsValue(addDuration(newValue));
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
        <ProFormText
          rules={[{ required: true }]}
          name="name"
          width="md"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.name',
            defaultMessage: 'Shift name',
          })}
        />
        <ProFormTimePicker
          rules={[{ required: true }]}
          name="start_time"
          width="md"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.start_time',
            defaultMessage: 'Start time',
          })}
        />
        <ProFormTimePicker
          rules={[{ required: true }]}
          name="end_time"
          width="md"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.end_time',
            defaultMessage: 'End time',
          })}
        />
        <ProFormText
          rules={[{ required: true }]}
          disabled
          dependencies={['start_time', 'end_time']}
          name="duration"
          width="md"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.duration',
            defaultMessage: 'Duration',
          })}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default WorkShift;
