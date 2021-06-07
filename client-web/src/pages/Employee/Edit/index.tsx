import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel/index';
import type { OnChangeSubscription } from '@/components/EmployeeTabs';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React from 'react';
import { useParams } from 'react-router';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const record = useAsyncData<API.Employee>(() => readEmployee(id!));

  const isActive = record.data?.status !== 'Terminated';

  const onChange: OnChangeSubscription = {
    status: (newStatus) => {
      if (!record.data) return;
      record.setData({ ...record.data, status: newStatus });
    },
    basicInfo: (newInfo) => {
      if (!record.data) return;
      record.setData({ ...record.data, ...newInfo, user: record.data.user });
    },
  };

  return (
    <PageContainer title={false} loading={record.isLoading}>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel
            employee={record.data}
            setEmployee={record.setData}
            onChange={onChange}
          />
          <EmployeeTabs employeeId={id} isActive={isActive} onChange={onChange} />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
