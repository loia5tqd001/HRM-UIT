import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel/index';
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

  return (
    <PageContainer title={false} loading={record.isLoading}>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel
            employee={record.data}
            setEmployee={record.setData}
            type="employee-edit"
          />
          <EmployeeTabs
            employeeId={id}
            isActive={isActive}
            onChange={{
              status: (newStatus) => {
                if (!record.data) return;
                record.setData({ ...record.data, status: newStatus });
              },
              basicInfo: (newInfo) => {
                if (!record.data) return;
                record.setData({ ...record.data, ...newInfo, user: record.data.user });
              },
            }}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
