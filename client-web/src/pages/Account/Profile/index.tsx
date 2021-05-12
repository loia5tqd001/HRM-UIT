import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { allJobs, readEmployee } from '@/services/employee';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React, { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from '@/styles/employee_detail.less';

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const id = initialState?.currentUser?.id;

  const [record, setRecord] = useState<API.Employee>();
  const [jobs, setJobs] = useState<API.EmployeeJob[]>();
  const [isActive, setIsActive] = useState(false);

  const getJobs = useCallback(() => {
    allJobs(id!)
      .then((fetchData) => setJobs(fetchData))
      .then(() => setIsActive(!jobs?.[0]?.is_terminated));
  }, [id, jobs]);

  useEffect(() => {
    readEmployee(id!).then((fetchData) => setRecord(fetchData));
    getJobs();
  }, [id, getJobs]);

  useEffect(() => {
    refresh();
  }, [record, refresh]);

  return (
    <PageContainer title="Profile" loading={!id}>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel employee={record} setEmployee={setRecord} type="account-profile" />
          <EmployeeTabs
            employeeId={id!}
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
