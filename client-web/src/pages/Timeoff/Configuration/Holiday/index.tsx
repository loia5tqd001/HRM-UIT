import { __DEV__ } from '@/global';
import {
  allHolidays,
  createHoliday,
  deleteHoliday,
  updateHoliday,
} from '@/services/timeOff.holiday';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormDateRangePicker, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type RecordType = API.Holiday & {
  date?: [moment.Moment, moment.Moment];
  days?: number;
};

export const Holiday: React.FC = () => {
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
      title: 'Holiday',
      dataIndex: 'name',
      search: false,
    },
    {
      title: 'Year',
      dataIndex: 'start_date',
      valueType: 'dateYear',
    },
    {
      title: 'Time',
      dataIndex: 'start_date',
      search: false,
      sorter: (a, b) =>  moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1,
      renderText: (_, record) =>
        `${moment(record.start_date).format('DD MMM')} → ${moment(record.end_date).format(
          'DD MMM',
        )}`,
    },
    {
      title: 'Number of days',
      dataIndex: 'start_date',
      search: false,
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
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
            title="Edit this holiday"
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
            title={'Delete this holiday?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteHoliday(record.id),
                'Detete successfully!',
                'Cannot delete holiday!',
              );
            }}
          >
            <Button title="Delete this holiday" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create holiday',
      update: 'Create holiday',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        headerTitle="Holidays"
        actionRef={actionRef}
        rowKey="id"
        // search={false}
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
        request={async (query) => {
          let data = await allHolidays();
          if (query.start_date)
            data = data.filter((it) => (it.start_date as string).startsWith(query.start_date));
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
              date: [
                moment(selectedRecord.start_date, 'YYYY-MM-DD'),
                moment(selectedRecord.end_date, 'YYYY-MM-DD'),
              ],
              days:
                moment(selectedRecord.end_date, 'YYYY-MM-DD').diff(
                  moment(selectedRecord.start_date, 'YYYY-MM-DD'),
                  'days',
                ) + 1,
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...value,
            start_date: moment(value.date![0]),
            end_date: moment(value.date![1]),
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createHoliday(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateHoliday(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        onValuesChange={({ date }) => {
          if (date) {
            form.setFieldsValue({
              days: moment(date[1]).diff(moment(date[0]), 'days') + 1,
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
                    const dates = [
                      {
                        name: 'Tet Holiday',
                        date: [
                          moment('2021-02-10', 'YYYY-MM-DD'),
                          moment('2021-02-16', 'YYYY-MM-DD'),
                        ],
                        days: 7,
                      },
                      {
                        name: "New Year's Day",
                        date: [
                          moment('2021-01-01', 'YYYY-MM-DD'),
                          moment('2021-01-01', 'YYYY-MM-DD'),
                        ],
                        days: 1,
                      },
                      {
                        name: 'Hung Kings Temple Festival',
                        date: [
                          moment('2021-04-21', 'YYYY-MM-DD'),
                          moment('2021-04-21', 'YYYY-MM-DD'),
                        ],
                        days: 1,
                      },
                      {
                        name: 'Reunification Day',
                        date: [
                          moment('2021-04-30', 'YYYY-MM-DD'),
                          moment('2021-04-30', 'YYYY-MM-DD'),
                        ],
                        days: 1,
                      },
                      {
                        name: 'Labour Day',
                        date: [
                          moment('2021-05-01', 'YYYY-MM-DD'),
                          moment('2021-05-03', 'YYYY-MM-DD'),
                        ],
                        days: 3,
                      },
                      {
                        name: 'National Day',
                        date: [
                          moment('2021-09-02', 'YYYY-MM-DD'),
                          moment('2021-09-05', 'YYYY-MM-DD'),
                        ],
                        days: 4,
                      },
                    ];
                    props.form?.setFieldsValue(faker.helpers.randomize(dates));
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
        <ProFormText rules={[{ required: true }]} name="name" label="Holiday" width="md" />
        <ProFormDateRangePicker rules={[{ required: true }]} name="date" label="Time" width="md" />
        <ProFormText name="days" label="Number of days" width="md" readonly />
      </ModalForm>
    </PageContainer>
  );
};

export default Holiday;
