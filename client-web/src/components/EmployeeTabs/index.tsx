import { EmployeeDependent } from './EmployeeDependents';
import { EmployeeGeneral } from './EmployeeGeneral';
import { EmployeeJob } from './EmployeeJob';
import { EmployeePayroll } from './EmployeePayroll';
import { Card, Radio } from 'antd';
import React from 'react';
import { Access, history, Link } from 'umi';
import styles from '@/styles/employee_detail.less';
import { useEffect } from 'react';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';

export type OnChangeSubscription = {
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
  const { isActive, employeeId } = props;
  const {
    canViewGeneralTab,
    canViewJobTab,
    canViewPayrollTab,
    canViewDependentTab,
  } = useEmployeeDetailAccess({
    isActive,
    employeeId,
  });

  useEffect(() => {
    if (tab === undefined) history.replace('?tab=general');
  }, [tab]);

  return (
    <div className={styles.right}>
      <Card className="card-shadow">
        <Radio.Group
          value={tab}
          onChange={(e) => {
            history.location.query = e.target.value;
          }}
          className={styles.radioGroup}
        >
          <Access accessible={canViewGeneralTab}>
            <Link to="?tab=general">
              <Radio.Button value="general">GENERAL</Radio.Button>
            </Link>
          </Access>
          <Access accessible={canViewJobTab}>
            <Link to="?tab=job">
              <Radio.Button value="job">JOB</Radio.Button>
            </Link>
          </Access>
          <Access accessible={canViewPayrollTab}>
            <Link to="?tab=payroll">
              <Radio.Button value="payroll">PAYROLL</Radio.Button>
            </Link>
          </Access>
          <Access accessible={canViewDependentTab}>
            <Link to="?tab=dependent">
              <Radio.Button value="dependent">DEPENDENT</Radio.Button>
            </Link>
          </Access>
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
