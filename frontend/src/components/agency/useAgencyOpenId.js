// Hook สำหรับแปลงชื่อหน่วยงานเป็น open_id
import { useEffect, useState } from 'react';

export default function useAgencyOpenId(agencyName) {
  const [openId, setOpenId] = useState('');

  useEffect(() => {
    if (!agencyName) {
      setOpenId('');
      return;
    }
    fetch('http://localhost:5000/api/agency/confirmed-agencies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(a => a.agency_name === agencyName);
          setOpenId(found ? found.open_id : '');
        } else {
          setOpenId('');
        }
      })
      .catch(() => setOpenId(''));
  }, [agencyName]);

  return openId;
}
