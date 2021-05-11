import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
import { __DEV__ } from '@/global';
import { calcHours, convertFromBackend } from '@/pages/Admin/Job/WorkSchedule';
import { allEmploymentStatuses } from '@/services/admin.job.employmentStatus';
import { allJobEvents } from '@/services/admin.job.jobEvent';
import { allJobTitles } from '@/services/admin.job.jobTitle';
import { allSchedules } from '@/services/admin.job.workSchedule';
import { allLocations } from '@/services/admin.organization.location';
import { allDepartments } from '@/services/admin.organization.structure';
import {
  allJobs,
  getSchedule,
  terminateEmployee,
  updateJob,
  updateSchedule,
} from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Checkbox, Form, message, Space, TimePicker, TreeSelect } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

type Props = {
  employeeId: number;
  isActive: boolean;
  onChange?: () => any;
};

export const EmployeeJob: React.FC<Props> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const [departments, setDepartments] = useState<API.DepartmentUnit[]>();
  const [jobTitles, setJobTitles] = useState<API.JobTitle[]>();
  const [schedules, setSchedules] = useState<API.Schedule[]>();
  const [locations, setLocations] = useState<API.Location[]>();
  const [employmentStatuses, setEmploymentStatuses] = useState<API.EmploymentStatus[]>();
  const [jobEvents, setJobEvents] = useState<API.JobEvent[]>();
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationForm] = useForm<API.TerminateContract>();
  const [scheduleForm] = useForm<API.EmployeeSchedule>();
  const jobs = useAsyncData<API.EmployeeJob[]>(() => allJobs(employeeId));
  const schedule = useAsyncData<API.EmployeeSchedule>(() => getSchedule(employeeId));

  useEffect(() => {
    allDepartments().then((fetchData) => setDepartments(fetchData));
    allJobTitles().then((fetchData) => setJobTitles(fetchData));
    allLocations().then((fetchData) => setLocations(fetchData));
    allEmploymentStatuses().then((fetchData) => setEmploymentStatuses(fetchData));
    allJobEvents().then((fetchData) => setJobEvents(fetchData));
    allSchedules().then((fetchData) => setSchedules(fetchData));
  }, []);

  const treeData = departments?.map((it) => ({
    id: it.id,
    pId: it.parent,
    value: it.id,
    title: it.name,
    isLeaf: departments.some((x) => x.parent === it.id),
  }));

  const columns: ProColumns<API.EmployeeJob>[] = [
    {
      title: <FormattedMessage id="pages.admin.job.column.timestamp" defaultMessage="Timestamp" />,
      dataIndex: 'timestamp',
      renderText: (it) => moment(it).format('YYYY-MM-DD hh:mm:ss'),
    },
    {
      title: (
        <FormattedMessage id="pages.admin.job.column.department" defaultMessage="Department" />
      ),
      dataIndex: 'department',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.jobTitle" defaultMessage="Job title" />,
      dataIndex: 'job_title',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.location" defaultMessage="Location" />,
      dataIndex: 'location',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.employmentStatus"
          defaultMessage="Employment status"
        />
      ),
      dataIndex: 'employment_status',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.probationStartDate"
          defaultMessage="Probation start date"
        />
      ),
      dataIndex: 'probation_start_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.probationEndDate"
          defaultMessage="Probation end date"
        />
      ),
      dataIndex: 'probation_end_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.contractStartDate"
          defaultMessage="Contract start date"
        />
      ),
      dataIndex: 'contract_start_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.contractEndDate"
          defaultMessage="Contract end date"
        />
      ),
      dataIndex: 'contract_end_date',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.event" defaultMessage="Event" />,
      dataIndex: 'event',
    },
  ];

  const scheduleDays = convertFromBackend(
    (schedule.data?.schedule as API.Schedule)?.workdays || [],
  );

  return (
    <>
      <Card loading={jobs.isLoading} title={isActive ? 'Job info' : 'Job Terminated'}>
        {jobs.data?.[0]?.is_terminated ? (
          <ProForm<API.TerminateContract>
            title="Termination Form"
            form={terminationForm}
            initialValues={jobs.data?.[0]}
            submitter={false}
          >
            <ProForm.Group>
              <ProFormText width="md" name="termination_reason" label="Reason" disabled />
              <ProFormDatePicker
                width="md"
                name="termination_date"
                label="Date"
                initialValue={moment()}
                disabled
              />
            </ProForm.Group>
            <ProFormTextArea width="md" name="termination_note" label="Note" disabled />
          </ProForm>
        ) : (
          <>
            <ProForm<API.EmployeeJob>
              onFinish={async (value) => {
                try {
                  value.owner = employeeId;
                  value.probation_start_date = moment(value.probation_start_date).format(
                    'YYYY-MM-DD',
                  );
                  value.probation_end_date = moment(value.probation_end_date).format('YYYY-MM-DD');
                  value.contract_start_date = moment(value.contract_start_date).format(
                    'YYYY-MM-DD',
                  );
                  value.contract_end_date = moment(value.contract_end_date).format('YYYY-MM-DD');
                  await updateJob(employeeId, value);
                  await jobs.fetchData();
                  onChange?.();
                  message.success('Updated successfully!');
                } catch {
                  message.error('Updated unsuccessfully!');
                }
              }}
              initialValues={jobs.data?.[0]}
              submitter={{
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            department: faker.helpers.randomize(
                              departments?.map((it) => it.name) || [],
                            ),
                            job_title: faker.helpers.randomize(
                              jobTitles?.map((it) => it.name) || [],
                            ),
                            location: faker.helpers.randomize(
                              locations?.map((it) => it.name) || [],
                            ),
                            employment_status: faker.helpers.randomize(
                              employmentStatuses?.map((it) => it.name) || [],
                            ),
                            probation_start_date: faker.date.recent(),
                            probation_end_date: faker.date.future(),
                            contract_start_date: faker.date.future(),
                            contract_end_date: faker.date.future(),
                            event: faker.helpers.randomize(jobEvents?.map((it) => it.name) || []),
                          });
                        }}
                      >
                        Auto fill
                      </Button>
                    ),
                    <Button key="terminate" danger onClick={() => setIsTerminating(true)}>
                      Terminate Contract
                    </Button>,
                  ];
                },
              }}
            >
              <ProForm.Group>
                <ProFormSelect
                  name="employment_status"
                  width="md"
                  label="Employment status"
                  options={employmentStatuses?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!employmentStatuses}
                  rules={[{ required: true }]}
                />
                <ProFormSelect
                  name="job_title"
                  width="md"
                  label="Job title"
                  options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!jobTitles}
                />
                <Form.Item name="department" label="Department">
                  <TreeSelect
                    treeDataSimpleMode
                    style={{ width: '100%', minWidth: 320 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeDefaultExpandAll
                    loading={!departments}
                    treeData={treeData}
                    placeholder="Please select"
                  />
                </Form.Item>
                <ProFormSelect
                  name="location"
                  width="md"
                  label="Location"
                  options={locations?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!locations}
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_start_date"
                  label="Probation start date"
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_end_date"
                  label="Probation end date"
                />
                <ProFormDatePicker
                  width="md"
                  name="contract_start_date"
                  label="Contract start date"
                />
                <ProFormDatePicker width="md" name="contract_end_date" label="Contract end date" />
                <ProFormSelect
                  name="event"
                  width="md"
                  label="Job event"
                  options={jobEvents?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!jobEvents}
                  rules={[{ required: true }]}
                />
              </ProForm.Group>
            </ProForm>
            <ModalForm<API.TerminateContract>
              title="Termination Form"
              width="400px"
              visible={isTerminating}
              onVisibleChange={(visible) => {
                setIsTerminating(visible);
                if (!visible) terminationForm.resetFields();
              }}
              form={terminationForm}
              onFinish={async (value) => {
                try {
                  await terminateEmployee(employeeId, {
                    ...value,
                    termination_date: moment(value.termination_date),
                  });
                  message.success('Terminate successfully!');
                  setIsTerminating(false);
                } catch {
                  message.error('Terminate unsuccessfully!');
                }
              }}
            >
              <ProFormText
                width="md"
                rules={[{ required: true }]}
                name="termination_reason"
                label="Reason"
              />
              <ProFormDatePicker
                rules={[{ required: true }]}
                width="md"
                name="termination_date"
                label="Date"
                initialValue={moment()}
              />
              <ProFormTextArea width="md" name="termination_note" label="Note" />
            </ModalForm>
          </>
        )}
      </Card>

      <Card loading={schedules === undefined || schedule.isLoading} title={`Work schedule`}>
        <ProForm<API.EmployeeSchedule>
          onFinish={async (value) => {
            try {
              value.schedule = (value.schedule as API.Schedule).name;
              value.owner = employeeId;
              await updateSchedule(employeeId, value);
              onChange?.();
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={schedule.data}
          submitter={isActive ? undefined : false}
          form={scheduleForm}
          onValuesChange={(changedValues) => {
            if (changedValues.schedule?.name) {
              const updatedSchedule = schedules?.find(
                (it) => it.name === changedValues.schedule?.name,
              );
              if (updatedSchedule)
                schedule.setData({
                  ...schedule.data,
                  schedule: updatedSchedule,
                });
            }
          }}
        >
          <ProFormSelect
            rules={[{ required: true }]}
            name={['schedule', 'name']}
            width="lg"
            label={`Work schedule  (${scheduleDays?.reduce(
              (acc, cur) => acc + calcHours(cur),
              0,
            )} hrs)`}
            options={schedules?.map((it) => ({ value: it.name, label: it.name }))}
            disabled={!isActive}
          />
          {isActive &&
            scheduleDays.map((it) => (
              <Form.Item
                name={it.day}
                label={`${it.day} (${calcHours(it)}hrs)`}
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 20 }}
                style={{ flexDirection: 'row' }}
              >
                <Space>
                  <Checkbox checked={it.morning_enabled}></Checkbox>
                  <TimePicker.RangePicker
                    format="HH:mm"
                    minuteStep={5}
                    style={{ width: '100%' }}
                    value={it.morning}
                    disabled={!it.morning_enabled}
                    open={false}
                  />
                  <Checkbox checked={it.afternoon_enabled}></Checkbox>
                  <TimePicker.RangePicker
                    format="HH:mm"
                    minuteStep={5}
                    style={{ width: '100%' }}
                    value={it.afternoon}
                    disabled={!it.afternoon_enabled}
                    open={false}
                  />
                  <p style={{ marginRight: 5 }}></p>
                </Space>
              </Form.Item>
            ))}
        </ProForm>
      </Card>

      <ProTable<API.EmployeeJob>
        headerTitle="Job history"
        rowKey="id"
        columns={columns}
        dataSource={jobs.data}
        loading={jobs.isLoading}
        search={false}
        style={{ width: '100%' }}
      />
    </>
  );
};
