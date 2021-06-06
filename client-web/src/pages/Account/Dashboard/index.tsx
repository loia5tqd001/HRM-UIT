import { allAttendances, attendanceHelper } from '@/services/attendance';
import { getSchedule } from '@/services/employee';
import { allTimeoffs } from '@/services/timeOff';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import {
  CommentOutlined,
  HistoryOutlined,
  LockOutlined,
  MehOutlined,
  ScheduleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Avatar, Badge, Button, Card, Progress, Space, Tooltip } from 'antd';
import { countBy, groupBy, mapValues, sumBy } from 'lodash';
import moment from 'moment';
import React from 'react';
import { history, Link } from 'umi';

const CustomButton = ({ icon: Icon, text, ...props }) => {
  return (
    <Button
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '200%',
        fontSize: '1.5em',
        marginRight: 24,
        marginBottom: 24,
        ...props.style,
      }}
    >
      <Icon style={{ fontSize: '1.5em', marginTop: '0.1em' }} />
      <span style={{ marginRight: '0.3em', fontWeight: 200 }}>{text}</span>
    </Button>
  );
};

const formatDuration = (seconds: number) => {
  const duration = moment.duration(seconds, 'seconds');
  return `${Math.floor(duration.asHours())}h${duration.minutes() ? `${duration.minutes()}m` : ''}`;
};

const columns: ProColumns<any>[] = [
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
];

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

export const Edit: React.FC = () => {
  const attendanceInfo = useAsyncData<API.AttendanceHelper>(attendanceHelper);
  return (
    <PageContainer title={false}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Card title="Quick Actions" className="card-shadow" loading={attendanceInfo.isLoading}>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: -24 }}>
            <CustomButton
              icon={HistoryOutlined}
              type="primary"
              text="Clock In / Out"
              onClick={() => history.push('/attendance/me?action=nextStep')}
            />
            <CustomButton
              icon={MehOutlined}
              className="primary-outlined-button"
              text="Submit Timeoff Request"
              onClick={() => history.push('/timeOff/me?action=new')}
            />
            <CustomButton
              icon={ScheduleOutlined}
              className="primary-outlined-button"
              text="View My Attendance"
              onClick={() => history.push('/attendance/me')}
            />
            <CustomButton
              icon={TableOutlined}
              className="primary-outlined-button"
              text="View My Time Off Requests"
              onClick={() => history.push('/timeOff/me')}
            />
            <CustomButton
              icon={CommentOutlined}
              className="primary-outlined-button"
              text="See Messages"
              onClick={() => history.push('/message/conversation')}
            />
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ProTable<any>
            className="card-shadow"
            headerTitle="Pending Timeoff Requests"
            rowKey="id"
            search={false}
            request={async () => {
              const data = await allTimeoffs();
              return {
                data: data.filter((it) => it.status === 'Pending'),
                success: true,
              };
            }}
            toolBarRender={() => [
              <Button type="primary" onClick={() => history.push('/timeOff/list')}>
                View all
              </Button>,
            ]}
            columns={[
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
              },
              {
                title: 'Timeoff type',
                dataIndex: 'time_off_type',
              },
              {
                title: 'Start date',
                dataIndex: 'start_date',
                valueType: 'date',
              },
              {
                title: 'End date',
                dataIndex: 'end_date',
                valueType: 'date',
              },
            ]}
            pagination={{ pageSize: 5, simple: true }}
          />
          <ProTable<any>
            className="card-shadow"
            headerTitle="Pending Attendance Requests"
            rowKey="id"
            search={false}
            request={async () => {
              let data: any[] = await allAttendances();

              const schedules = await Promise.all(
                data
                  .filter((it) => it.attendance[0])
                  .map(async (it) => {
                    const employeeId = it.attendance[0].owner;
                    return getSchedule(employeeId);
                  }),
              );

              data = data
                // .filter((it) => it.attendance.length)
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
            toolBarRender={() => [
              <Button type="primary" onClick={() => history.push('/attendance/list')}>
                View all
              </Button>,
            ]}
            columns={columns}
            pagination={{ pageSize: 5, simple: true }}
          />
        </div>
        <Card title="Analysis" className="card-shadow"></Card>
      </div>
    </PageContainer>
  );
};

export default Edit;
