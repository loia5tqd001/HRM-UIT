import { allAttendances, allPeriods } from '@/services/attendance';
import {
  approveEmployeeAttendance,
  confirmEmployeeAttendance,
  rejectEmployeeAttendance,
  revertEmployeeAttendance,
} from '@/services/employee';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { CheckOutlined, CloseOutlined, LockOutlined, RollbackOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button, message, Progress, Select, Space, Tooltip } from 'antd';
import { countBy, groupBy, mapValues, sumBy } from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Access, FormattedMessage, getIntl, Link, useAccess, useIntl, useModel } from 'umi';

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
    // action: 'Approve',
    action: getIntl().formatMessage({ id: 'property.actions.approve' }),
    icon: <CheckOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Pending',
    api: approveEmployeeAttendance,
    buttonProps: undefined,
    access: 'can_approve_attendance',
  },
  {
    // action: 'Reject',
    action: getIntl().formatMessage({ id: 'property.actions.reject' }),
    icon: <CloseOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Pending',
    api: rejectEmployeeAttendance,
    buttonProps: { danger: true },
    access: 'can_reject_attendance',
  },
  {
    // action: 'Revert',
    action: getIntl().formatMessage({ id: 'property.actions.revert' }),
    icon: <RollbackOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) =>
      it.status === 'Approved' || it.status === 'Rejected',
    api: revertEmployeeAttendance,
    buttonProps: undefined,
    access: 'can_revert_attendance',
  },
  {
    // action: 'Confirm',
    action: getIntl().formatMessage({ id: 'property.actions.confirm' }),
    icon: <LockOutlined />,
    filter: (it: API.AttendanceEmployee['attendance'][0]) => it.status === 'Approved',
    api: confirmEmployeeAttendance,
    buttonProps: { type: 'primary' },
    access: 'can_confirm_attendance',
  },
];

const EmployeeAttendance: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);
  const [attendanceKeys, setAttendanceKeys] = useState<string[]>([]);
  const [periods, setPeriods] = useState<API.Period[]>();
  const [selectedPeriod, setSelectedPeriod] = useState<API.Period['id']>();
  const access = useAccess();
  const { numberOfAttendanceNeedSupport } = useModel('firebaseTalk');
  const currentUserId = useModel('@@initialState').initialState!.currentUser!.id;

  useEffect(() => {
    allPeriods()
      .then((fetchData) => fetchData.reverse())
      .then((fetchData) => {
        setSelectedPeriod(fetchData[0]?.id);
        setPeriods(fetchData);
        actionRef.current?.reload();
      });
  }, []);

  useEffect(() => {
    const getDaysBetweenDates = (startDate: moment.Moment, endDate: moment.Moment) => {
      const now = startDate.clone();
      const dates: string[] = [];

      while (now.isSameOrBefore(endDate)) {
        dates.push(now.format('DD/MM/YYYY'));
        now.add(1, 'days');
      }
      return dates;
    };

    if (selectedPeriod) {
      const selectedPeriodObject = periods?.find((it) => it.id === selectedPeriod);
      if (!selectedPeriodObject) return;
      setAttendanceKeys(
        getDaysBetweenDates(
          moment(selectedPeriodObject.start_date),
          moment(selectedPeriodObject.end_date),
        ),
      );
    }
  }, [selectedPeriod, periods]);

  const formatDuration = (seconds: number) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${Math.floor(duration.asHours())}h${
      duration.minutes() ? `${duration.minutes()}m` : ''
    }`;
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.employee' }),
      fixed: 'left',
      key: 'employee',
      dataIndex: 'avatar',
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <Badge count={numberOfAttendanceNeedSupport(record.id)}>
            <span>{avatar}</span>
          </Badge>
          <Link to={`/attendance/list/${record.id}?period=${selectedPeriod}`}>
            {record.first_name} {record.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'property.actualWorkSchedule' }),
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
      title: <FormattedMessage id="property.status" defaultMessage="Status" />,
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
                <Tooltip title={`${val} ${key}`} key={key}>
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
      title: moment(it, 'DD/MM/YYYY').format('DD MMM'),
      key: it,
      dataIndex: ['attendances', it],
      renderText: (seconds: number) =>
        seconds ? (
          <span className="colorPrimary" style={{ fontWeight: 600 }}>
            {formatDuration(seconds)}
          </span>
        ) : (
          <span style={{ fontWeight: 100 }}>{formatDuration(seconds)}</span>
        ),
    })),
  ];

  const tableSettings = useTableSettings();

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        {...tableSettings}
        className="card-shadow"
        headerTitle={intl.formatMessage({ id: 'property.employeeAttendance' })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        tableAlertRender={false}
        rowSelection={
          toolbarButtons.reduce((acc, cur) => acc || access[cur.access], false) && {
            onChange: (_, _selectedRows) => {
              setSelectedRows(_selectedRows);
            },
          }
        }
        toolBarRender={() => [
          <Select<number>
            loading={!periods}
            style={{ minWidth: 100 }}
            value={selectedPeriod}
            onChange={(value) => {
              setSelectedPeriod(value);
              actionRef.current?.reload();
            }}
          >
            {periods?.map((it) => (
              <Select.Option value={it.id} key={it.id}>
                {moment(it.start_date).format('DD MMM YYYY')} →{' '}
                {moment(it.end_date).format('DD MMM YYYY')}
              </Select.Option>
            ))}
          </Select>,
          ...toolbarButtons.map((toolbar) => (
            <Access accessible={access[toolbar.access]} key={toolbar.access}>
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
                    message.success(
                      intl.formatMessage({
                        id: 'error.updateSuccessfully',
                        defaultMessage: 'Update successfully!',
                      }),
                    );
                    actionRef.current?.reloadAndRest?.();
                  } catch (err) {
                    message.error(
                      intl.formatMessage({
                        id: 'error.updateUnsuccessfully',
                        defaultMessage: 'Update unsuccessfully!',
                      }),
                    );
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
            </Access>
          )),
        ]}
        loading={periods === undefined ? true : undefined}
        request={async () => {
          let data: RecordType[] = await allAttendances({
            params: { period_id: selectedPeriod },
          });

          // setAttendanceKeys(
          //   uniq(
          //     data.flatMap((it) => it.attendance.flatMap((x) => moment(x.date).format('DD/MM/YYYY'))),
          //   ),
          // );

          data = data
            .filter((it) => it.id !== currentUserId)
            .map((it) => {
              return {
                ...it,
                status: {
                  Pending: countBy(it.attendance, (x) => x.status === 'Pending').true,
                  Approved: countBy(it.attendance, (x) => x.status === 'Approved').true,
                  Rejected: countBy(it.attendance, (x) => x.status === 'Rejected').true,
                  Confirmed: countBy(it.attendance, (x) => x.status === 'Confirmed').true,
                },
                actual: sumBy(it.attendance, (x) => x.actual_work_hours) * 3600,
                work_schedule: it.schedule_hours * 3600,
                attendances: mapValues(
                  groupBy(
                    it.attendance.map((x) => ({
                      ...x,
                      date: moment(x.date).format('DD/MM/YYYY'),
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
