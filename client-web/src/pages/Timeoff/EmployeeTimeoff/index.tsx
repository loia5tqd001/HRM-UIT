import {
  approveEmployeeTimeoff,
  cancelEmployeeTimeoff,
  rejectEmployeeTimeoff
} from '@/services/employee';
import { allTimeoffs } from '@/services/timeOff';
import { filterData } from '@/utils/utils';
import { CheckOutlined, CloseOutlined, EnterOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Avatar, Button, message, Popconfirm, Space } from 'antd';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { useIntl } from 'umi';

type RecordType = API.TimeoffRequest & {
  off_days?: [moment.Moment, moment.Moment];
  days?: number;
};

export const Timeoff: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [dataNek, setData] = useState<RecordType[]>();

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
      title: 'Employee',
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
      title: 'Timeoff type',
      dataIndex: 'time_off_type',
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.time_off_type),
    },
    {
      title: 'Start date',
      dataIndex: 'start_date',
      valueType: 'date',
      sorter: (a, b) => (moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1),
    },
    {
      title: 'End date',
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: 'Number of days',
      dataIndex: 'days',
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      hideInForm: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.status),
      valueEnum: {
        Approved: {
          text: 'Approved',
          status: 'Success',
        },
        Pending: {
          text: 'Pending',
          status: 'Warning',
        },
        Cancelled: {
          text: 'Cancelled',
          status: 'Default',
        },
        Canceled: {
          text: 'Canceled',
          status: 'Default',
        },
        Rejected: {
          text: 'Rejected',
          status: 'Error',
        },
      },
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Popconfirm
            placement="right"
            title={'Approve this request?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => approveEmployeeTimeoff(record.owner.id, record.id),
                'Approved successfully!',
                'Cannot approve this request!',
              );
            }}
            disabled={record.status !== 'Pending'}
          >
            <Button
              title="Approve this request"
              size="small"
              type="default"
              disabled={record.status !== 'Pending'}
            >
              <CheckOutlined />
            </Button>
          </Popconfirm>
          <Popconfirm
            placement="right"
            title={'Reject this request?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => rejectEmployeeTimeoff(record.owner.id, record.id),
                'Rejected successfully!',
                'Cannot reject this request!',
              );
            }}
            disabled={record.status !== 'Pending'}
          >
            <Button
              title="Reject this request"
              size="small"
              danger
              disabled={record.status !== 'Pending'}
            >
              <CloseOutlined />
            </Button>
          </Popconfirm>
          <Popconfirm
            placement="right"
            title={'Cancel this request?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => cancelEmployeeTimeoff(record.owner.id, record.id),
                'Canceled successfully!',
                'Cannot cancel this request!',
              );
            }}
            disabled={record.status !== 'Approved'}
          >
            <Button
              title="Cancel this request"
              size="small"
              danger
              disabled={record.status !== 'Approved'}
            >
              <EnterOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        headerTitle="Timeoff Requests"
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
