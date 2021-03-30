import { allEmployees } from '@/services/employee';
import { useEffect, useState } from 'react';

export default function useEmployee() {
  const [employees, setEmployees] = useState<API.EmployeeOnList[]>([]);
  const [employeesPending, setEmployeesPending] = useState(false);

  useEffect(() => {
    setEmployeesPending(true);
    allEmployees()
      .then((data) => {
        if (data?.length > 0) {
          setEmployees(data);
        }
      })
      .finally(() => {
        setEmployeesPending(false);
      });
  }, []);

  return {
    employees,
    employeesPending,
  };
}
