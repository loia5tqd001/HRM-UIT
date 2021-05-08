import { allAttendances } from '@/services/attendance';
import {
  approveEmployeeAttendance,
  confirmEmployeeAttendance,
  getSchedule,
  rejectEmployeeAttendance,
  revertEmployeeAttendance,
} from '@/services/employee';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button, message, Progress, Space, Tooltip } from 'antd';
import { countBy, groupBy, mapValues, sumBy, uniq } from 'lodash';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { Link, useIntl } from 'umi';

type RecordType = API.AttendanceEmployee & {
  status?: {
    Pending: number;
    Approved: number;
    Rejected: number;
    Confirmed: number;
  };
  actual?: number;
  work_schedule?: number;
  attendances?: Record<string, number>;
};

export const toolbarButtons = [
  {
    action: 'Approve',
    icon: <CheckOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Pending',
    api: approveEmployeeAttendance,
    buttonProps: undefined,
  },
  {
    action: 'Reject',
    icon: <CloseOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Pending',
    api: rejectEmployeeAttendance,
    buttonProps: { danger: true },
  },
  {
    action: 'Revert',
    icon: <RollbackOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) =>
      it.status === 'Approved' || it.status === 'Rejected',
    api: revertEmployeeAttendance,
    buttonProps: undefined,
  },
  {
    action: 'Confirm',
    icon: <CheckCircleOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Approved',
    api: confirmEmployeeAttendance,
    buttonProps: { type: 'primary' },
  },
];

const EmployeeAttendance: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);
  const [attendanceKeys, setAttendanceKeys] = useState<string[]>([]);
  const backendData = useRef<any>();

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
    [actionRef],
  );

  const calcHours = ({
    morning_from,
    morning_to,
    afternoon_from,
    afternoon_to,
  }: API.Schedule['workdays'][0]) => {
    let hours = 0;
    if (morning_from && morning_to)
      hours += moment.duration(moment(morning_to).diff(moment(morning_from))).asHours() % 24;
    if (afternoon_from && afternoon_to)
      hours += moment.duration(moment(afternoon_to).diff(moment(afternoon_from))).asHours() % 24;
    return Number(hours.toFixed(1));
  };

  const formatDuration = (seconds: number) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${Math.floor(duration.asHours())}h${
      duration.minutes() ? `${duration.minutes()}m` : ''
    }`;
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Employee',
      fixed: 'left',
      key: 'employee',
      dataIndex: 'avatar',
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/attendance/list/${record.id}`}>
            {record.first_name} {record.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Actual/work schedule',
      fixed: 'left',
      key: 'actual',
      dataIndex: 'actual',
      renderText: (_, record) => {
        if (!record.actual || !record.work_schedule) return null;
        return (
          <div style={{ position: 'relative' }}>
            <Progress
              percent={(record.actual / record.work_schedule) * 100}
              showInfo={false}
              strokeWidth={20}
            />
            <div
              style={{
                position: 'absolute',
                left: 10,
                top: 2,
                color: '#151515',
                fontWeight: 600,
              }}
            >
              {formatDuration(record.actual)} / {formatDuration(record.work_schedule)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      fixed: 'left',
      dataIndex: 'status',
      key: 'status',
      width: 'max-content',
      renderText: (status) => {
        const symbols = {
          Pending: <Badge status="warning" />,
          Approved: <Badge status="success" />,
          Rejected: <Badge status="error" />,
          Confirmed: <LockOutlined style={{ color: '#52c41a' }} />,
        };
        return (
          <Space size="small">
            {Object.entries(status)
              .filter((it) => it[1])
              .map(([key, val]) => (
                <Tooltip title={`${val} ${key}`}>
                  <span style={{ display: 'inline-flex' }}>
                    {val}
                    <span style={{ marginLeft: 2 }}>{symbols[key]}</span>
                  </span>
                </Tooltip>
              ))}
          </Space>
        );
      },
    },
    ...attendanceKeys.map((it) => ({
      title: it,
      key: it,
      dataIndex: ['attendances', it],
      renderText: (seconds: number) => formatDuration(seconds),
    })),
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="Employee attendance"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        tableAlertRender={false}
        rowSelection={{
          onChange: (_, _selectedRows) => {
            setSelectedRows(_selectedRows);
          },
        }}
        toolBarRender={() => [
          ...toolbarButtons.map((toolbar) => (
            <Button
              onClick={async () => {
                const bulkAction = Promise.all(
                  selectedRows
                    .flatMap((it) => it.attendance)
                    .filter(toolbar.filter)
                    .map((it) => toolbar.api(it.owner, it.id)),
                );
                try {
                  await bulkAction;
                  message.success(`${toolbar.action} successfully!`);
                  actionRef.current?.reloadAndRest?.();
                } catch (err) {
                  message.error('Some error occurred!');
                }
              }}
              disabled={
                selectedRows.flatMap((it) => it.attendance).filter(toolbar.filter).length === 0
              }
              {...(toolbar.buttonProps as any)}
            >
              <Space>
                {toolbar.icon}
                {toolbar.action}
              </Space>
            </Button>
          )),
        ]}
        request={async () => {
          let data: RecordType[] = await allAttendances();
          setAttendanceKeys(
            uniq(
              data.flatMap((it) => it.attendance.flatMap((x) => moment(x.date).format('DD MMM'))),
            ),
          );

          const schedules = await Promise.all(
            data
              .filter((it) => it.attendance[0])
              .map(async (it) => {
                const employeeId = it.attendance[0].owner;
                return getSchedule(employeeId);
              }),
          );

          data = data
            .filter((it) => it.attendance.length)
            .map((it) => {
              let work_schedule = 0;
              if (it.attendance[0]?.owner) {
                work_schedule =
                  (schedules.find((x) => x.owner === it.attendance[0].owner)
                    ?.schedule as API.Schedule).workdays.reduce(
                    (acc, cur) => acc + calcHours(cur),
                    0,
                  ) * 3600;
              }
              return {
                ...it,
                status: {
                  Pending: countBy(it.attendance, (x) => x.status === 'Pending').true,
                  Approved: countBy(it.attendance, (x) => x.status === 'Approved').true,
                  Rejected: countBy(it.attendance, (x) => x.status === 'Rejected').true,
                  Confirmed: countBy(it.attendance, (x) => x.status === 'Confirmed').true,
                },
                actual: sumBy(it.attendance, (x) => x.actual_work_hours) * 3600,
                work_schedule,
                attendances: mapValues(
                  groupBy(
                    it.attendance.map((x) => ({
                      ...x,
                      date: moment(x.date).format('DD MMM'),
                      work_load: x.actual_work_hours * 3600,
                    })),
                    'date',
                  ),
                  (x) => x.reduce((acc, cur) => acc + cur.actual_work_hours * 3600, 0),
                ),
              };
            });

          return {
            success: true,
            data,
            total: data.length,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default EmployeeAttendance;
