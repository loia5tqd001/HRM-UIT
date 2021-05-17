import { EmployeeDependent } from './EmployeeDependents';
import { EmployeeGeneral } from './EmployeeGeneral';
import { EmployeeJob } from './EmployeeJob';
import { EmployeePayroll } from './EmployeePayroll';
import { Card, Radio } from 'antd';
import React from 'react';
import { history, Link } from 'umi';
import styles from '@/styles/employee_detail.less';

type OnChangeSubscription = {
  status?: (newValue: API.Employee['status']) => any;
  basicInfo?: (newValue: API.Employee) => any;
  // other related subscription is not CURRENTLY needed
};

export type EmployeeTabProps = {
  employeeId: number;
  isActive: boolean;
  onChange?: OnChangeSubscription;
};

export const EmployeeTabs: React.FC<EmployeeTabProps> = (props) => {
  const { tab } = history.location.query as {
    tab: 'general' | 'job' | 'payroll' | 'dependent' | undefined;
  };
  if (tab === undefined) history.push('?tab=general');

  return (
    <div className={styles.right}>
      <Card>
        <Radio.Group
          value={tab}
          onChange={(e) => {
            history.location.query = e.target.value;
          }}
          className={styles.radioGroup}
        >
          <Link to="?tab=general">
            <Radio.Button value="general">GENERAL</Radio.Button>
          </Link>
          <Link to="?tab=job">
            <Radio.Button value="job">JOB</Radio.Button>
          </Link>
          <Link to="?tab=payroll">
            <Radio.Button value="payroll">PAYROLL</Radio.Button>
          </Link>
          <Link to="?tab=dependent">
            <Radio.Button value="dependent">DEPENDENT</Radio.Button>
          </Link>
        </Radio.Group>
      </Card>
      <div className={styles.tabContent}>
        {tab === 'general' && <EmployeeGeneral {...props} />}
        {tab === 'job' && <EmployeeJob {...props} />}
        {tab === 'payroll' && <EmployeePayroll {...props} />}
        {tab === 'dependent' && <EmployeeDependent {...props} />}
      </div>
    </div>
  );
};
