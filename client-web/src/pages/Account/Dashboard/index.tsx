import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import { EmployeeTabs, OnChangeSubscription } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { isEqual } from 'lodash';
import React, { useEffect } from 'react';
import { useModel } from 'umi';

export const Edit: React.FC = () => {
  return (
    <PageContainer title={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title="Attendance" className="card-shadow"></Card>
        <Card title="Time Off" className="card-shadow"></Card>
        <div style={{ gridColumn: '1/-1' }}>
          <Card title="Pending Approval" className="card-shadow"></Card>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Card title="Analysis" className="card-shadow"></Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default Edit;
