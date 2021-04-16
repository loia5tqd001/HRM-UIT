import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
import { __DEV__ } from '@/global';
import { allEmploymentStatuses } from '@/services/admin.job.employmentStatus';
import { allJobEvents } from '@/services/admin.job.jobEvent';
import { allJobTitles } from '@/services/admin.job.jobTitle';
import { allWorkSchedules } from '@/services/admin.job.workSchedule';
import { allLocations } from '@/services/admin.organization.location';
import { allDepartments } from '@/services/admin.organization.structure';
import ProForm, { ProFormDatePicker, ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, Card, Form, message, TreeSelect } from 'antd';
import faker from 'faker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

type Props = {
  jobs: API.EmployeeJob[] | undefined;
  jobSubmit: (value: API.EmployeeJob) => Promise<void>;
};

export const EmployeeJob: React.FC<Props> = (props) => {
  const { jobs, jobSubmit } = props;
  const [departments, setDepartments] = useState<API.DepartmentUnit[]>();
  const [jobTitles, setJobTitles] = useState<API.JobTitle[]>();
  const [workShifts, setWorkShifts] = useState<API.WorkSchedule[]>();
  const [locations, setLocations] = useState<API.Location[]>();
  const [employmentStatuses, setEmploymentStatuses] = useState<API.EmploymentStatus[]>();
  const [jobEvents, setJobEvents] = useState<API.JobEvent[]>();

  useEffect(() => {
    allDepartments().then((fetchData) => setDepartments(fetchData));
    allJobTitles().then((fetchData) => setJobTitles(fetchData));
    allWorkSchedules().then((fetchData) => setWorkShifts(fetchData));
    allLocations().then((fetchData) => setLocations(fetchData));
    allEmploymentStatuses().then((fetchData) => setEmploymentStatuses(fetchData));
    allJobEvents().then((fetchData) => setJobEvents(fetchData));
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
      title: <FormattedMessage id="pages.admin.job.column.workShift" defaultMessage="Work shift" />,
      dataIndex: 'work_shift',
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
  ];

  return (
    <>
      {/* // if jobs === undefined => currentJob is not loaded yet => loading
          // if jobs === [] => currentJob is fully loaded but not defined => not loading */}
      <Card loading={jobs === undefined} title="Job info">
        <ProForm<API.EmployeeJob>
          onFinish={async (value) => {
            try {
              await jobSubmit(value);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={jobs?.[0]}
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
                        job_title: faker.helpers.randomize(jobTitles?.map((it) => it.name) || []),
                        work_shift: faker.helpers.randomize(workShifts?.map((it) => it.name) || []),
                        location: faker.helpers.randomize(locations?.map((it) => it.name) || []),
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
              ];
            },
          }}
        >
          <ProForm.Group>
            <ProFormSelect
              name="employment_status"
              width="lg"
              label="Employment status"
              options={employmentStatuses?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!employmentStatuses}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="job_title"
              width="lg"
              label="Job title"
              options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!jobTitles}
            />
            <Form.Item name="department" label="Department">
              <TreeSelect
                treeDataSimpleMode
                style={{ width: '100%', minWidth: 440 }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeDefaultExpandAll
                loading={!departments}
                treeData={treeData}
                placeholder="Please select"
              />
            </Form.Item>
            <ProFormSelect
              name="work_shift"
              width="lg"
              label="Work shift"
              options={workShifts?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!workShifts}
            />
            <ProFormSelect
              name="location"
              width="lg"
              label="Location"
              options={locations?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!locations}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDatePicker
              width="lg"
              name="probation_start_date"
              label="Probation start date"
            />
            <ProFormDatePicker width="lg" name="probation_end_date" label="Probation end date" />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDatePicker width="lg" name="contract_start_date" label="Contract start date" />
            <ProFormDatePicker width="lg" name="contract_end_date" label="Contract end date" />
          </ProForm.Group>
          <ProFormSelect
            name="event"
            width="lg"
            label="Job event"
            options={jobEvents?.map((it) => ({ value: it.name, label: it.name }))}
            hasFeedback={!jobEvents}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Card>
      <ProTable<API.EmployeeJob>
        headerTitle="Job history"
        rowKey="id"
        columns={columns}
        dataSource={jobs}
        search={false}
        style={{ width: '100%' }}
      />
    </>
  );
};
