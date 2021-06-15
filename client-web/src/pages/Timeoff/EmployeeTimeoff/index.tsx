import {
  approveEmployeeTimeoff,
  cancelEmployeeTimeoff,
  rejectEmployeeTimeoff,
} from '@/services/employee';
import { allTimeoffs } from '@/services/timeOff';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { filterData } from '@/utils/utils';
import { CheckOutlined, CloseOutlined, EnterOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Avatar, Button, message, Popconfirm, Space } from 'antd';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { useIntl, useAccess, Access, FormattedMessage } from 'umi';

type RecordType = API.TimeoffRequest & {
  off_days?: [moment.Moment, moment.Moment];
  days?: number;
};

export const Timeoff: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [dataNek, setData] = useState<RecordType[]>();
  const access = useAccess();
  const localeFeature = intl.formatMessage({
    id: 'property.timeoffRequest',
  });
  const tableSettings = useTableSettings();

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

  const mapStatus = {
    Approved: {
      text: intl.formatMessage({ id: 'property.status.Approved' }),
      status: 'Success',
    },
    Pending: {
      text: intl.formatMessage({ id: 'property.status.Pending' }),
      status: 'Warning',
    },
    Cancelled: {
      text: intl.formatMessage({ id: 'property.status.Cancelled' }),
      status: 'Default',
    },
    Canceled: {
      text: intl.formatMessage({ id: 'property.status.Canceled' }),
      status: 'Default',
    },
    Rejected: {
      text: intl.formatMessage({ id: 'property.status.Rejected' }),
      status: 'Error',
    },
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.employee' }),
      dataIndex: ['owner', 'id'],
      render: (avatar, record) => (
        <Space>
          <span>
            <Avatar src={record.owner.avatar} />
          </span>
          <span>
            {record.owner.first_name} {record.owner.last_name}
          </span>
        </Space>
      ),
      onFilter: true,
      filters: filterData(dataNek || [])(
        (it) => it.owner.id,
        (it) => `${it.owner.first_name} ${it.owner.last_name}`,
      ),
    },
    {
      title: intl.formatMessage({ id: 'property.timeoffType' }),
      dataIndex: 'time_off_type',
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.time_off_type),
    },
    {
      title: intl.formatMessage({ id: 'property.start_date' }),
      dataIndex: 'start_date',
      valueType: 'date',
      sorter: (a, b) => (moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1),
    },
    {
      title: intl.formatMessage({ id: 'property.end_date' }),
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: intl.formatMessage({ id: 'property.numberOfDays' }),
      dataIndex: 'days',
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
    },
    {
      title: intl.formatMessage({ id: 'property.note' }),
      dataIndex: 'note',
      hideInForm: true,
    },
    {
      title: intl.formatMessage({ id: 'property.status' }),
      dataIndex: 'status',
      hideInForm: true,
      onFilter: true,
      filters: filterData(dataNek || [])(
        (it) => it.status,
        (it) => mapStatus[it.status].text,
      ),
      valueEnum: mapStatus,
    },
    (access['can_approve_timeoff'] || access['can_reject_timeoff']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['can_approve_timeoff']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({ id: 'property.actions.approve' })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => approveEmployeeTimeoff(record.owner.id, record.id),
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }}
              disabled={record.status !== 'Pending'}
            >
              <Button
                title={`${intl.formatMessage({
                  id: 'property.actions.approve',
                })} ${localeFeature}?`}
                size="small"
                type="default"
                disabled={record.status !== 'Pending'}
              >
                <CheckOutlined />
              </Button>
            </Popconfirm>
          </Access>
          <Access accessible={access['can_reject_timeoff']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({ id: 'property.actions.reject' })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => rejectEmployeeTimeoff(record.owner.id, record.id),
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }}
              disabled={record.status !== 'Pending'}
            >
              <Button
                title={`${intl.formatMessage({ id: 'property.actions.reject' })} ${localeFeature}?`}
                size="small"
                danger
                disabled={record.status !== 'Pending'}
              >
                <CloseOutlined />
              </Button>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        {...tableSettings}
        className="card-shadow"
        headerTitle={intl.formatMessage({ id: 'property.employeeRequests' })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={async () => {
          const data = await allTimeoffs();
          setData(data);
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Timeoff;
