import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { useModel } from 'umi';

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const id = initialState?.currentUser?.id;
  const record = useAsyncData<API.Employee>(() => readEmployee(id!));

  const isActive = record.data?.status !== 'Terminated';

  useEffect(() => {
    refresh();
  }, [record.data, refresh]);

  return (
    <PageContainer title="Profile" loading={!id}>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel
            employee={record.data}
            setEmployee={record.setData}
            type="account-profile"
          />
          <EmployeeTabs
            employeeId={id!}
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
