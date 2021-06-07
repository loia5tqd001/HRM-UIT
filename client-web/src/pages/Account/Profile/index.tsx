import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import type { OnChangeSubscription } from '@/components/EmployeeTabs';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { isEqual, merge } from 'lodash';
import React, { useEffect } from 'react';
import { useModel } from 'umi';

export const Edit: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const id = initialState?.currentUser?.id;
  const record = useAsyncData<API.Employee>(() => readEmployee(id!));

  const isActive = record.data?.status !== 'Terminated';

  useEffect(() => {
    if (!isEqual(record.data, initialState?.currentUser)) {
      setInitialState(merge(initialState, { currentUser: record.data }));
    }
  }, [record.data, initialState, setInitialState]);

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
    <PageContainer title={false} loading={!id}>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel
            employee={record.data}
            setEmployee={record.setData}
            onChange={onChange}
          />
          <EmployeeTabs employeeId={id!} isActive={isActive} onChange={onChange} />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
