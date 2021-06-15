import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import {
  allHolidays,
  createHoliday,
  deleteHoliday,
  updateHoliday,
} from '@/services/timeOff.holiday';
import { filterData } from '@/utils/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl, useAccess, Access } from 'umi';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { allSchedules } from '@/services/admin.job.workSchedule';

type RecordType = API.Holiday & {
  date?: [moment.Moment, moment.Moment];
  days?: number;
  start_year?: number;
};

export const Holiday: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [dataNek, setData] = useState<RecordType[]>();
  const schedules = useAsyncData<API.Schedule[]>(async () => {
    const data = await allSchedules();
    actionRef.current?.reload();
    return data;
  });
  const access = useAccess();
  const localeFeature = intl.formatMessage({ id: 'property.holiday' });

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
      title: localeFeature,
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'property.for_schedule' }),
      dataIndex: 'schedule',
      renderText: (scheduleId) => schedules.data?.find((it) => it.id === scheduleId)?.name,
    },
    {
      title: intl.formatMessage({ id: 'property.year' }),
      dataIndex: 'start_year',
      filters: filterData(dataNek || [])((it) => it.start_year),
      onFilter: true,
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'property.time' }),
      dataIndex: 'start_date',
      width: 250,
      sorter: (a, b) => (moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1),
      renderText: (_, record) =>
        `${moment(record.start_date).format('DD MMM')} → ${moment(record.end_date).format(
          'DD MMM',
        )}`,
    },
    {
      title: intl.formatMessage({ id: 'property.numberOfDays' }),
      dataIndex: 'start_date',
      width: 150,
      align: 'right',
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
    },
    (access['change_holiday'] || access['delete_holiday']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 200,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_holiday']}>
            <Button
              title={`${intl.formatMessage({
                id: 'property.actions.update',
                defaultMessage: 'Update',
              })} ${localeFeature}`}
              size="small"
              onClick={() => {
                setCrudModalVisible('update');
                setSelectedRecord(record);
              }}
            >
              <EditOutlined />
            </Button>
          </Access>
          <Access accessible={access['delete_holiday']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteHoliday(record.id),
                  intl.formatMessage({
                    id: 'error.deleteSuccessfully',
                    defaultMessage: 'Delete successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.deleteUnsuccessfully',
                    defaultMessage: 'Delete unsuccessfully!',
                  }),
                );
              }}
            >
              <Button
                title={`${intl.formatMessage({
                  id: 'property.actions.delete',
                  defaultMessage: 'Delete',
                })} ${localeFeature}`}
                size="small"
                danger
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const tableSettings = useTableSettings();
  const dict = {
    title: {
      create: `${intl.formatMessage({
        id: 'property.actions.create',
        defaultMessage: 'Create',
      })} ${localeFeature}`,
      update: `${intl.formatMessage({
        id: 'property.actions.update',
        defaultMessage: 'Update',
      })} ${localeFeature}`,
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        {...tableSettings}
        className="card-shadow"
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['add_holiday']}>
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="property.actions.create" defaultMessage="New" />
            </Button>
          </Access>,
        ]}
        loading={schedules.isLoading ? true : undefined}
        request={async (query) => {
          let data: RecordType[] = await allHolidays();
          // if (query.start_date)
          //   data = data.filter((it) => (it.start_date as string).startsWith(query.start_date));
          data = data.map((it) => ({
            ...it,
            start_year: moment(it.start_date).year(),
          }));
          setData(data);
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
          const end_date = moment(value.date![1]);
          end_date.set({ hours: 23, minutes: 59 });
          const record = {
            ...value,
            ...selectedRecord,
            start_date: moment(value.date![0]),
            end_date,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createHoliday(record),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
              }),
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateHoliday(record.id, record),
              intl.formatMessage({
                id: 'error.updateSuccessfully',
                defaultMessage: 'Update successfully!',
              }),
              intl.formatMessage({
                id: 'error.updateUnsuccessfully',
                defaultMessage: 'Update unsuccessfully!',
              }),
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
        <ProFormText rules={[{ required: true }]} name="name" label={localeFeature} width="md" />
        <ProFormDateRangePicker
          rules={[{ required: true }]}
          name="date"
          label={intl.formatMessage({ id: 'property.time' })}
          width="md"
        />
        <ProFormSelect
          name="schedule"
          width="md"
          label={intl.formatMessage({ id: 'property.for_schedule' })}
          options={schedules.data?.map((it) => ({ value: it.id, label: it.name }))}
          hasFeedback={schedules.isLoading}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="days"
          label={intl.formatMessage({ id: 'property.numberOfDays' })}
          width="md"
          readonly
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Holiday;
