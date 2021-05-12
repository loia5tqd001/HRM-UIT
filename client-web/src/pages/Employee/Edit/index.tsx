import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel/index';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { allJobs, readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const [record, setRecord] = useState<API.Employee>();
  const [jobs, setJobs] = useState<API.EmployeeJob[]>();
  const [isActive, setIsActive] = useState(false);

  const getJobs = useCallback(() => {
    allJobs(id)
      .then((fetchData) => setJobs(fetchData))
      .then(() => setIsActive(!jobs?.[0]?.is_terminated));
  }, [id, jobs]);

  useEffect(() => {
    readEmployee(id).then((fetchData) => setRecord(fetchData));
    getJobs();
  }, [id, getJobs]);

  return (
    <PageContainer title="Edit employee">
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel employee={record} setEmployee={setRecord} type="employee-edit" />
          <EmployeeTabs
            employeeId={id}
            isActive={isActive}
            onChange={(active) => {
              if (active !== undefined) setIsActive(active);
            }}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
